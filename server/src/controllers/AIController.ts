import { Request, Response } from 'express';
import { IAIService } from '../interfaces/IAIService';
import { INoteService } from '../interfaces/INoteService';

/**
 * AIController (OOP Implementation)
 * Provides HTTP endpoints for intelligent note features.
 * Injects IAIService and INoteService to handle business logic.
 */
export class AIController {
    constructor(
        private aiService: IAIService,
        private noteService: INoteService
    ) {}

    /**
     * POST /api/ai/mcqs
     * Body: { driveId, noteId }
     */
    public generateMCQs = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, noteId } = req.body;

            if (!driveId || !noteId) {
                res.status(400).json({ message: 'Missing driveId or noteId.' });
                return;
            }

            // 1. Fetch note content from Drive via NoteService
            const note = await this.noteService.getNote(userId, driveId, noteId);
            
            // 2. Generate MCQs using AI (with caching)
            const mcqs = await this.aiService.generateMCQs(userId, noteId, JSON.stringify(note.content));
            
            res.json(mcqs);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * POST /api/ai/summarize
     * Body: { driveId, noteId }
     */
    public summarizeNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, noteId } = req.body;

            if (!driveId || !noteId) {
                res.status(400).json({ message: 'Missing driveId or noteId.' });
                return;
            }

            // 1. Fetch note content
            const note = await this.noteService.getNote(userId, driveId, noteId);
            
            // 2. Generate Summary
            const summary = await this.aiService.summarizeNote(userId, noteId, JSON.stringify(note.content));
            
            res.json(summary);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * POST /api/ai/chat
     * Body: { driveId, noteId, message, history }
     */
    public chatWithNote = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, noteId, message, history } = req.body;

            if (!driveId || !noteId || !message) {
                res.status(400).json({ message: 'Missing driveId, noteId, or user message.' });
                return;
            }

            // 1. Fetch note content
            const note = await this.noteService.getNote(userId, driveId, noteId);
            
            // 2. Conduct Chat Interaction
            const aiResponse = await this.aiService.chatWithNote(
                userId, 
                noteId, 
                JSON.stringify(note.content), 
                message, 
                history || []
            );
            
            res.json({ response: aiResponse });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
