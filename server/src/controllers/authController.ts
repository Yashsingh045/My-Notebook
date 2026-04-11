import { Request, Response } from 'express';
import prisma from '../config/db';
import { IAuthService } from '../interfaces/IAuthService';

/**
 * AuthController (OOP Implementation)
 * Provides HTTP endpoints for authentication and OAuth.
 * Uses constructor-based Dependency Injection.
 */
export class AuthController {
    constructor(private authService: IAuthService) {}

    /**
     * POST /api/auth/register
     */
    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, username, password } = req.body;
            const user = await this.authService.register({ email, username, password });
            
            res.status(201).json({
                message: 'Account created. Please connect your Google Drive.',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    };

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
            const url = this.authService.getOAuthUrl();
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
}
