import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { AIService } from '../services/AIService';
import { NoteService } from '../services/NoteService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Dependency Injection Setup ──────────────────────────────
const aiService = new AIService();
const noteService = new NoteService(driveService);
const aiController = new AIController(aiService, noteService, driveService);

// ─── Intelligence Features Routes ───────────────────────────

// POST /api/ai/mcqs
// Generates study questions from note content
router.post('/mcqs', protect, aiController.generateMCQs);

// POST /api/ai/summarize
// Generates content summary and key points
router.post('/summarize', protect, aiController.summarizeNote);

// POST /api/ai/chat
// Interactive chat focusing on specific note context
router.post('/chat', protect, aiController.chatWithNote);

// POST /api/ai/assist — generic file-aware chat + quick actions
router.post('/assist', protect, aiController.assist);

export default router;
