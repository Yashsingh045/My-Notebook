import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { IDriveService, DriveChild } from '../interfaces/IDriveService';
import { encryptionService } from './EncryptionService';
import prisma from '../config/db';
import { buildReadmePdf, TAB_README_BODY } from '../utils/makeReadmePdf';

export const TAB_NAMES = ['Studies', 'Internships', 'Jobs', 'Archive'] as const;
export type TabName = (typeof TAB_NAMES)[number];

/**
 * DriveService (OOP Implementation)
 * Handles Google Drive vault structure, metadata, and per-user client factories.
 */
export class DriveService implements IDriveService {
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    public async getDriveClient(userId: string, driveId: string): Promise<drive_v3.Drive> {
        const userDrive = await prisma.userDrive.findFirst({
            where: { id: driveId, userId },
        });

        if (!userDrive) throw new Error('UserDrive connection not found.');

        const oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials({
            refresh_token: encryptionService.decrypt(userDrive.encryptedRefreshToken),
        });

        return google.drive({ version: 'v3', auth: oAuth2Client });
    }

    public async initUserDrive(
        userId: string,
        gmailAccount: string,
        refreshToken: string,
        isPrimary: boolean = false
    ): Promise<any> {
        const oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        // 1. Create root "My-Notebook" folder
        const rootFolder = await drive.files.create({
            requestBody: { name: 'My-Notebook', mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id',
        });
        const rootFolderId = rootFolder.data.id!;

        // 2. Create the 4 sidebar tab folders + seed readme.pdf into each
        const folderIds: Record<string, string> = {};
        for (const tab of TAB_NAMES) {
            const folder = await drive.files.create({
                requestBody: {
                    name: tab,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootFolderId],
                },
                fields: 'id',
            });
            const tabFolderId = folder.data.id!;
            folderIds[tab] = tabFolderId;

            await this.uploadReadmePdf(drive, tab, tabFolderId);
        }

        // 3. Create _metadata.json
        const metadataContent = JSON.stringify({
            version: 2,
            folders: folderIds,
            createdAt: new Date().toISOString(),
        });
        await drive.files.create({
            requestBody: { name: '_metadata.json', parents: [rootFolderId] },
            media: { mimeType: 'application/json', body: metadataContent },
            fields: 'id',
        });

        // 4. Quota
        const storageInfo = await drive.about.get({ fields: 'storageQuota' });
        const quota = storageInfo.data.storageQuota!;

        // 5. Persist to DB
        const userDrive = await prisma.userDrive.create({
            data: {
                userId,
                gmailAccount,
                encryptedRefreshToken: encryptionService.encrypt(refreshToken),
                isPrimary,
                rootFolderId,
                spaceUsed: BigInt(quota.usage || 0),
                spaceTotal: BigInt(quota.limit || 0),
            },
        });

        return userDrive;
    }

