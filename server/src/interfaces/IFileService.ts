// ─── IFileService Contract ────────────────────────────────────
// Defines the operations for managing physical assets (PDFs, 
// images, videos) within the user's private Google Drive vault.
// ─────────────────────────────────────────────────────────────

import { Readable } from 'stream';

export interface FileMetadata {
    id: string;
    name: string;
    mimeType: string;
    size: string;
    webViewLink?: string;
}

export interface IFileService {
    /**
     * Uploads a file stream directly to a topic's /files folder.
     */
    uploadFile(
        userId: string,
        driveId: string,
        topicId: string,
        name: string,
        mimeType: string,
        stream: Readable
    ): Promise<FileMetadata>;

    /**
     * Lists all assets inside a topic's /files subfolder.
     */
    listFiles(userId: string, driveId: string, topicId: string): Promise<FileMetadata[]>;

    /**
     * Deletes an asset from the Drive vault.
     */
    deleteFile(userId: string, driveId: string, fileId: string): Promise<void>;

    /**
     * Generates a temporary redirect URL for viewing the file.
     */
    getFileUrl(userId: string, driveId: string, fileId: string): Promise<string>;
}
