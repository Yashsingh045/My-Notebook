import { Request, Response } from 'express';
import prisma from '../config/db';
import { IDriveService } from '../interfaces/IDriveService';
import { activityService } from '../services/ActivityService';

/**
 * DrivesController
 * Exposes the authenticated user's connected Google Drive accounts.
 */
export class DrivesController {
    constructor(private driveService: IDriveService) {}

    /**
     * GET /api/drives
     * Returns every UserDrive for the current user with fresh quota info.
     * Quota is re-synced from Google so the UI reflects true usage.
     */
    public list = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const drives = await prisma.userDrive.findMany({
                where: { userId, isActive: true },
                orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
            });

            const refreshed = await Promise.all(
                drives.map(async (d) => {
                    let spaceUsed = d.spaceUsed;
                    let spaceTotal = d.spaceTotal;
                    try {
                        const client = await this.driveService.getDriveClient(userId, d.id);
                        const quotaRes = await client.about.get({ fields: 'storageQuota' });
                        const q = quotaRes.data.storageQuota || {};
                        spaceUsed = BigInt(q.usage || 0);
                        spaceTotal = BigInt(q.limit || 0);
                        await prisma.userDrive.update({
                            where: { id: d.id },
                            data: { spaceUsed, spaceTotal },
                        });
                    } catch {
                        // leave cached quota
                    }
                    return {
                        id: d.id,
                        gmailAccount: d.gmailAccount,
                        isPrimary: d.isPrimary,
                        rootFolderId: d.rootFolderId,
                        spaceUsed: spaceUsed.toString(),
                        spaceTotal: spaceTotal.toString(),
                        createdAt: d.createdAt,
                    };
                })
            );
            res.json(refreshed);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * DELETE /api/drives/:id
     * Disconnects a drive. Refuses to remove the last active drive.
     */
    public disconnect = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const id = req.params.id as string;
            const count = await prisma.userDrive.count({
                where: { userId, isActive: true },
            });
            if (count <= 1) {
                res.status(400).json({
                    message: 'Cannot remove your only connected Drive.',
                });
                return;
            }
            const drive = await prisma.userDrive.findFirst({ where: { id, userId } });
            if (!drive) {
                res.status(404).json({ message: 'Drive not found.' });
                return;
            }
            await prisma.userDrive.update({
                where: { id },
                data: { isActive: false },
            });
            // If we just disconnected the primary, promote another
            if (drive.isPrimary) {
                const next = await prisma.userDrive.findFirst({
                    where: { userId, isActive: true },
                    orderBy: { createdAt: 'asc' },
                });
                if (next) {
                    await prisma.userDrive.update({
                        where: { id: next.id },
                        data: { isPrimary: true },
                    });
                }
            }
            await activityService.log(
                userId,
                'remove-drive',
                drive.gmailAccount,
                drive.id
            );
            res.json({ message: 'Drive disconnected.' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
