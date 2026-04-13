import React, { useState } from 'react';
import { LogOut, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

const SettingsTab: React.FC = () => {
    const { user, logout } = useAuth();
    const [googleAccounts, setGoogleAccounts] = useState([
        {
            id: '1',
            email: 'yashveer@gmail.com',
            isPrimary: true,
            connectedAt: '2026-04-15',
        },
    ]);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            toast.success('Logged out successfully', {
                duration: 2000,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                },
            });
        }
    };

    const handleAddGoogleAccount = async () => {
        setLoading(true);
        try {
            // This will open Google OAuth flow to add another Google account
            const url = await authService.getOAuthUrl('callback');
            window.location.href = url;
        } catch (error) {
            toast.error('Failed to add Google account', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '10px',
                },
            });
            setLoading(false);
        }
    };

    const handleRemoveAccount = (id: string) => {
        if (googleAccounts.length === 1) {
            toast.error('You must have at least one Google Drive account connected', {
                duration: 3000,
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '10px',
                },
            });
            return;
        }

        setGoogleAccounts(googleAccounts.filter((acc) => acc.id !== id));
        toast.success('Account removed', {
            duration: 2000,
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
            },
        });
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#FFFFFF', height: '100%', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                Settings
            </h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>
                Manage your account and Google Drive integration
            </p>

            {/* Account Section */}
            <div
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                }}
            >
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#000' }}>
                    Account Information
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
                            Email
                        </label>
                        <p style={{ fontSize: '14px', color: '#000', marginTop: '4px', fontWeight: '500' }}>
                            {user?.email}
                        </p>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
                            Username
                        </label>
                        <p style={{ fontSize: '14px', color: '#000', marginTop: '4px', fontWeight: '500' }}>
                            {user?.username}
                        </p>
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>
                            Account Created
                        </label>
                        <p style={{ fontSize: '14px', color: '#000', marginTop: '4px', fontWeight: '500' }}>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Drive Accounts Section */}
            <div
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                    }}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: 0 }}>
                        Google Drive Accounts
                    </h2>
                    <button
                        onClick={handleAddGoogleAccount}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#00337C',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        <Plus size={16} /> Add Account
                    </button>
                </div>

                <p
                    style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '16px',
                        lineHeight: '1.5',
                    }}
                >
                    You can connect multiple Google accounts to store your data across different drives. The
                    primary account is where your archive vault is stored.
                </p>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {googleAccounts.map((account) => (
                        <div
                            key={account.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: '#E0E7FF',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                </div>
                                <div>
                                    <p
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#000',
                                            margin: 0,
                                        }}
                                    >
                                        {account.email}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            margin: '2px 0 0 0',
                                        }}
                                    >
                                        Connected on {account.connectedAt}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {account.isPrimary && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 12px',
                                            backgroundColor: '#D1FAE5',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#047857',
                                        }}
                                    >
                                        <Check size={12} /> Primary
                                    </div>
                                )}
                                {!account.isPrimary && (
                                    <button
                                        onClick={() => handleRemoveAccount(account.id)}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #FCA5A5',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            color: '#DC2626',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <Trash2 size={12} /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div
                style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '24px',
                }}
            >
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#DC2626' }}>
                    Danger Zone
                </h2>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#DC2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;
