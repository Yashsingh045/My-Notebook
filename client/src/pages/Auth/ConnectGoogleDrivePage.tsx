import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

/**
 * ConnectGoogleDrivePage
 * 
 * Shown to users who are authenticated but don't have a Google Drive connected yet.
 * This is MANDATORY - users cannot proceed without connecting Google Drive.
 * 
 * This page is shown when:
 * - User logs in to an account that has no Google Drive connected
 * - ProtectedRoute detects needsDriveConnection === true
 * 
 * User must connect Google Drive to use the application.
 */
const ConnectGoogleDrivePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleConnectDrive = async () => {
        setLoading(true);
        try {
            // Get OAuth URL for existing authenticated user
            const oauthUrl = await authService.getOAuthUrl('callback');
            window.location.href = oauthUrl;
        } catch (error) {
            toast.error('Failed to start Google Drive connection', {
                duration: 4000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '10px',
                },
            });
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#00337C',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px'
            }}>
                {/* Logo */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    margin: '0'
                }}>
                    My Notebook
                </h1>

                {/* Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <HardDrive size={48} color="white" />
                </div>

                {/* Heading */}
                <div>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        margin: '0 0 16px 0',
                        color: 'white'
                    }}>
                        Complete Your Setup
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: '0',
                        lineHeight: '1.6'
                    }}>
                        To access your archive and store your academic journey, you need to connect your Google Drive.
                    </p>
                </div>

                {/* Info Box */}
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                }}>
                    <Sparkles size={24} style={{ flexShrink: 0, marginTop: '4px' }} />
                    <p style={{
                        fontSize: '14px',
                        margin: '0',
                        lineHeight: '1.6',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textAlign: 'left'
                    }}>
                        <strong>What happens next:</strong> We'll create a secure vault in your Google Drive to store your notes, documents, and career materials. Your data belongs to you and is never shared.
                    </p>
                </div>

                {/* User Info */}
                {user && (
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }}>
                        Signed in as: <strong>{user.email}</strong>
                    </div>
                )}

                {/* Main CTA Button */}
                <button
                    onClick={handleConnectDrive}
                    disabled={loading}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '16px 32px',
                        backgroundColor: 'white',
                        color: '#00337C',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {loading ? 'Connecting...' : 'Connect Google Drive'}
                </button>

                {/* Help Text */}
                <p style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: '0',
                    maxWidth: '400px'
                }}>
                    You'll be asked to grant My Notebook access to your Google Drive. We only access the folders we create.
                </p>
            </div>
        </div>
    );
};

export default ConnectGoogleDrivePage;
