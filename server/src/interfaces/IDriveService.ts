// ─── IDriveService Contract ───────────────────────────────────
// Defines the operations for managing the user's personal vault
// on Google Drive, including initialisation and metadata syncing.
// ─────────────────────────────────────────────────────────────

import { drive_v3 } from 'googleapis';
import { Readable } from 'stream';

export interface DriveChild {
    id: string;
    name: string;
    type: 'file' | 'folder';
    mimeType?: string;
    size?: string;
    webViewLink?: string;
    modifiedTime?: string;
}

export interface IDriveService {
    initUserDrive(
        userId: string,
        gmailAccount: string,
        refreshToken: string,
        isPrimary?: boolean
    ): Promise<any>;

    readDriveMetadata(userId: string, driveId: string): Promise<any>;

    writeDriveMetadata(userId: string, driveId: string, metadata: object): Promise<void>;

    getDriveClient(userId: string, driveId: string): Promise<drive_v3.Drive>;

    createFolder(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string>;

    getFolderIdByName(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string | null>;

    uploadFile(
        userId: string,
        driveId: string,
        fileName: string,
        fileContent: Buffer,
        mimeType: string,
        parentFolderId: string
    ): Promise<string>;

    uploadFileStream(
        userId: string,
        driveId: string,
        fileName: string,
        mimeType: string,
        body: Readable,
        parentFolderId: string
    ): Promise<DriveChild>;

    listFolders(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<any[]>;

    listFolderChildren(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<DriveChild[]>;

    deleteFile(userId: string, driveId: string, fileId: string): Promise<void>;

    updateFileContent(
        userId: string,
        driveId: string,
        fileId: string,
        mimeType: string,
        body: Buffer | string
    ): Promise<DriveChild>;

    downloadFile(
        userId: string,
        driveId: string,
        fileId: string
    ): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; name: string; size?: string }>;

    ensureTabsAndReadmes(
        userId: string,
        driveId: string
    ): Promise<Record<string, string>>;
}
