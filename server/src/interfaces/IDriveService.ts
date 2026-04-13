// ─── IDriveService Contract ───────────────────────────────────
// Defines the operations for managing the user's personal vault
// on Google Drive, including initialisation and metadata syncing.
// ─────────────────────────────────────────────────────────────

import { drive_v3 } from 'googleapis';

export interface IDriveService {
    /**
     * Initializes the standard "My-Notebook/" folder structure.
     */
    initUserDrive(
        userId: string, 
        gmailAccount: string, 
        refreshToken: string, 
        isPrimary?: boolean
    ): Promise<any>;

    /**
     * Retrieves the lightweight metadata from the user's Drive.
     */
    readDriveMetadata(userId: string, driveId: string): Promise<any>;

    /**
     * Synchronizes metadata back to the user's Drive.
     */
    writeDriveMetadata(userId: string, driveId: string, metadata: object): Promise<void>;

    /**
     * Builds an authenticated Google Drive client for a user.
     */
    getDriveClient(userId: string, driveId: string): Promise<drive_v3.Drive>;

    /**
     * Creates a new folder in a specific parent folder
     */
    createFolder(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string>;

    /**
     * Gets a folder ID by name within a parent folder
     */
    getFolderIdByName(
        userId: string,
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<string | null>;

    /**
     * Uploads a file to Google Drive
     */
    uploadFile(
        userId: string,
        driveId: string,
        fileName: string,
        fileContent: Buffer,
        mimeType: string,
        parentFolderId: string
    ): Promise<string>;

    /**
     * Lists folders in a parent folder
     */
    listFolders(
        userId: string,
        driveId: string,
        parentFolderId: string
    ): Promise<any[]>;
}
