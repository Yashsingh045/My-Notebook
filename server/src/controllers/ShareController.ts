import { Request, Response } from 'express';
import { IShareService } from '../interfaces/IShareService';

/**
 * ShareController (OOP Implementation)
 * Provides HTTP endpoints for link sharing and public content resolution.
 */
export class ShareController {
    constructor(private shareService: IShareService) {}

    /**
     * POST /api/share
     * Body: { driveId, noteId, ttlSeconds }
     */
    public shareNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, noteId, ttlSeconds } = req.body;

            if (!driveId || !noteId) {
                res.status(400).json({ message: 'Missing driveId or noteId.' });
                return;
            }

            const shareUrl = await this.shareService.shareNote(userId, driveId, noteId, ttlSeconds);
            res.status(201).json({ shareUrl });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/share/:id (Public)
     * No 'protect' middleware needed for viewing.
     */
    public getSharedContent = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const content = await this.shareService.getSharedContent(id as string);
            res.json(content);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg.includes('expired')) {
                res.status(410).json({ message: msg });
            } else {
                res.status(404).json({ message: msg });
            }
        }
    };

    /**
     * DELETE /api/share/:id
     */
    public revokeShare = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            await this.shareService.revokeShare(userId, id as string);
            res.json({ message: 'Share link revoked successfully.' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/share/manage
     */
    public listMyShares = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const shares = await this.shareService.listUserShares(userId);
            res.json(shares);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
