import prisma from '../config/db';

export type ActivityAction =
    | 'create-folder'
    | 'upload-file'
    | 'create-note'
    | 'save-note'
    | 'delete-file'
    | 'add-drive'
    | 'remove-drive'
    | 'update-username';

/**
 * ActivityService
 * Records user-visible events into the ActivityLog table.
 * Call sites are best-effort — a failed log never blocks the main flow.
 */
export class ActivityService {
    public async log(
        userId: string,
        action: ActivityAction,
        targetName: string,
        targetId?: string | null,
        details?: string | null
    ): Promise<void> {
        try {
            // Dedup: at most one entry per (user, action, targetId) per calendar day.
            // A second save/upload/create of the same item in the same day is
            // treated as a continuation — noise, not news.
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const existing = await prisma.activityLog.findFirst({
                where: {
                    userId,
                    action,
                    targetId: targetId ?? null,
                    createdAt: { gte: startOfDay },
                },
                select: { id: true },
            });
            if (existing) return;

            await prisma.activityLog.create({
                data: {
                    userId,
                    action,
                    targetName,
                    targetId: targetId ?? null,
                    details: details ?? null,
                },
            });
        } catch (err) {
            console.warn('[ActivityService] failed to log', action, err);
        }
    }

    public async list(userId: string, limit = 500) {
        return prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 1000),
        });
    }
}

export const activityService = new ActivityService();
