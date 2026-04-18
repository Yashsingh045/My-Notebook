import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { IAuthService } from '../interfaces/IAuthService';
import { activityService } from '../services/ActivityService';

/**
 * AuthController (OOP Implementation)
 * Provides HTTP endpoints for authentication and OAuth.
 * Uses constructor-based Dependency Injection.
 */
export class AuthController {
    constructor(private authService: IAuthService) {}

    /**
     * POST /api/auth/register
     * Step 1: Validates signup credentials and returns a temp token for OAuth.
     * Does NOT create user yet - creation happens after OAuth in handleOAuthSignup.
     * This ensures every user has a Google Drive account.
     */
    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, username, password } = req.body;

            // Validate email doesn't already exist
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ message: 'Email already registered.' });
                return;
            }

            // Validate password strength
            if (!password || password.length < 6) {
                res.status(400).json({ message: 'Password must be at least 6 characters.' });
                return;
            }

            // Create a temporary signup token (short-lived, 10 minutes)
            // This token will be used to complete signup after OAuth
            const signupData = { email, username, password };
            const signupToken = jwt.sign(signupData, process.env.JWT_SECRET || 'somesecretkey', { expiresIn: '10m' });

            res.status(200).json({
                message: 'Signup data validated. Proceed to Google authentication.',
                signupToken
            });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    };

    /**
     * Helper method to generate JWT token
     */
    private generateToken(userId: string): string {
        const secret = process.env.JWT_SECRET || 'somesecretkey';
        return jwt.sign({ userId }, secret, { expiresIn: '7d' });
    }

    /**
     * POST /api/auth/login
     */
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login({ email, password });
            
            res.json(result);
        } catch (error) {
            res.status(401).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/auth/oauth/url
     */
    public getOAuthUrl = async (req: Request, res: Response): Promise<void> => {
        try {
            const redirectType = (req.query.type as 'callback' | 'signup') || 'callback';
            const url = this.authService.getOAuthUrl(redirectType);
            res.json({ url });
        } catch (error) {
            res.status(500).json({ message: 'Failed to generate OAuth URL.' });
        }
    };

    /**
     * GET /api/auth/oauth/callback
     */
    public handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
        const { code, state } = req.query; // State can carry userId
        
        // Note: In a real flow, we'd get userId from session or temp JWT.
        // For Phase 1, we assume the user is already authenticated via temp JWT (protect middleware).
        const userId = (req as any).user?.id;

        if (!code || !userId) {
            res.status(400).json({ message: 'Missing auth code or user session.' });
            return;
        }

        try {
            const result = await this.authService.handleOAuthCallback(userId, code as string);
            res.json(result);
        } catch (error) {
            console.error('OAuth Callback Error:', error);
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/auth/me
     * Returns the user profile plus drive connection state.
     * Bug fix: previously did not include needsDriveConnection or primaryDriveId,
     * causing the frontend to lose auth state on page reload.
     */
    public getMe = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;

            // Bug fix: use shared prisma singleton, not new PrismaClient() per request
            const primaryDrive = await prisma.userDrive.findFirst({
                where: { userId: user.id, isPrimary: true },
                select: { id: true }
            });

            const needsDriveConnection = !primaryDrive;
            const primaryDriveId = primaryDrive?.id ?? null;

            res.json({ user, needsDriveConnection, primaryDriveId });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch profile.' });
        }
    };

    /**
     * PATCH /api/auth/me
     * Body: { username }
     */
    public updateMe = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { username } = req.body;
            if (typeof username !== 'string' || !username.trim()) {
                res.status(400).json({ message: 'Username required.' });
                return;
            }
            if (username.trim().length > 60) {
                res.status(400).json({ message: 'Username too long (max 60).' });
                return;
            }
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { username: username.trim() },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            await activityService.log(
                userId,
                'update-username',
                updated.username,
                null,
                'Updated account username'
            );
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/auth/oauth/signup
     * Handles Google OAuth for account creation (unauthenticated users).
     * Creates a new user using Google account information and saves name as username.
     */
    /**
     * GET /api/auth/oauth/signup
     * Handles OAuth signup for account creation.
     * Query params: code, signupToken (from previous /register call)
     * Creates user AND initializes Google Drive in one transaction.
     */
    public handleOAuthSignup = async (req: Request, res: Response): Promise<void> => {
        const { code, signupToken } = req.query;

        if (!code || !signupToken) {
            res.status(400).json({ message: 'Missing auth code or signup token.' });
            return;
        }

        try {
            const result = await this.authService.handleOAuthSignup(code as string, signupToken as string);
            res.json(result);
        } catch (error) {
            console.error('OAuth Signup Error:', error);
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
