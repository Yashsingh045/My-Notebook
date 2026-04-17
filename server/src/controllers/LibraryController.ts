import { Request, Response } from 'express';
import { ILibraryService } from '../interfaces/ILibraryService';
import { IDriveService } from '../interfaces/IDriveService';

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
     * Returns { Studies: folderId, Internships: folderId, Jobs: folderId, Archive: folderId }.
     * Self-heals the vault: creates missing tabs and seeds readme.pdf if missing.
     */
    public getTabs = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId } = req.query;
            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }
            const folders = await this.driveService.ensureTabsAndReadmes(
                userId,
                driveId as string
            );
            res.json({ folders });
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
