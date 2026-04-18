import { Router, Request, Response } from 'express';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const q = (req.query.q as string | undefined) || '';
        const driveId = req.query.driveId as string | undefined;
        if (!driveId) {
            res.status(400).json({ message: 'Missing driveId.' });
            return;
        }
        if (q.trim().length < 2) {
            res.json([]);
            return;
        }
        const results = await driveService.searchVault(userId, driveId, q.trim(), 25);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

export default router;
