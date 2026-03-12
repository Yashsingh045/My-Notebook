import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/AuthService';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    needsDriveConnection: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsDriveConnection, setNeedsDriveConnection] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await authService.getMe();
            setUser(data.user);
            // In a real app, the backend /me would include drive state
            // For now, we manually check or wait for backend result
            setNeedsDriveConnection(!data.user.hasDrive);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setNeedsDriveConnection(data.needsDriveConnection);
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        // Step 1: Account created. No token yet as per Two-Step logic (usually)
        // Or token issued but hasDrive=false.
        // Blueprint: Register returns message. Login is required after register.
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNeedsDriveConnection(false);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            needsDriveConnection, 
            login, 
            register, 
            logout, 
            checkAuth 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
