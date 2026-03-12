import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
            {/* Background Atmosphere */}
            <div className="emerald-glow w-[500px] h-[500px] -top-20 -left-20 opacity-20"></div>
            <div className="emerald-glow w-[400px] h-[400px] bottom-0 -right-20 opacity-10"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-medium mb-8 animate-float">
                        <ShieldCheck size={16} />
                        <span>Zero-Knowledge Digital Vault</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-8">
                        The Only Notebook <br />
                        <span className="text-gradient">You Truly Own</span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Securely store your knowledge, files, and AI insights directly inside 
                        <span className="text-slate-200"> your own Google Drive</span>. 
                        No central servers, no data mining, absolute privacy.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/register" className="btn-premium group w-full sm:w-auto">
                            <span className="flex items-center justify-center gap-2">
                                Start Your Vault
                                <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                            </span>
                        </Link>
                        
                        <button className="px-8 py-4 rounded-full font-semibold border border-white/10 hover:bg-white/5 transition-all text-slate-300 w-full sm:w-auto">
                            View How It Works
                        </button>
                    </div>

                    {/* Social Proof / Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-2xl">100%</span>
                            <span className="text-slate-500 text-sm">Self-Hosted</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-white/5 px-8">
                            <span className="text-white font-bold text-2xl flex items-center gap-1">
                                <Zap size={20} className="text-emerald-500" />
                                5ms
                            </span>
                            <span className="text-slate-500 text-sm">Cache Sync</span>
                        </div>
                        <div className="hidden md:flex flex-col items-center">
                            <span className="text-white font-bold text-2xl">Zero</span>
                            <span className="text-slate-500 text-sm">Server Logs</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
