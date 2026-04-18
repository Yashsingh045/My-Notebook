import OpenAI from 'openai';
import redisClient from '../config/redis';
import { IAIService, MCQ, SummaryResponse, ChatMessage } from '../interfaces/IAIService';

export type AssistAction = 'chat' | 'summarize' | 'mcqs' | 'explain' | 'align-jobs';

export interface AssistParams {
    action: AssistAction;
    message?: string;
    history?: ChatMessage[];
    context?: {
        fileName: string;
        text: string;
        truncated: boolean;
    };
}

/**
 * AIService (OOP Implementation)
 * Orchestrates intelligence features for notes using OpenAI GPT-4o.
 * Implements Redis-based caching for cost optimization and performance.
 */
export class AIService implements IAIService {
    private openai: OpenAI;
    private readonly cacheExpiry = 60 * 60 * 24; // 24 hours

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * Generates 5 MCQs based on note content.
     */
    public async generateMCQs(userId: string, noteId: string, content: string): Promise<MCQ[]> {
        const cacheKey = `ai:mcq:${noteId}`;

        // 1. Check Redis Cache
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // 2. Call OpenAI
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an academic tutor. Generate 5 multiple choice questions (MCQs) in JSON format based on the following note content. Include question, 4 options, the correct answer, and a brief explanation.'
                },
                { role: 'user', content }
            ],
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{"mcqs": []}');
        const mcqs = result.mcqs || [];

        // 3. Store in Cache
        await redisClient.setEx(cacheKey, this.cacheExpiry, JSON.stringify(mcqs));

        return mcqs;
    }

    /**
     * Generates a 1-paragraph summary and 5 key bullet points.
     */
    public async summarizeNote(userId: string, noteId: string, content: string): Promise<SummaryResponse> {
        const cacheKey = `ai:summary:${noteId}`;

        // 1. Check Redis Cache
        const cached = await redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // 2. Call OpenAI
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Summarize the following note content in one concise paragraph and provide 5 key bullet points. Return as JSON with "summary" and "keyPoints" fields.'
                },
                { role: 'user', content }
            ],
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{"summary": "", "keyPoints": []}');

        // 3. Store in Cache
        await redisClient.setEx(cacheKey, this.cacheExpiry, JSON.stringify(result));

        return result;
    }

    /**
     * Generic assist entry point used by the new AI sidebar.
     * Supports free chat and pre-canned actions (summarize, mcqs, explain,
     * align-jobs) with optional file context.
     */
    public async assist(params: AssistParams): Promise<string> {
        const { action, message, history = [], context } = params;

        const systemChunks: string[] = [
            'You are "Editorial AI", the curator assistant inside My-Notebook, a personal knowledge vault.',
            'Reply in clear, friendly, concise prose. Use short markdown where helpful (bullet lists, bold headings).',
            'Refuse only if asked to do something unsafe. Never invent file contents that were not provided.',
        ];
        if (context) {
            const header = `The user is currently viewing the file "${context.fileName}". Here is its text:`;
            const truncNote = context.truncated
                ? '\n(Note: content was truncated for length; focus on what is shown.)'
                : '';
            systemChunks.push(
                `${header}\n<<<FILE\n${context.text}\nFILE>>>${truncNote}`
            );
        }

        let userPrompt = message || '';
        switch (action) {
            case 'summarize':
                userPrompt =
                    'Summarize the file above in 4-6 sentences, then list 4 key takeaways as markdown bullets.';
                break;
            case 'mcqs':
                userPrompt =
                    'Generate 5 multiple-choice questions from the file above. For each, give 4 options labelled A-D, then the correct answer on a new line prefixed with **Answer:**, then a one-sentence explanation.';
                break;
            case 'explain':
                userPrompt =
                    'Explain the key concepts in the file above as if teaching a smart undergraduate: define any jargon and give one concrete example for each idea.';
                break;
            case 'align-jobs':
                userPrompt =
                    'Based on the file above, suggest 5 concrete job or internship directions the author could pursue, each with a one-line rationale tying back to specific content in the file.';
                break;
            case 'chat':
            default:
                if (!userPrompt) userPrompt = 'Hello';
                break;
        }

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemChunks.join('\n\n') },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userPrompt },
        ];

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.4,
        });

        return (
            response.choices[0].message.content ||
            "I'm sorry, I couldn't generate a response."
        );
    }

    /**
     * Handles conversation about the note content.
     */
    public async chatWithNote(
        userId: string,
        noteId: string,
        noteContent: string,
        userMessage: string,
        history: ChatMessage[]
    ): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an assistant for a student's digital notebook. You are discussing a specific note with the following content: \n\n${noteContent}\n\n Answer the user's questions strictly based on this content.`
                },
                ...history,
                { role: 'user', content: userMessage }
            ]
        });

        return response.choices[0].message.content || "I'm sorry, I couldn't process that response.";
    }
}
