import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/AuthService';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden font-sans">
            {/* Left Panel: Branding & Marketing */}
            <div className="hidden md:flex md:w-[42%] bg-[#00337C] text-white p-12 flex-col justify-between relative">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-20">My Notebook</h2>
                    <h1 className="text-[3.5rem] leading-[1.1] font-bold mb-8">
                        Curate your academic legacy with editorial precision.
                    </h1>
                    <p className="text-blue-100/80 text-lg max-w-md leading-relaxed">
                        A sanctuary for deep thought, career trajectories, and AI-assisted insights.
                    </p>
                </div>

                {/* Decorative Image Area */}
                <div className="absolute -right-8 bottom-32 w-72 h-80 bg-[#002861] rounded-2xl shadow-2xl overflow-hidden transform rotate-6 border border-white/10 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800" 
                        alt="Fountain Pen" 
                        className="w-full h-full object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00337C]/40 to-transparent pointer-events-none"></div>
                </div>

                {/* Footer status indicator */}
                <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Sparkles size={20} className="text-blue-200" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Intelligence Layer Active</p>
                        <p className="text-xs text-blue-200/60">Processing career metadata...</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Forms */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-white overflow-y-auto">
                <div className="w-full max-w-[440px]">
                    {children}
                    
                    {/* Footer Links */}
                    <div className="mt-16 flex justify-center gap-6 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                        <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Security Standards</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user, needsDriveConnection } = useAuth();
    
    // Determine if we are on login or signup based on URL or state
    const isLogin = location.pathname === '/login';
    
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (needsDriveConnection) {
                // If they need drive connection, stay on the current page to show the "Connect" step
                // or redirect if we were just trying to login
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, needsDriveConnection, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
            } else {
                // Registration flow
                await authService.register(formData);
                await login({ email: formData.email, password: formData.password });
                // Note: the AuthContext will update 'needsDriveConnection' to true,
                // which our UI will use to show the "Connect Google" button.
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleConnect = async () => {
        setLoading(true);
        try {
            const url = await authService.getOAuthUrl();
            window.location.href = url;
        } catch {
            setError('Failed to connect to Google.');
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[2.5rem] font-bold text-[#1A1A1A] tracking-tight">
                    {isLogin ? 'Welcome to your archive.' : 'Create your vault.'}
                </h2>

                {/* Tabs */}
                <div className="flex bg-[#F2F2F2] p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => navigate('/login')}
                        className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Main Action Area */}
                {user && needsDriveConnection ? (
                    /* Post-signup/login: Connect Google Step */
                    <div className="space-y-8 py-4">
                        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                                <Sparkles size={20} />
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed italic">
                                "Your archive uses the Editorial Intelligence layer to suggest career paths based on your internship entries and academic references."
                            </p>
                        </div>

                        <button 
                            onClick={handleGoogleConnect}
                            disabled={loading}
                            className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-medium text-[#1A1A1A] shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            OR USE EDITORIAL MAIL
                        </p>
                    </div>
                ) : (
                    /* Login/Registration Form */
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button 
                            type="button"
                            onClick={handleGoogleConnect}
                            className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-medium text-[#1A1A1A] shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#E5E5E5]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
                                <span className="bg-white px-4">Or use editorial mail</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase ml-1">Archive Username</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full h-14 px-4 bg-[#F2F2F2] border-none rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:ring-2 focus:ring-[#00337C]/20 transition-all outline-none"
                                        placeholder="curator_name"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase ml-1">Archive Identity</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full h-14 px-4 bg-[#F2F2F2] border-none rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:ring-2 focus:ring-[#00337C]/20 transition-all outline-none"
                                    placeholder="curator@architect.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Access Key</label>
                                    {isLogin && (
                                        <button type="button" className="text-[10px] font-bold text-[#00337C] tracking-widest uppercase hover:underline">Lost access?</button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full h-14 px-4 bg-[#F2F2F2] border-none rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:ring-2 focus:ring-[#00337C]/20 transition-all outline-none font-mono"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 bg-[#00337C] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#002861] transition-all shadow-lg shadow-blue-900/20 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Enter Workspace' : 'Initialize Archive'}
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Info Card */}
                <div className="bg-[#F9F9F9] border border-[#F0F0F0] p-6 rounded-2xl flex gap-4">
                    <div className="w-10 h-10 bg-[#00337C] rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                        <Sparkles size={20} />
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed italic">
                        "Your archive uses the Editorial Intelligence layer to suggest career paths based on your internship entries and academic references."
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AuthPage;
