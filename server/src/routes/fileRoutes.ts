import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { FileService } from '../services/FileService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});

const fileService = new FileService(driveService);
const fileController = new FileController(fileService, driveService);

// Upload into a topic's /files subfolder (legacy path)
router.post('/upload', protect, upload.single('file'), fileController.uploadFile);

// Upload directly into a Drive folder by its ID
router.post(
    '/upload-to-folder',
    protect,
    upload.single('file'),
    fileController.uploadToFolder
);

// Create/list folders
router.post('/folders/:driveId', protect, fileController.createFolder);
router.get('/folders/:driveId', protect, fileController.listFolders);

// List mixed children (files + folders) of any folder
router.get('/children/:driveId', protect, fileController.listChildren);

// Stream a file back to the client for inline viewing
router.get('/download/:driveId/:fileId', protect, fileController.downloadFile);

// Topic-scoped listing (legacy)
router.get('/topic/:topicId', protect, fileController.listByTopic);

// Update file content (e.g. TipTap note JSON)
router.put('/:driveId/:fileId', protect, fileController.updateFileContent);

// Delete
router.delete('/:id', protect, fileController.deleteFile);

export default router;
