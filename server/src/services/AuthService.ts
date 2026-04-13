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
     * @param redirectType - 'callback' for authenticated users, 'signup' for account creation
     */
    public getOAuthUrl(redirectType: 'callback' | 'signup' = 'callback'): string {
        // Determine the frontend redirect path based on the type
        const redirectPath = redirectType === 'signup' ? '/oauth/signup' : '/oauth/callback';
        
        // Get the frontend base URL from env variable
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const fullRedirectUri = `${frontendUrl}${redirectPath}`;

        // Initialize OAuth2Client with the SAME redirect_uri that will be used in generateAuthUrl
        const oAuth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            fullRedirectUri  // Use the full frontend URI, not the env variable
        );

        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            redirect_uri: fullRedirectUri,
            scope: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        });
    }

    /**
     * Exchanges auth code for refresh tokens.
     * @param code - Authorization code from Google
     * @param redirectUri - The redirect URI that was used when generating the auth URL
     */
    public async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
        const oAuth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            redirectUri  // Use the provided redirect URI
        );
        const { tokens } = await oAuth2Client.getToken(code);
        return tokens;
    }

    /**
     * Handles the OAuth callback, initialises Drive, and returns full session.
     */
    public async handleOAuthCallback(userId: string, code: string): Promise<AuthResult> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const callbackRedirectUri = `${frontendUrl}/oauth/callback`;
        
        const tokens = await this.exchangeCodeForTokens(code, callbackRedirectUri);
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

    /**
     * Handles Google OAuth for account creation (unauthenticated users).
     * Creates a new user using Google account information and saves name as username.
     */
    /**
     * Handles OAuth signup for account creation.
     * @param code - Google OAuth authorization code
     * @param signupToken - JWT token containing email, username, password from signup form
     * 
     * This method ensures users can only be created AFTER successful Google OAuth.
     * No user exists without a Google Drive account.
     */
    public async handleOAuthSignup(code: string, signupToken: string): Promise<AuthResult> {
        // Step 1: Decode and validate the signup token
        let signupData: any;
        try {
            signupData = jwt.verify(signupToken, this.jwtSecret) as any;
        } catch (error) {
            throw new Error('Invalid or expired signup token. Please start the signup process again.');
        }

        const { email: signupEmail, username, password } = signupData;

        // Step 2: Exchange OAuth code for Google tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const signupRedirectUri = `${frontendUrl}/oauth/signup`;
        
        const tokens = await this.exchangeCodeForTokens(code, signupRedirectUri);
        if (!tokens.refresh_token) {
            throw new Error('No refresh token received. User may have already authorized.');
        }

        // Step 3: Get user info from Google
        const oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret);
        oAuth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email;

        if (!googleEmail) {
            throw new Error('Failed to get email from Google.');
        }

        // Step 4: Verify emails match (user must connect the Google account they used to sign up)
        if (googleEmail.toLowerCase() !== signupEmail.toLowerCase()) {
            throw new Error(`Email mismatch. You signed up with ${signupEmail} but authenticated with ${googleEmail}. Please use the same Google account.`);
        }

        // Step 5: Check if user already exists (shouldn't happen, but safety check)
        let existingUser = await prisma.user.findUnique({ where: { email: googleEmail } });
        if (existingUser) {
            throw new Error('This email is already registered. Please log in instead.');
        }

        // Step 6: Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email: googleEmail,
                username,
                passwordHash,
            },
        });

        // Step 7: Initialize Google Drive vault structure
        await this.driveService.initUserDrive(
            user.id,
            googleEmail,
            tokens.refresh_token,
            true // isPrimary
        );

        // Step 8: Return authenticated session
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                passwordHash: user.passwordHash,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token: this.generateToken(user.id),
            needsDriveConnection: false
        };
    }

    private generateToken(id: string): string {
        return jwt.sign({ id }, this.jwtSecret, { expiresIn: '30d' });
    }
}
