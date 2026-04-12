import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/AuthService';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    needsDriveConnection: boolean;
    primaryDriveId: string | null;
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
    const [primaryDriveId, setPrimaryDriveId] = useState<string | null>(null);

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
            // Bug fix: backend now returns needsDriveConnection + primaryDriveId
            const data = await authService.getMe();
            setUser(data.user);
            setNeedsDriveConnection(data.needsDriveConnection ?? false);
            setPrimaryDriveId(data.primaryDriveId ?? null);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            setPrimaryDriveId(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setNeedsDriveConnection(data.needsDriveConnection ?? false);
        // After login, re-check to get primaryDriveId
        await checkAuth();
    };

    const register = async (userData: any) => {
        await authService.register(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNeedsDriveConnection(false);
        setPrimaryDriveId(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            needsDriveConnection, 
            primaryDriveId,
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
