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
}
