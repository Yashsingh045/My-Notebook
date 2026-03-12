import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // Step state: 1 (Credentials), 2 (Connect Drive)
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create the account
            await authService.register(formData);
            
            // 2. Automatically log them in to get the JWT
            await login({ email: formData.email, password: formData.password });
            
            // 3. Move to Step 2 (Connect Drive)
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectDrive = async () => {
        setLoading(true);
        try {
            const url = await authService.getOAuthUrl();
            // Redirect to Google OAuth consent screen
            window.location.href = url;
        } catch (err) {
            setError('Failed to initiate Google connection. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-50">
            {/* Background Atmosphere */}
            <div className="emerald-glow w-[600px] h-[600px] -top-1/4 -left-1/4 opacity-10"></div>
            <div className="emerald-glow w-[400px] h-[400px] -bottom-1/4 -right-1/4 opacity-5"></div>

            <div className="w-full max-w-xl relative z-10">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg shadow-emerald-500/20">
                        M
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">
                        {step === 1 ? 'Join the Digital Vault' : 'Secure Your Storage'}
                    </h1>
                    <p className="text-slate-400 max-w-sm mx-auto">
                        {step === 1 
                            ? 'The first notebook designed for absolute data sovereignty.' 
                            : 'Link your Google Drive to enable zero-knowledge cloud storage.'}
                    </p>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden backdrop-blur-xl border border-white/5 bg-slate-900/50">
                    {/* Step Indicator */}
                    <div className="flex gap-2 mb-10">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-8 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        /* Step 1: Credentials Form */
                        <form onSubmit={handleRegisterSubmit} className="space-y-6">
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                        <UserIcon size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="digital_scholar"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-sm font-medium text-slate-300 ml-1">Secret Password</label>
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
                                {loading ? 'Creating Account...' : 'Continue to Storage Setup'}
                                {!loading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                            </button>
                            
                            <p className="text-center text-slate-500 text-sm mt-6">
                                Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Sign In</button>
                            </p>
                        </form>
                    ) : (
                        /* Step 2: Drive Connection Bridge */
                        <div className="text-center space-y-10 animate-fade-in py-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                                    <Shield size={48} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-2 border border-white/5">
                                    <CheckCircle size={24} className="text-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white font-display">Account Created</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                    Now, connect your <span className="text-slate-200 font-medium">Google Drive</span> to enable our zero-knowledge cloud engine. 
                                </p>
                            </div>

                            <button 
                                onClick={handleConnectDrive}
                                disabled={loading}
                                className="w-full btn-premium py-5 font-bold flex items-center justify-center gap-3 group"
                            >
                                {loading ? 'Connecting...' : 'Connect Google Drive Now'}
                                {!loading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                            </button>

                            <p className="text-slate-500 text-sm leading-relaxed">
                                You can finish this later, but your vault will <br /> remain offline until connected.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 text-[10px] tracking-[0.2em] uppercase font-semibold">
                        <Lock size={12} />
                        <span>AES-256 Cloud Token Encryption</span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;
