import { Request, Response } from 'express';
import { ILibraryService } from '../interfaces/ILibraryService';
import { IDriveService } from '../interfaces/IDriveService';
import prisma from '../config/db';
import { TAB_NAMES } from '../services/DriveService';

/**
 * LibraryController (OOP Implementation)
 * Provides HTTP endpoints for managing the vault hierarchy.
 * Uses constructor-based Dependency Injection.
 */
export class LibraryController {
    constructor(
        private libraryService: ILibraryService,
        private driveService: IDriveService
    ) {}

    /**
     * GET /api/library
     * Query Params: driveId (required)
     */
    public getLibrary = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId } = req.query;
            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }
            const library = await this.libraryService.getLibrary(userId, driveId as string);
            res.json(library);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/library/tabs?driveId=...
     * Self-heals the 4 standard tab folders + readmes, then returns the
     * complete list of top-level folders (standard + user-created) so the
     * sidebar can render every tab dynamically.
     */
    public getTabs = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId } = req.query;
            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }
            const driveIdStr = driveId as string;

            const standardFolders = await this.driveService.ensureTabsAndReadmes(
                userId,
                driveIdStr
            );
            const userDrive = await prisma.userDrive.findUnique({ where: { id: driveIdStr } });
            if (!userDrive?.rootFolderId) {
                res.status(400).json({ message: 'Drive not initialized.' });
                return;
            }

            const children = await this.driveService.listFolderChildren(
                userId,
                driveIdStr,
                userDrive.rootFolderId
            );
            const standardSet = new Set<string>(TAB_NAMES as readonly string[]);
            const tabs = children
                .filter((c) => c.type === 'folder')
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    isStandard: standardSet.has(c.name),
                }));

            res.json({
                rootFolderId: userDrive.rootFolderId,
                folders: standardFolders,
                tabs,
            });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * POST /api/library/subjects
     */
    public createSubject = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, name } = req.body;
            if (!driveId || !name) {
                res.status(400).json({ message: 'Missing driveId or subject name.' });
                return;
            }
            const subject = await this.libraryService.createSubject(userId, driveId, name);
            res.status(201).json(subject);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * POST /api/library/topics
     */
    public createTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, subjectName, topicName } = req.body;
            if (!driveId || !subjectName || !topicName) {
                res.status(400).json({
                    message: 'Missing required parameters (driveId, subjectName, topicName).',
                });
                return;
            }
            const topic = await this.libraryService.createTopic(
                userId,
                driveId,
                subjectName,
                topicName
            );
            res.status(201).json(topic);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
