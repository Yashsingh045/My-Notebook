import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, needsDriveConnection } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in and onboarding is complete
    useEffect(() => {
        if (user) {
            if (needsDriveConnection) {
                // If they need drive but are on login, they should probably see the connection bridge
                // We'll handle this in the login submit, but also auto-redirect if session exists
                navigate('/register'); // Register page has the bridge in Step 2
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, needsDriveConnection, navigate]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData);
            // Redirection is handled by the useEffect above once user is set
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-50">
            {/* Background Atmosphere */}
            <div className="emerald-glow w-[500px] h-[500px] -top-1/4 -right-1/4 opacity-10"></div>
            <div className="emerald-glow w-[400px] h-[400px] -bottom-1/4 -left-1/4 opacity-5"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg shadow-emerald-500/20">
                        M
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">
                        Access your private knowledge vault.
                    </p>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-xl border border-white/5 bg-slate-900/50">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <button type="button" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    required
                                    className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-premium py-4 font-bold flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Authenticating...' : 'Sign In to Vault'}
                            {!loading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                        </button>
                        
                        <p className="text-center text-slate-500 text-sm mt-6">
                            New here? <button type="button" onClick={() => navigate('/register')} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Create a Vault</button>
                        </p>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 text-[10px] tracking-[0.2em] uppercase font-semibold">
                        <Shield size={12} />
                        <span>Stateless JWT Authentication</span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
