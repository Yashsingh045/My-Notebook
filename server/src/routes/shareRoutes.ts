import { Router } from 'express';
import { ShareController } from '../controllers/ShareController';
import { ShareService } from '../services/ShareService';
import { DriveService } from '../services/DriveService';
import { NoteService } from '../services/NoteService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Dependency Injection Setup ──────────────────────────────
const driveService = new DriveService();
const noteService = new NoteService(driveService);
const shareService = new ShareService(driveService, noteService);
const shareController = new ShareController(shareService);

// ─── Public Sharing Routes ───────────────────────────────────

// POST /api/share
// Generates a public shared link for a note
router.post('/', protect, shareController.shareNote);

// GET /api/share/manage
// List all shares for the current user
router.get('/manage', protect, shareController.listMyShares);

// DELETE /api/share/:id
// Revokes a public sharing link
router.delete('/:id', protect, shareController.revokeShare);

// GET /api/share/:id (PUBLIC)
// Resolves the link and returns note content (No auth required)
router.get('/:id', shareController.getSharedContent);

export default router;
