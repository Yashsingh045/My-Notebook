// ─── IAIService Contract ─────────────────────────────────────
// Defines the intelligence operations for processing notes,
// including MCQ generation, summarization, and interactive chat.
// ─────────────────────────────────────────────────────────────

export interface MCQ {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface SummaryResponse {
    summary: string;
    keyPoints: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface IAIService {
    /**
     * Generates a set of MCQs based on the provided note content.
     * Results are cached in Redis to reduce API latency and costs.
     */
    generateMCQs(userId: string, noteId: string, content: string): Promise<MCQ[]>;

    /**
     * Generates a concise academic summary and key points of the note content.
     * Results are cached in Redis for 24 hours.
     */
    summarizeNote(userId: string, noteId: string, content: string): Promise<SummaryResponse>;

    /**
     * Facilitates a conversational interaction focused on the note's context.
     */
    chatWithNote(
        userId: string, 
        noteId: string, 
        noteContent: string, 
        userMessage: string, 
        history: ChatMessage[]
    ): Promise<string>;
}
