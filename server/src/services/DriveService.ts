import { google, drive_v3 } from 'googleapis';
import { IDriveService } from '../interfaces/IDriveService';
import { encryptionService } from './EncryptionService';
import prisma from '../config/db';

/**
 * DriveService (OOP Implementation)
 * Handles Google Drive vault structure, metadata, and per-user client factories.
 */
export class DriveService implements IDriveService {
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    /**
     * Build an authenticated Drive v3 client for a user/drive combo.
     */
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

    /**
     * Initializes the standard "My-Notebook/" folder hierarchy.
     */
    public async initUserDrive(
        userId: string,
        gmailAccount: string,
        refreshToken: string,
        isPrimary: boolean = false
    ): Promise<any> {
        const oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        // 1. Create root folder "My-Notebook"
        const rootFolder = await drive.files.create({
            requestBody: { name: 'My-Notebook', mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id',
        });
        const rootFolderId = rootFolder.data.id!;

        // 2. Create sidebar tab folders
        const folderNames = ['Studies', 'Internships', 'Jobs', 'Archive'];
        const folderIds: { [key: string]: string } = {};

        for (const folderName of folderNames) {
            const folder = await drive.files.create({
                requestBody: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootFolderId],
                },
                fields: 'id',
            });
            folderIds[folderName] = folder.data.id!;
        }

        // 3. Create _metadata.json with folder references
        const metadataContent = JSON.stringify({ 
            version: 1, 
            folders: folderIds,
            createdAt: new Date().toISOString()
        });
        await drive.files.create({
            requestBody: { name: '_metadata.json', parents: [rootFolderId] },
            media: { mimeType: 'application/json', body: metadataContent },
            fields: 'id',
        });

        // 4. Sync Quota info
        const storageInfo = await drive.about.get({ fields: 'storageQuota' });
        const quota = storageInfo.data.storageQuota!;

        // 5. Persist to DB using EncryptionService for the token
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

    /**
     * Reads the _metadata.json file from the user's Drive.
     */
    public async readDriveMetadata(userId: string, driveId: string): Promise<any> {
        const drive = await this.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });

        const files = await drive.files.list({
            q: `name = '_metadata.json' and '${userDrive!.rootFolderId}' in parents`,
            fields: 'files(id)',
        });

        const fileId = files.data.files?.[0]?.id;
        if (!fileId) throw new Error('Metadata file not found in Drive vault.');

        const content = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
        return JSON.parse(content.data as string);
    }

    /**
     * Writes changes back to _metadata.json.
     */
    public async writeDriveMetadata(userId: string, driveId: string, metadata: object): Promise<void> {
        const drive = await this.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });

        const files = await drive.files.list({
            q: `name = '_metadata.json' and '${userDrive!.rootFolderId}' in parents`,
            fields: 'files(id)',
        });

        const fileId = files.data.files?.[0]?.id;
        if (!fileId) throw new Error('Cannot update metadata: File ID missing.');

        await drive.files.update({
            fileId,
            media: { mimeType: 'application/json', body: JSON.stringify(metadata) },
        });
    }

    /**
     * Creates a new folder in a specific parent folder
     */
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

    /**
     * Gets a folder ID by name within a parent folder
     */
    public async getFolderIdByName(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string | null> {
        const drive = await this.getDriveClient(userId, driveId);

        const files = await drive.files.list({
            q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents`,
            fields: 'files(id)',
            spaces: 'drive',
        });

        return files.data.files?.[0]?.id || null;
    }

    /**
     * Uploads a file to Google Drive
     */
    public async uploadFile(
        userId: string,
        driveId: string,
        fileName: string,
        fileContent: Buffer,
        mimeType: string,
        parentFolderId: string
    ): Promise<string> {
        const drive = await this.getDriveClient(userId, driveId);

        const file = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [parentFolderId],
            },
            media: {
                mimeType,
                body: fileContent,
            },
            fields: 'id',
        });

        return file.data.id!;
    }

    /**
     * Lists folders in a parent folder
     */
    public async listFolders(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<any[]> {
        const drive = await this.getDriveClient(userId, driveId);

        const files = await drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents`,
            fields: 'files(id, name, createdTime, modifiedTime)',
            spaces: 'drive',
        });

        return files.data.files || [];
    }
}

// Export singleton for use in other services
export const driveService = new DriveService();
