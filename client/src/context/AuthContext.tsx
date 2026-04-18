import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/AuthService';
import { driveService, type ConnectedDrive } from '../services/DriveService';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    needsDriveConnection: boolean;
    primaryDriveId: string | null;
    drives: ConnectedDrive[];
    uploadDriveId: string | null;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    refreshDrives: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_HEADROOM_RATIO = 0.005; // treat drive as "full" when <0.5% free

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsDriveConnection, setNeedsDriveConnection] = useState(false);
    const [primaryDriveId, setPrimaryDriveId] = useState<string | null>(null);
    const [drives, setDrives] = useState<ConnectedDrive[]>([]);

    const refreshDrives = useCallback(async () => {
        try {
            const list = await driveService.list();
            setDrives(list);
            const primary = list.find((d) => d.isPrimary) || list[0];
            setPrimaryDriveId(primary?.id || null);
            setNeedsDriveConnection(list.length === 0);
        } catch (err) {
            // swallow — user may not be authenticated
        }
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const data = await authService.getMe();
            setUser(data.user);
            setNeedsDriveConnection(data.needsDriveConnection ?? false);
            setPrimaryDriveId(data.primaryDriveId ?? null);
            await refreshDrives();
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            setPrimaryDriveId(null);
            setDrives([]);
        } finally {
            setLoading(false);
        }
    }, [refreshDrives]);

    const refreshUser = useCallback(async () => {
        try {
            const data = await authService.getMe();
            setUser(data.user);
        } catch (err) {
            // ignore
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: any) => {
        setLoading(true);
        try {
            const data = await authService.login(credentials);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setNeedsDriveConnection(data.needsDriveConnection ?? false);
            await checkAuth();
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any) => {
        await authService.register(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setNeedsDriveConnection(false);
        setPrimaryDriveId(null);
        setDrives([]);
    };

    // Pick the upload target: primary if it has room, otherwise the next
    // drive with free space. "Secondary drives are only used once the primary
    // is full" — see spec in feature request.
    const uploadDriveId = useMemo<string | null>(() => {
        if (drives.length === 0) return null;
        const hasRoom = (d: ConnectedDrive) => {
            const used = Number(d.spaceUsed || 0);
            const total = Number(d.spaceTotal || 0);
            if (total <= 0) return true; // unknown quota → assume usable
            return used < total * (1 - FREE_HEADROOM_RATIO);
        };
        const primary = drives.find((d) => d.isPrimary);
        if (primary && hasRoom(primary)) return primary.id;
        const next = drives.find((d) => !d.isPrimary && hasRoom(d));
        if (next) return next.id;
        return primary?.id || drives[0].id;
    }, [drives]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                needsDriveConnection,
                primaryDriveId,
                drives,
                uploadDriveId,
                login,
                register,
                logout,
                checkAuth,
                refreshDrives,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
