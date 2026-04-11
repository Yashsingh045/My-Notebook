import api from '../api/axios';

/**
 * ShareService (Frontend OOP Implementation)
 * Manages the generation and lifecycle of secure, expiring public vault links.
 */
export class ShareService {
    /**
     * Creates a new public share link for a note.
     * @param driveId The vault ID
     * @param noteId The file ID in Drive
     * @param expiresIn Hours until link expiration
     */
    public async createShareLink(driveId: string, noteId: string, expiresIn: number = 24) {
        const response = await api.post('/share', { 
            driveId, 
            noteId, 
            expiresIn 
        });
        return response.data; // Returns { shareUrl, accessCode }
    }

    /**
     * Lists all active shares for the current user.
     */
    public async listActiveShares() {
        const response = await api.get('/share/active');
        return response.data;
    }

    /**
     * Revokes a specific share link immediately.
     */
    public async revokeShare(shareId: string) {
        const response = await api.delete(`/share/${shareId}`);
        return response.data;
    }
}

// Export singleton instance
export const shareService = new ShareService();
