// ─── IAuthService Contract ────────────────────────────────────
// Defines the authentication logic, including standard login/signup
// and the specialized Google OAuth orchestration.
// ─────────────────────────────────────────────────────────────

import { IUser } from './IUser';

export interface RegisterDTO {
    email: string;
    username: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResult {
    user: IUser;
    token: string;
    needsDriveConnection: boolean;
}

export interface IAuthService {
    register(data: RegisterDTO): Promise<IUser>;
    login(data: LoginDTO): Promise<AuthResult>;
    getOAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<any>;
    handleOAuthCallback(userId: string, code: string): Promise<AuthResult>;
}
