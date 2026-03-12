import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="glass-card p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden group">
                    {/* Animated Background Blob */}
                    <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-10">
                            <Lock size={32} />
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            Ready to Claim Your <br />
                            <span className="text-gradient">Digital Sovereignty?</span>
                        </h2>
                        
                        <p className="text-slate-400 text-lg mb-12">
                            Join thousands of students and researchers who have moved their 
                            knowledge base into their own private vaults. Experience AI 
                            without surveillance.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/register" className="btn-premium group w-full sm:w-auto">
                                <span className="flex items-center justify-center gap-2">
                                    Create My Vault
                                    <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                                </span>
                            </Link>
                            
                            <span className="text-slate-500 text-sm italic">
                                Safe, Private, & Permanent.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
