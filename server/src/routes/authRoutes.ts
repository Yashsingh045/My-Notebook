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
router.post('/login', authController.login);

// GET /api/auth/me
// Fetch current profile
router.get('/me', protect, authController.getMe);

// PATCH /api/auth/me — update username
router.patch('/me', protect, authController.updateMe);

// ─── Phase 1 Google OAuth Routes ─────────────────────────────

// GET /api/auth/oauth/url
// Returns the Google consent URL (no auth required for account creation)
router.get('/oauth/url', authController.getOAuthUrl);

// GET /api/auth/oauth/callback
// Handles Google redirect and vault initialisation (authenticated users)
router.get('/oauth/callback', protect, authController.handleOAuthCallback);

// GET /api/auth/oauth/signup
// Handles Google redirect for account creation (unauthenticated users)
router.get('/oauth/signup', authController.handleOAuthSignup);

export default router;
