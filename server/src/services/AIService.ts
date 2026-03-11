import OpenAI from 'openai';
import redisClient from '../config/redis';
import { IAIService, MCQ, SummaryResponse, ChatMessage } from '../interfaces/IAIService';

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
