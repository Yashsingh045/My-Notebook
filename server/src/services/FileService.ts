import { Readable } from 'stream';
import { IFileService, FileMetadata } from '../interfaces/IFileService';
import { IDriveService } from '../interfaces/IDriveService';

/**
 * FileService (OOP Implementation)
 * Orchestrates direct streaming of assets (PDFs, images, videos)
 * from the Node.js server to the user's Google Drive.
 */
export class FileService implements IFileService {
    constructor(private driveService: IDriveService) {}

    /**
     * Uploads a file stream directly to a topic's /files folder.
     */
    public async uploadFile(
        userId: string,
        driveId: string,
        topicId: string,
        name: string,
        mimeType: string,
        stream: Readable
    ): Promise<FileMetadata> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        // 1. Find the "files" subfolder inside the topic folder
        const folderList = await drive.files.list({
            q: `'${topicId}' in parents and name = 'files' and trashed = false`,
            fields: 'files(id)',
        });
        const filesFolderId = folderList.data.files?.[0]?.id;
        if (!filesFolderId) throw new Error('Topic "files" subfolder not found in Drive vault.');

        // 2. Perform the stream-based upload to Google Drive
        const response = await drive.files.create({
            requestBody: {
                name,
                mimeType,
                parents: [filesFolderId],
            },
            media: {
                mimeType,
                body: stream,
            },
            fields: 'id, name, mimeType, size, webViewLink'
        });

        const file = response.data;
        return {
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            size: file.size || '0',
            webViewLink: file.webViewLink || undefined
        };
    }

    /**
     * Lists all assets inside a topic's /files subfolder.
     */
    public async listFiles(userId: string, driveId: string, topicId: string): Promise<FileMetadata[]> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        // 1. Find the "files" subfolder ID
        const folderList = await drive.files.list({
            q: `'${topicId}' in parents and name = 'files' and trashed = false`,
            fields: 'files(id)',
        });
        const filesFolderId = folderList.data.files?.[0]?.id;
        if (!filesFolderId) return [];

        // 2. List all non-folder files in that subfolder
        const fileList = await drive.files.list({
            q: `'${filesFolderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name, mimeType, size, webViewLink)',
            orderBy: 'name'
        });

        return (fileList.data.files || []).map(file => ({
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            size: file.size || '0',
            webViewLink: file.webViewLink || undefined
        }));
    }

    /**
     * Deletes an asset from the Drive vault.
     */
    public async deleteFile(userId: string, driveId: string, fileId: string): Promise<void> {
        const drive = await this.driveService.getDriveClient(userId, driveId);
        await drive.files.delete({ fileId });
    }

    /**
     * Generates a direct web link for the file (proxy or web view).
     */
    public async getFileUrl(userId: string, driveId: string, fileId: string): Promise<string> {
        const drive = await this.driveService.getDriveClient(userId, driveId);
        const file = await drive.files.get({ fileId, fields: 'webViewLink' });
        return file.data.webViewLink || '';
    }
}
