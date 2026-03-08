import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { NoteService } from '../services/NoteService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Dependency Injection Setup ──────────────────────────────
const noteService = new NoteService(driveService);
const noteController = new NoteController(noteService);

// ─── Note CRUD Routes ────────────────────────────────────────

// POST /api/notes
// Create a new JSON note in Drive
router.post('/', protect, noteController.createNote);

// GET /api/notes/topic/:topicId
// List all notes for a specific topic
router.get('/topic/:topicId', protect, noteController.listByTopic);

// GET /api/notes/:id
// Get full note content
router.get('/:id', protect, noteController.getNote);

// PATCH /api/notes/:id
// Update note content/title/tags
router.patch('/:id', protect, noteController.updateNote);

// DELETE /api/notes/:id
// Remove note from Drive
router.delete('/:id', protect, noteController.deleteNote);

export default router;