    public async readDriveMetadata(userId: string, driveId: string): Promise<any> {
        const drive = await this.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });

        const files = await drive.files.list({
            q: `name = '_metadata.json' and '${userDrive!.rootFolderId}' in parents and trashed = false`,
            fields: 'files(id)',
        });

        const fileId = files.data.files?.[0]?.id;
        if (!fileId) throw new Error('Metadata file not found in Drive vault.');

        const content = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
        return JSON.parse(content.data as string);
    }

    public async writeDriveMetadata(userId: string, driveId: string, metadata: object): Promise<void> {
        const drive = await this.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });

        const files = await drive.files.list({
            q: `name = '_metadata.json' and '${userDrive!.rootFolderId}' in parents and trashed = false`,
            fields: 'files(id)',
        });

        const fileId = files.data.files?.[0]?.id;
        if (!fileId) throw new Error('Cannot update metadata: File ID missing.');

        await drive.files.update({
            fileId,
            media: { mimeType: 'application/json', body: JSON.stringify(metadata) },
        });
    }

    public async createFolder(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string> {
        const drive = await this.getDriveClient(userId, driveId);
        const folder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            },
            fields: 'id',
        });
        return folder.data.id!;
    }

    public async getFolderIdByName(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string | null> {
        const drive = await this.getDriveClient(userId, driveId);
        const files = await drive.files.list({
            q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`,
            fields: 'files(id)',
            spaces: 'drive',
        });
        return files.data.files?.[0]?.id || null;
    }

    public async uploadFile(
        userId: string,
        driveId: string,
        fileName: string,
        fileContent: Buffer,
        mimeType: string,
        parentFolderId: string
    ): Promise<string> {
        const drive = await this.getDriveClient(userId, driveId);
        const stream = Readable.from(fileContent);
        const file = await drive.files.create({
            requestBody: { name: fileName, parents: [parentFolderId] },
            media: { mimeType, body: stream },
            fields: 'id',
        });
        return file.data.id!;
    }

    public async uploadFileStream(
        userId: string,
        driveId: string,
        fileName: string,
        mimeType: string,
        body: Readable,
        parentFolderId: string
    ): Promise<DriveChild> {
        const drive = await this.getDriveClient(userId, driveId);
        const file = await drive.files.create({
            requestBody: { name: fileName, parents: [parentFolderId] },
            media: { mimeType, body },
            fields: 'id, name, mimeType, size, webViewLink, modifiedTime',
        });
        return this.mapFileResource(file.data);
    }

    public async listFolders(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<any[]> {
        const drive = await this.getDriveClient(userId, driveId);
        const files = await drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`,
            fields: 'files(id, name, createdTime, modifiedTime)',
            spaces: 'drive',
        });
        return files.data.files || [];
    }

    public async listFolderChildren(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<DriveChild[]> {
        const drive = await this.getDriveClient(userId, driveId);
        const files = await drive.files.list({
            q: `'${parentFolderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, size, webViewLink, modifiedTime)',
            orderBy: 'folder,name',
            pageSize: 1000,
        });
        return (files.data.files || [])
            .filter((f) => f.name !== '_metadata.json')
            .map((f) => this.mapFileResource(f));
    }

    public async deleteFile(userId: string, driveId: string, fileId: string): Promise<void> {
        const drive = await this.getDriveClient(userId, driveId);
        await drive.files.delete({ fileId });
    }

    public async downloadFile(
        userId: string,
        driveId: string,
        fileId: string
    ): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; name: string; size?: string }> {
        const drive = await this.getDriveClient(userId, driveId);
        const meta = await drive.files.get({
            fileId,
            fields: 'name, mimeType, size',
        });
        const media = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return {
            stream: media.data as unknown as NodeJS.ReadableStream,
            mimeType: meta.data.mimeType || 'application/octet-stream',
            name: meta.data.name || 'file',
            size: meta.data.size || undefined,
        };
    }

    /**
     * Ensures the vault has the 4 tab folders and a readme.pdf in each.
     * Used to self-heal drives created before this feature existed.
     * Returns the tab → folderId map. Also rewrites _metadata.json if it changed.
     */
    public async ensureTabsAndReadmes(
        userId: string,
        driveId: string
    ): Promise<Record<string, string>> {
        const drive = await this.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });
        if (!userDrive?.rootFolderId) throw new Error('Drive not initialized.');
        const rootFolderId = userDrive.rootFolderId;

        let metadata: any = { version: 2, folders: {} };
        try {
            metadata = await this.readDriveMetadata(userId, driveId);
            if (!metadata.folders) metadata.folders = {};
        } catch {
            // metadata missing — will be created below
        }

        let metadataChanged = false;

        for (const tab of TAB_NAMES) {
            // Resolve tab folder id — verify the one in metadata still exists.
            let tabFolderId = metadata.folders[tab] as string | undefined;
            if (tabFolderId) {
                try {
                    await drive.files.get({ fileId: tabFolderId, fields: 'id, trashed' });
                } catch {
                    tabFolderId = undefined;
                }
            }
            if (!tabFolderId) {
                const existing = await drive.files.list({
                    q: `name = '${tab}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed = false`,
                    fields: 'files(id)',
                });
                tabFolderId = existing.data.files?.[0]?.id || undefined;
            }
            if (!tabFolderId) {
                const folder = await drive.files.create({
                    requestBody: {
                        name: tab,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [rootFolderId],
                    },
                    fields: 'id',
                });
                tabFolderId = folder.data.id!;
            }
            if (metadata.folders[tab] !== tabFolderId) {
                metadata.folders[tab] = tabFolderId;
                metadataChanged = true;
            }

            // Ensure readme.pdf exists inside the tab folder.
            const readmeList = await drive.files.list({
                q: `name = 'readme.pdf' and '${tabFolderId}' in parents and trashed = false`,
                fields: 'files(id)',
            });
            if (!readmeList.data.files?.[0]?.id) {
                await this.uploadReadmePdf(drive, tab, tabFolderId);
            }
        }

        // Ensure _metadata.json exists; create if missing.
        const metaList = await drive.files.list({
            q: `name = '_metadata.json' and '${rootFolderId}' in parents and trashed = false`,
            fields: 'files(id)',
        });
        const metaId = metaList.data.files?.[0]?.id;
        if (!metaId) {
            await drive.files.create({
                requestBody: { name: '_metadata.json', parents: [rootFolderId] },
                media: { mimeType: 'application/json', body: JSON.stringify(metadata) },
                fields: 'id',
            });
        } else if (metadataChanged) {
            await drive.files.update({
                fileId: metaId,
                media: { mimeType: 'application/json', body: JSON.stringify(metadata) },
            });
        }

        return metadata.folders;
    }

    private async uploadReadmePdf(
        drive: drive_v3.Drive,
        tab: string,
        parentFolderId: string
    ): Promise<void> {
        const body = TAB_README_BODY[tab] || [
            `This is your ${tab} vault. Create folders here to organize your work.`,
        ];
        const pdfBuffer = buildReadmePdf(`${tab} — README`, body);
        await drive.files.create({
            requestBody: {
                name: 'readme.pdf',
                parents: [parentFolderId],
                mimeType: 'application/pdf',
            },
            media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
            fields: 'id',
        });
    }

    private mapFileResource(f: drive_v3.Schema$File): DriveChild {
        const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
        return {
            id: f.id!,
            name: f.name!,
            type: isFolder ? 'folder' : 'file',
            mimeType: f.mimeType || undefined,
            size: f.size || undefined,
            webViewLink: f.webViewLink || undefined,
            modifiedTime: f.modifiedTime || undefined,
        };
    }
}

// Export singleton for use in other services
export const driveService = new DriveService();
