import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { FileService } from '../services/FileService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Multer Configuration ────────────────────────────────────
// Using memory storage for zero-disk streaming.
// ─────────────────────────────────────────────────────────────
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ─── Dependency Injection Setup ──────────────────────────────
const fileService = new FileService(driveService);
const fileController = new FileController(fileService);

// ─── File Management Routes ──────────────────────────────────

// POST /api/files/upload
// Streams a file directly to the topic's /files folder in Drive
router.post('/upload', protect, upload.single('file'), fileController.uploadFile);

// POST /api/files/folders/:driveId
// Create a new folder in a parent folder
router.post('/folders/:driveId', protect, fileController.createFolder);

// GET /api/files/folders/:driveId
// List folders in root
router.get('/folders/:driveId', protect, fileController.listFolders);

// GET /api/files/topic/:topicId
// List all assets for a specific topic
router.get('/topic/:topicId', protect, fileController.listByTopic);

// DELETE /api/files/:id
// Remove an asset from Drive vault
router.delete('/:id', protect, fileController.deleteFile);

export default router;
