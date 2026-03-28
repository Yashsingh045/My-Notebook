import React, { useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import NoteEditor from '../../components/Editor/NoteEditor';
import FileExplorer from '../../components/FileExplorer/FileExplorer';
import { useLibrary } from '../../context/LibraryContext';
import { BookOpen, Clock, Sparkles, FileText, FolderOpen } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { activeTopic, loading, selectedDriveId } = useLibrary();
    const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50">
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

                    {/* Tab Switcher (Only visible when a topic is selected) */}
                    {activeTopic && (
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setActiveTab('notes')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <FileText size={14} />
                                Notes
                            </button>
                            <button 
                                onClick={() => setActiveTab('files')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'files' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <FolderOpen size={14} />
                                Assets
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button className="text-slate-500 hover:text-white transition-colors">
                            <Clock size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {activeTopic ? (
                        activeTab === 'notes' ? (
                            /* Mode: Note Editor */
                            <NoteEditor 
                                key={`edit-${activeTopic.data.folderId}`}
                                driveId={selectedDriveId} 
                                topicName={activeTopic.topicName}
                                noteId={`${activeTopic.topicName}_note.json`}
                            />
                        ) : (
                            /* Mode: File Explorer */
                            <FileExplorer 
                                key={`files-${activeTopic.data.folderId}`}
                                driveId={selectedDriveId}
                                topicName={activeTopic.topicName}
                            />
                        )
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
