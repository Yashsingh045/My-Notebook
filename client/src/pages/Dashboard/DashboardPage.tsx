import React from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import { useLibrary } from '../../context/LibraryContext';
import { BookOpen, Clock, Sparkles } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { activeTopic, loading } = useLibrary();

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            {/* Left Section: Nav Tree */}
            <Sidebar />

            {/* Right Section: Workspace */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
                
                {/* Contextual Header */}
                <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-slate-950/40 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm">Dashboard</span>
                        <span className="text-slate-700">/</span>
                        <span className="text-emerald-400 font-medium text-sm">
                            {activeTopic ? activeTopic.subjectName : 'Overview'}
                        </span>
                        {activeTopic && (
                            <>
                                <span className="text-slate-700">/</span>
                                <span className="text-white font-semibold text-sm">{activeTopic.topicName}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-white transition-colors">
                            <Clock size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {activeTopic ? (
                        /* Case: Topic Active (Phase 5 will render Editor here) */
                        <div className="p-12 max-w-5xl mx-auto space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                    <Sparkles size={12} />
                                    <span>Active Context</span>
                                </div>
                                <h1 className="text-5xl font-bold text-white font-display">
                                    {activeTopic.topicName}
                                </h1>
                                <p className="text-slate-400 text-lg">
                                    This topic is being synced securely from your <span className="text-slate-200">"{activeTopic.subjectName}"</span> folder.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                                <div className="glass-card p-8 rounded-3xl border-emerald-500/20 group hover:bg-emerald-500/5 transition-all cursor-pointer">
                                    <h3 className="text-xl font-bold text-white mb-2">Notes</h3>
                                    <p className="text-slate-500 text-sm mb-6">Create rich-text studies with TipTap.</p>
                                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Coming in Phase 5</span>
                                </div>
                                <div className="glass-card p-8 rounded-3xl group hover:bg-emerald-500/5 transition-all cursor-pointer">
                                    <h3 className="text-xl font-bold text-white mb-2">Assets</h3>
                                    <p className="text-slate-500 text-sm mb-6">Upload PDFs, Images, and CSVs to Drive.</p>
                                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Coming in Phase 6</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Case: Welcome / Empty State */
                        <div className="flex flex-col items-center justify-center min-h-full p-20 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] border border-white/5 flex items-center justify-center text-slate-500 mb-8 border-dashed">
                                <BookOpen size={40} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 font-display">Welcome to Your Vault</h2>
                            <p className="text-slate-500 max-w-sm mb-12">
                                Select a topic from the sidebar or create a new subject to begin organizing your knowledge.
                            </p>
                            
                            {loading && (
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span className="text-sm font-medium">Syncing with Google Drive...</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
