import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

/**
 * OAuthCallbackPage
 * Handles the redirect from Google OAuth.
 * Exchanges the auth code for a token and logs in the user.
 */
const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasRunRef = useRef(false);  // Prevent multiple runs

    useEffect(() => {
        // Skip if already executed
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const handleOAuthCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code) {
                setError('Missing authorization code from Google');
                setLoading(false);
                toast.error('OAuth callback failed: Missing code');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Call backend to exchange code for tokens
                const result = await authService.handleOAuthCallback(code, state || undefined);
                
                // Store the token
                localStorage.setItem('token', result.token);
                
                // Check auth to load user data
                await checkAuth();
                
                toast.success('Successfully connected Google Drive!', {
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                });

                // Navigate to dashboard
                navigate('/dashboard');
            } catch (err) {
                const error = err as { response?: { data?: { message?: string } } };
                const errorMessage = error.response?.data?.message || 'Failed to complete OAuth flow';
                setError(errorMessage);
                toast.error(errorMessage, {
                    duration: 4000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '10px',
                    },
                });
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleOAuthCallback();
    }, []);  // Empty dependency array - runs only once on mount

    if (loading && !error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
                <div className="animate-spin">
                    <svg
                        className="w-12 h-12 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </div>
                <p className="text-emerald-400 font-medium">Completing setup...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 px-4">
                <p className="text-red-400 font-semibold text-center">Error: {error}</p>
                <p className="text-slate-400 text-sm">Redirecting to login...</p>
            </div>
        );
    }

    return null;
};

export default OAuthCallbackPage;
