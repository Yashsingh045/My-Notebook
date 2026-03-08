import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { driveService } from '../services/DriveService';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Dependency Injection Setup ──────────────────────────────
// Manually wiring the classes for the Auth module.
// In a larger system, this would be handled by an IoC container.
// ─────────────────────────────────────────────────────────────

const authService = new AuthService(driveService);
const authController = new AuthController(authService);

// ─── Phase 1 Routes ──────────────────────────────────────────

// POST /api/auth/register
// Step 1 of registration - save credentials
router.post('/register', authController.register);

// POST /api/auth/login
// Standard credentials-based login
router.get('/login', authController.login);

// GET /api/auth/me
// Fetch current profile
router.get('/me', protect, authController.getMe);

// ─── Phase 1 Google OAuth Routes ─────────────────────────────

// GET /api/auth/oauth/url
// Returns the Google consent URL
router.get('/oauth/url', protect, authController.getOAuthUrl);

// GET /api/auth/oauth/callback
// Handles Google redirect and vault initialisation
router.get('/oauth/callback', protect, authController.handleOAuthCallback);

export default router;
