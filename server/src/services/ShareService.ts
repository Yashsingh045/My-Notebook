import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db';
import { IShareService, SharedNoteResult } from '../interfaces/IShareService';
import { IDriveService } from '../interfaces/IDriveService';
import { INoteService } from '../interfaces/INoteService';

/**
 * ShareService (OOP Implementation)
 * Manages the generation, expiry, and content resolution of public sharing links.
 * Uses secure tokens for public resolution to protect internal primary keys.
 */
export class ShareService implements IShareService {
    constructor(
        private driveService: IDriveService,
        private noteService: INoteService
    ) {}

    /**
     * Generates a unique, tracked sharing link for a note.
     */
    public async shareNote(
        userId: string,
        driveId: string,
        noteId: string,
        ttlSeconds?: number
    ): Promise<string> {
        // Calculate expiration if TTL is provided
        const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;

        // Create the record in the database
        // We use driveAccountId and driveFileId to match the reconstructed Prisma schema
        const sharedLink = await prisma.sharedLink.create({
            data: {
                userId,
                token: uuidv4(),
                driveAccountId: driveId,
                driveFileId: noteId,
                expiresAt,
            }
        });

        // Resolve return URL (In a production app, use actual base URL)
        const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
        return `${baseUrl}/api/share/${sharedLink.token}`;
    }

    /**
     * Resolves a public share TOKEN into the note's content.
     */
    public async getSharedContent(token: string): Promise<SharedNoteResult> {
        // 1. Fetch the sharing record by its secure TOKEN
        const sharedLink = await prisma.sharedLink.findUnique({
            where: { token },
            include: { user: { select: { username: true } } }
        });

        if (!sharedLink) throw new Error('Sharing link not found.');

        // 2. Check Expiration (TTL)
        if (sharedLink.expiresAt && sharedLink.expiresAt < new Date()) {
            throw new Error('This sharing link has expired.');
        }

        // 3. Resolve Content from Google Drive
        // Note: We use the owner's credentials to fetch the note
        const note = await this.noteService.getNote(
            sharedLink.userId, 
            sharedLink.driveAccountId, 
            sharedLink.driveFileId
        );

        // 4. Increment View Count (Background)
        prisma.sharedLink.update({
            where: { id: sharedLink.id },
            data: { viewCount: { increment: 1 } }
        }).catch(err => console.error('Failed to increment view count:', err));

        return {
            title: note.title,
            content: note.content,
            ownerName: sharedLink.user.username,
            expiresAt: sharedLink.expiresAt ? sharedLink.expiresAt : null
        };
    }

    /**
     * Terminates a public sharing link immediately.
     */
    public async revokeShare(userId: string, shareId: string): Promise<void> {
        // We allow revocation via the internal ID for management purposes
        const link = await prisma.sharedLink.findFirst({
            where: { id: shareId, userId }
        });

        if (!link) throw new Error('Link not found or not owned by user.');

        await prisma.sharedLink.delete({ where: { id: shareId } });
    }

    /**
     * Lists all active sharing links for a user.
     */
    public async listUserShares(userId: string): Promise<any[]> {
        return await prisma.sharedLink.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
