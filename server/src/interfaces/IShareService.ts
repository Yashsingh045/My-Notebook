// ─── IShareService Contract ───────────────────────────────────
// Defines the operations for managing secure, expiring public links
// for private notes stored in the digital vault.
// ─────────────────────────────────────────────────────────────

export interface SharedNoteResult {
    title: string;
    content: any;
    ownerName: string;
    expiresAt: Date | null;
}

export interface IShareService {
    /**
     * Generates a unique, tracked sharing link for a note.
     * @param ttlSeconds Optional time-to-live in seconds.
     */
    shareNote(
        userId: string, 
        driveId: string, 
        noteId: string, 
        ttlSeconds?: number
    ): Promise<string>;

    /**
     * Resolves a public share ID into the note's content.
     * Checks for expiration and increments view count.
     */
    getSharedContent(shareId: string): Promise<SharedNoteResult>;

    /**
     * Terminates a public sharing link immediately.
     */
    revokeShare(userId: string, shareId: string): Promise<void>;

    /**
     * Lists all active sharing links for a user.
     */
    listUserShares(userId: string): Promise<any[]>;
}
