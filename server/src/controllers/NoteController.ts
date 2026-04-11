import { Request, Response } from 'express';
import { INoteService } from '../interfaces/INoteService';

/**
 * NoteController (OOP Implementation)
 * Provides HTTP endpoints for Note CRUD operations.
 * Uses constructor-based Dependency Injection.
 */
export class NoteController {
    constructor(private noteService: INoteService) {}

    /**
     * POST /api/notes
     * Body: { driveId, topicId, title, content, tags }
     */
    public createNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, topicId, title, content, tags } = req.body;

            if (!driveId || !topicId || !title) {
                res.status(400).json({ message: 'Missing required parameters (driveId, topicId, title).' });
                return;
            }

            const note = await this.noteService.createNote(userId, driveId, topicId, title, content, tags || []);
            res.status(201).json(note);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/notes/:id
     * Query Params: driveId (required)
     */
    public getNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { driveId } = req.query;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            const note = await this.noteService.getNote(userId, driveId as string, id as string);
            res.json(note);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * PATCH /api/notes/:id
     * Body: { driveId, title, content, tags }
     */
    public updateNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { driveId, title, content, tags } = req.body;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            await this.noteService.updateNote(userId, driveId as string, id as string, { title, content, tags });
            res.json({ message: 'Note updated successfully.' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * DELETE /api/notes/:id
     * Query Params: driveId (required)
     */
    public deleteNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { driveId } = req.query;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            await this.noteService.deleteNote(userId, driveId as string, id as string);
            res.json({ message: 'Note deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/notes/topic/:topicId
     * Query Params: driveId (required)
     */
    public listByTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { topicId } = req.params;
            const { driveId } = req.query;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            const notes = await this.noteService.listNotes(userId, driveId as string, topicId as string);
            res.json(notes);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
