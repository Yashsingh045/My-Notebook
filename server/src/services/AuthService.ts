import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { IAuthService, RegisterDTO, LoginDTO, AuthResult } from '../interfaces/IAuthService';
import { IUser } from '../interfaces/IUser';
import { IDriveService } from '../interfaces/IDriveService';

/**
 * AuthService (OOP Implementation)
 * Orchestrates user registration, authentication, and Google OAuth flow.
 * Implements IAuthService contract.
 */
export class AuthService implements IAuthService {
    private readonly jwtSecret = process.env.JWT_SECRET || 'somesecretkey';
    private readonly clientId = process.env.GOOGLE_CLIENT_ID;
    private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI;

    constructor(private driveService: IDriveService) {}

    /**
     * Standard User Registration.
     * Returns the created user object.
     */
    public async register(data: RegisterDTO): Promise<IUser> {
        const userExists = await prisma.user.findUnique({ where: { email: data.email } });
        if (userExists) throw new Error('A user with this email already exists.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        return await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
            },
        });
    }

    /**
     * Standard Login.
     * Checks credentials and determines if user needs to connect a Drive.
     */
    public async login(data: LoginDTO): Promise<AuthResult> {
        const user = await prisma.user.findUnique({ 
            where: { email: data.email },
            include: { drives: { where: { isActive: true } } }
        });

        if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
            throw new Error('Invalid email or password.');
        }

        const token = this.generateToken(user.id);
        const needsDriveConnection = user.drives.length === 0;

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                passwordHash: user.passwordHash,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token,
            needsDriveConnection
        };
    }

    /**
     * Generates the Google OAuth consent URL.
     */
    public getOAuthUrl(): string {
        const oAuth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
        });
    }

    /**
     * Exchanges auth code for refresh tokens.
     */
    public async exchangeCodeForTokens(code: string): Promise<any> {
        const oAuth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );
        const { tokens } = await oAuth2Client.getToken(code);
        return tokens;
    }

    /**
     * Handles the OAuth callback, initialises Drive, and returns full session.
     */
    public async handleOAuthCallback(userId: string, code: string): Promise<AuthResult> {
        const tokens = await this.exchangeCodeForTokens(code);
        if (!tokens.refresh_token) {
            throw new Error('No refresh token received. User may have already authorized.');
        }

        // Get email from Google to label the drive
        const oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
        const userInfo = await oauth2.userinfo.get();
        const gmailAccount = userInfo.data.email || 'Primary Drive';

        // Initialise the standard vault structure in Drive
        await this.driveService.initUserDrive(
            userId,
            gmailAccount,
            tokens.refresh_token,
            true // isPrimary
        );

        // Return updated auth state
        const loginResult = await prisma.user.findUnique({ where: { id: userId } });
        return {
            user: loginResult as any,
            token: this.generateToken(userId),
            needsDriveConnection: false
        };
    }

    private generateToken(id: string): string {
        return jwt.sign({ id }, this.jwtSecret, { expiresIn: '30d' });
    }
}
