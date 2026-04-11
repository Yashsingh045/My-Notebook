import api from '../api/axios';

/**
 * AIService (Frontend OOP Implementation)
 * Orchestrates intelligence features for notes using OpenAI GPT-4o.
 */
export class AIService {
    /**
     * Generates a set of academic MCQs based on note content.
     */
    public async generateMCQs(driveId: string, noteId: string) {
        const response = await api.post('/ai/mcqs', { driveId, noteId });
        return response.data;
    }

    /**
     * Generates a concise academic summary and key points of the note.
     */
    public async summarizeNote(driveId: string, noteId: string) {
        const response = await api.post('/ai/summarize', { driveId, noteId });
        return response.data;
    }

    /**
     * Sends a user message to the conversational note chat.
     */
    public async chatWithNote(driveId: string, noteId: string, message: string, history: any[]) {
        const response = await api.post('/ai/chat', { 
            driveId, 
            noteId, 
            message, 
            history 
        });
        return response.data;
    }
}

// Export singleton instance
export const aiService = new AIService();
