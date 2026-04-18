import api from '../api/axios';

/**
 * AuthService (Frontend OOP Implementation)
 * Abstracts the authentication API logic into a clean service class.
 */
export class AuthService {
    /**
     * Standard Login
     */
    public async login(credentials: any) {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Standard Registration
     */
    public async register(userData: any) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }

    /**
     * Retrieves the Google OAuth URL for Drive connection.
     * @param redirectType - 'callback' for authenticated users, 'signup' for account creation
     */
    public async getOAuthUrl(redirectType: 'callback' | 'signup' = 'callback') {
        const response = await api.get(`/auth/oauth/url?type=${redirectType}`);
        return response.data.url;
    }

    /**
     * Fetches current profile state.
     */
    public async getMe() {
        const response = await api.get('/auth/me');
        return response.data;
    }

    /**
     * Updates the authenticated user's editable profile fields.
     */
    public async updateMe(data: { username: string }) {
        const response = await api.patch('/auth/me', data);
        return response.data;
    }

    /**
     * Handles OAuth callback for authenticated users.
     * Exchanges the auth code for tokens and initializes Drive.
     */
    public async handleOAuthCallback(code: string, state?: string) {
        try {
            const response = await api.get('/auth/oauth/callback', {
                params: { code, state }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handles OAuth signup for account creation.
     * Exchanges code + signupToken for full authentication token.
     * Creates user and initializes Google Drive.
     */
    public async handleOAuthSignup(code: string, signupToken: string) {
        try {
            const response = await api.get('/auth/oauth/signup', {
                params: { code, signupToken }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
