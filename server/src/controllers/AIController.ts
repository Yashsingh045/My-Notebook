import { Request, Response } from 'express';
import { IAIService } from '../interfaces/IAIService';
import { INoteService } from '../interfaces/INoteService';
import { IDriveService } from '../interfaces/IDriveService';
import { AIService, type AssistAction } from '../services/AIService';
import { extractDriveFileText } from '../utils/driveTextExtract';

/**
 * AIController (OOP Implementation)
 * Provides HTTP endpoints for intelligent note features.
 * Injects IAIService and INoteService to handle business logic.
 */
export class AIController {
    constructor(
        private aiService: IAIService,
        private noteService: INoteService,
        private driveService: IDriveService
    ) {}

    /**
     * POST /api/ai/assist
     * Body: { action: 'chat' | 'summarize' | 'mcqs' | 'explain' | 'align-jobs',
     *         message?: string, history?: {role, content}[],
     *         context?: { driveId, fileId } }
     */
    public assist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { action, message, history, context } = req.body as {
                action: AssistAction;
                message?: string;
                history?: any[];
                context?: { driveId: string; fileId: string };
            };

            if (!action) {
                res.status(400).json({ message: 'Missing action.' });
                return;
            }
            if (action === 'chat' && !message) {
                res.status(400).json({ message: 'Missing message for chat.' });
                return;
            }
            if (
                (action === 'summarize' ||
                    action === 'mcqs' ||
                    action === 'explain' ||
                    action === 'align-jobs') &&
                !context
            ) {
                res.status(400).json({
                    message: `"${action}" requires a file context. Select a note or text file first.`,
                });
                return;
            }

            let ctxPayload: { fileName: string; text: string; truncated: boolean } | undefined;
            if (context?.driveId && context?.fileId) {
                const drive = await this.driveService.getDriveClient(
                    userId,
                    context.driveId
                );
                const extracted = await extractDriveFileText(drive, context.fileId);
                ctxPayload = {
                    fileName: extracted.name,
                    text: extracted.text,
                    truncated: extracted.truncated,
                };
            }

            const ai = this.aiService as AIService;
            const response = await ai.assist({
                action,
                message,
                history: history || [],
                context: ctxPayload,
            });

            res.json({ response });
        } catch (error: any) {
            const code = error?.status || error?.response?.status;
            const raw = error?.message || 'Unknown AI error';
            let friendly = raw;
            if (code === 429 || /insufficient_quota|quota/i.test(raw)) {
                friendly =
                    'OpenAI account has no remaining credits (HTTP 429). Add credits or swap the API key in server/.env.';
            } else if (code === 401 || /api key|unauthorized/i.test(raw)) {
                friendly = 'OpenAI API key is invalid or missing.';
            } else if (code === 404 || /model|does not exist/i.test(raw)) {
                friendly = `OpenAI model not available: ${raw}`;
            }
            console.error('[AI assist] failed:', raw);
            res.status(code && code >= 400 && code < 600 ? code : 500).json({
                message: friendly,
            });
        }
    };

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
