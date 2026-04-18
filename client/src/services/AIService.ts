import api from '../api/axios';

export type AssistAction = 'chat' | 'summarize' | 'mcqs' | 'explain' | 'align-jobs';

export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AssistRequest {
    action: AssistAction;
    message?: string;
    history?: AIMessage[];
    context?: { driveId: string; fileId: string };
}

export class AIService {
    public async generateMCQs(driveId: string, noteId: string) {
        const response = await api.post('/ai/mcqs', { driveId, noteId });
        return response.data;
    }

    public async summarizeNote(driveId: string, noteId: string) {
        const response = await api.post('/ai/summarize', { driveId, noteId });
        return response.data;
    }

    public async chatWithNote(
        driveId: string,
        noteId: string,
        message: string,
        history: any[]
    ) {
        const response = await api.post('/ai/chat', {
            driveId,
            noteId,
            message,
            history,
        });
        return response.data;
    }

    /**
     * Generic file-aware assistant. Returns a markdown string response.
     */
    public async assist(req: AssistRequest): Promise<string> {
        const response = await api.post('/ai/assist', req);
        return response.data.response as string;
    }
}

export const aiService = new AIService();
