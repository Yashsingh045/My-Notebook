import { Router } from 'express';
import { LibraryController } from '../controllers/LibraryController';
import { LibraryService } from '../services/LibraryService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

const libraryService = new LibraryService(driveService);
const libraryController = new LibraryController(libraryService, driveService);

router.get('/', protect, libraryController.getLibrary);
router.get('/tabs', protect, libraryController.getTabs);
router.post('/subjects', protect, libraryController.createSubject);
router.post('/topics', protect, libraryController.createTopic);

export default router;
