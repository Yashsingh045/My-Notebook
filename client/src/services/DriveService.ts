import api from '../api/axios';

export interface ConnectedDrive {
    id: string;
    gmailAccount: string;
    isPrimary: boolean;
    rootFolderId: string | null;
    spaceUsed: string; // stringified BigInt
    spaceTotal: string; // stringified BigInt
    createdAt: string;
}

/**
 * DriveService (Frontend OOP)
 * Manages the user's connected Google Drive accounts.
 */
export class DriveService {
    public async list(): Promise<ConnectedDrive[]> {
        const response = await api.get('/drives');
        return response.data;
    }

    public async disconnect(driveId: string): Promise<void> {
        await api.delete(`/drives/${driveId}`);
    }
}

export const driveService = new DriveService();
