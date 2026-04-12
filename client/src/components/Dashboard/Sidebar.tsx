import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Plus, Search, MoreVertical, LogOut } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
    const { subjects, activeTopic, setActiveTopic, addSubject, addTopic } = useLibrary();
    const { logout, user } = useAuth();
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
    const [showNewSubject, setShowNewSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    // Bug fix: track which subject is getting a new topic
    const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);
    const [newTopicName, setNewTopicName] = useState('');

    const toggleSubject = (name: string) => {
        setExpandedSubjects(prev => 
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;
        await addSubject(newSubjectName);
        setNewSubjectName('');
        setShowNewSubject(false);
    };

    const handleAddTopic = async (e: React.FormEvent, subjectName: string) => {
        e.preventDefault();
        if (!newTopicName.trim()) return;
        await addTopic(subjectName, newTopicName);
        setNewTopicName('');
        setAddingTopicTo(null);
    };

    return (
        <aside className="w-80 h-screen glass-card border-r border-white/5 flex flex-col relative z-20">
            {/* Nav Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                        M
                    </div>
                    <span className="text-white font-bold tracking-tight">Vault Explorer</span>
                </div>
            </div>

            {/* User Profile Hook */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-emerald-400 font-bold uppercase">
                        {user?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest leading-none mt-1">Primary Vault</p>
                    </div>
                    <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search notes..." 
                        className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                </div>
            </div>

            {/* Library Tree */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Subjects</span>
                    <button 
                        onClick={() => setShowNewSubject(true)}
                        className="text-emerald-400 hover:bg-emerald-400/10 p-1 rounded-md transition-all"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* New Subject Input */}
                {showNewSubject && (
                    <form onSubmit={handleAddSubject} className="mb-4 px-2">
                        <input 
                            autoFocus
                            className="w-full bg-slate-800 border border-emerald-500/30 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                            placeholder="Subject Name..."
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            onBlur={() => !newSubjectName && setShowNewSubject(false)}
                        />
                    </form>
                )}

                {/* Subject List */}
                {Object.entries(subjects).map(([name, data]) => (
                    <div key={name} className="space-y-0.5">
                        <button 
                            onClick={() => toggleSubject(name)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all group ${expandedSubjects.includes(name) ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
                        >
                            <ChevronRight 
                                size={14} 
                                className={`text-slate-600 transition-transform duration-300 ${expandedSubjects.includes(name) ? 'rotate-90 text-emerald-400' : ''}`} 
                            />
                            <Folder size={16} className={expandedSubjects.includes(name) ? 'text-emerald-400' : 'text-slate-500'} />
                            <span className={`text-sm font-medium truncate flex-1 text-left ${expandedSubjects.includes(name) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {name}
                            </span>
                        </button>

                        {/* Topics Sub-list */}
                        {expandedSubjects.includes(name) && (
                            <div className="ml-6 pl-3 border-l border-white/5 py-1 space-y-0.5 animate-fade-in">
                                {Object.entries(data.topics || {}).map(([topicName, topicData]) => (
                                    <button 
                                        key={topicName}
                                        onClick={() => setActiveTopic({ subjectName: name, topicName, data: topicData })}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeTopic?.topicName === topicName && activeTopic?.subjectName === name ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}`}
                                    >
                                        <FileText size={14} />
                                        <span className="truncate flex-1 text-left">{topicName}</span>
                                    </button>
                                ))}
                                {/* Bug fix: Add Topic now triggers inline input */}
                                {addingTopicTo === name ? (
                                    <form onSubmit={(e) => handleAddTopic(e, name)} className="px-1">
                                        <input
                                            autoFocus
                                            className="w-full bg-slate-800 border border-emerald-500/30 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                                            placeholder="Topic name..."
                                            value={newTopicName}
                                            onChange={(e) => setNewTopicName(e.target.value)}
                                            onBlur={() => !newTopicName && setAddingTopicTo(null)}
                                        />
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => { setAddingTopicTo(name); setNewTopicName(''); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-emerald-400 transition-all italic"
                                    >
                                        <Plus size={12} />
                                        <span>Add Topic</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="glass-card rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] text-slate-500 font-medium">Synced to Drive</span>
                    </div>
                    <button className="text-slate-500 hover:text-white transition-colors">
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
