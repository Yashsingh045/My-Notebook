import { Router } from 'express';
import { LibraryController } from '../controllers/LibraryController';
import { LibraryService } from '../services/LibraryService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Dependency Injection Setup ──────────────────────────────
const libraryService = new LibraryService(driveService);
const libraryController = new LibraryController(libraryService);

// ─── Library Management Routes ───────────────────────────────

// GET /api/library
// Returns the full subject/topic tree for a drive
router.get('/', protect, libraryController.getLibrary);

// POST /api/library/subjects
// Create a new subject folder and update metadata
router.post('/subjects', protect, libraryController.createSubject);

// POST /api/library/topics
// Create a topic folder (+ subfolders) and update metadata
router.post('/topics', protect, libraryController.createTopic);

export default router;
