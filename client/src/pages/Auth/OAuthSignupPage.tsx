import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

/**
 * OAuthSignupPage
 * Handles OAuth signup flow (account creation via Google).
 * 
 * Flow:
 * 1. User fills signup form with email/username/password
 * 2. Frontend validates and gets signupToken (10-minute JWT)
 * 3. Frontend redirects to Google OAuth consent screen
 * 4. Google redirects back to /oauth/signup?code=AUTH_CODE
 * 5. This page retrieves signupToken from sessionStorage
 * 6. Exchanges code + signupToken for full user token
 * 7. Backend creates user + initializes Google Drive
 * 8. Frontend is logged in and ready to use dashboard
 * 
 * Key: No user is created until OAuth is successfully completed.
 */
const OAuthSignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasRunRef = useRef(false);  // Prevent multiple runs

    useEffect(() => {
        // Skip if already executed
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const handleOAuthSignup = async () => {
            const code = searchParams.get('code');
            const signupToken = sessionStorage.getItem('signupToken');

            if (!code) {
                setError('Missing authorization code from Google');
                setLoading(false);
                toast.error('OAuth signup failed: Missing code');
                setTimeout(() => navigate('/register'), 3000);
                return;
            }

            if (!signupToken) {
                setError('Signup session expired. Please start over.');
                setLoading(false);
                toast.error('Signup session expired. Please start the signup process again.');
                setTimeout(() => navigate('/register'), 3000);
                return;
            }

            try {
                // Call backend to exchange code + signupToken for full auth
                // Backend will:
                // 1. Decode signupToken to get email/username/password
                // 2. Exchange code for Google tokens
                // 3. Verify Google email matches signup email
                // 4. Create user account
                // 5. Initialize Google Drive vault
                const result = await authService.handleOAuthSignup(code, signupToken);
                
                // Store the authentication token
                localStorage.setItem('token', result.token);
                
                // Clear the temporary signup token
                sessionStorage.removeItem('signupToken');
                
                // Refresh auth context with new user data
                await checkAuth();
                
                toast.success('Account created successfully with Google Drive!', {
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
                const errorMessage = error.response?.data?.message || 'Failed to complete signup';
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
                setTimeout(() => navigate('/register'), 4000);
            }
        };

        handleOAuthSignup();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

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
                <p className="text-emerald-400 font-medium">Creating your account with Google Drive...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4 px-4">
                <p className="text-red-400 font-semibold text-center">Error: {error}</p>
                <p className="text-slate-400 text-sm">Redirecting to signup...</p>
            </div>
        );
    }

    return null;
};

export default OAuthSignupPage;
        