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
        const response = await api.post('/auth/login', credentials);
        return response.data;
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
     */
    public async getOAuthUrl() {
        const response = await api.get('/auth/oauth/url');
        return response.data.url;
    }

    /**
     * Fetches current profile state.
     */
    public async getMe() {
        const response = await api.get('/auth/me');
        return response.data;
    }
}

// Export singleton instance
export const authService = new AuthService();
