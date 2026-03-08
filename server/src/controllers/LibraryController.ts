import { Request, Response } from 'express';
import { ILibraryService } from '../interfaces/ILibraryService';

/**
 * LibraryController (OOP Implementation)
 * Provides HTTP endpoints for managing subjects and topics.
 * Uses constructor-based Dependency Injection.
 */
export class LibraryController {
    constructor(private libraryService: ILibraryService) {}

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
     * POST /api/library/subjects
     * Body: { driveId, name }
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
     * Body: { driveId, subjectName, topicName }
     */
    public createTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, subjectName, topicName } = req.body;

            if (!driveId || !subjectName || !topicName) {
                res.status(400).json({ message: 'Missing required parameters (driveId, subjectName, topicName).' });
                return;
            }

            const topic = await this.libraryService.createTopic(userId, driveId, subjectName, topicName);
            res.status(201).json(topic);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
