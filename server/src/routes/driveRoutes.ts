import { Router } from 'express';
import { DrivesController } from '../controllers/DrivesController';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();
const drivesController = new DrivesController(driveService);

router.get('/', protect, drivesController.list);
router.delete('/:id', protect, drivesController.disconnect);

export default router;
