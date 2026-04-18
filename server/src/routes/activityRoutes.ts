import { Router, Request, Response } from 'express';
import { activityService } from '../services/ActivityService';
import prisma from '../config/db';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const limit = Math.max(1, Math.min(1000, Number(req.query.limit) || 500));
        const [entries, user] = await Promise.all([
            activityService.list(userId, limit),
            prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, createdAt: true },
            }),
        ]);
        res.json({
            username: user?.username || 'user',
            accountCreatedAt: user?.createdAt || null,
            entries,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

export default router;
