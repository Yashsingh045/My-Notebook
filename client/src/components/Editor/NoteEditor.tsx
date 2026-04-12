import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';
import AIInsightsPanel from './AIInsightsPanel';
import NoteChat from './NoteChat';
import ShareModal from './ShareModal';
import { noteService } from '../../services/NoteService';
import { Cloud, CloudOff, Loader2, Sparkles, MessageSquare, Share2, FilePlus } from 'lucide-react';

interface NoteEditorProps {
    driveId: string;
    topicId: string;       // Real Google Drive folder ID for the topic
    topicName: string;     // Display name
}

const NoteEditor: React.FC<NoteEditorProps> = ({ driveId, topicId, topicName }) => {
    const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'saved' | 'error' | 'empty'>('loading');
    const [activePanel, setActivePanel] = useState<'ai' | 'chat' | 'share' | null>(null);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Begin your research here...',
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (currentNoteId) {
                handleAutoSave(editor.getJSON());
            }
        },
    });

    // On mount: list notes in topic, load first one or show empty state
    useEffect(() => {
        const initEditor = async () => {
            if (!editor || !driveId || !topicId) return;
            setStatus('loading');
            try {
                const notes = await noteService.listNotes(driveId, topicId);
                if (notes && notes.length > 0) {
                    // Load the most recent note
                    const firstNote = notes[0];
                    setCurrentNoteId(firstNote.id);
                    setNoteTitle(firstNote.title);
                    const noteContent = await noteService.getNote(driveId, firstNote.id);
                    editor.commands.setContent(noteContent.content || '');
                    setStatus('idle');
                } else {
                    // No notes yet — show empty state with create prompt
                    setStatus('empty');
                }
            } catch (err) {
                console.error('Failed to load notes:', err);
                setStatus('error');
            }
        };
        initEditor();
    }, [editor, driveId, topicId]);

    const handleCreateNote = async () => {
        if (!driveId || !topicId) return;
        setStatus('loading');
        try {
            const title = `${topicName} Notes`;
            const newNote = await noteService.createNote(driveId, topicId, title);
            setCurrentNoteId(newNote.id);
            setNoteTitle(title);
            editor?.commands.setContent('');
            setStatus('idle');
        } catch (err) {
            console.error('Failed to create note:', err);
            setStatus('error');
        }
    };

    const handleAutoSave = (jsonContent: any) => {
        if (!currentNoteId) return;
        setStatus('saving');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            try {
                await noteService.updateNote(driveId, currentNoteId, jsonContent);
                setStatus('saved');
                setTimeout(() => setStatus('idle'), 3000);
            } catch (err) {
                setStatus('error');
            }
        }, 2000);
    };

    // Empty state — no notes in this topic yet
    if (status === 'empty') {
        return (
            <div className="flex flex-col items-center justify-center min-h-full p-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] border border-white/5 flex items-center justify-center text-slate-500 mb-8 border-dashed">
                    <FilePlus size={36} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-display">No Notes Yet</h2>
                <p className="text-slate-500 max-w-sm mb-8">
                    Create your first note for <span className="text-slate-200 font-medium">{topicName}</span> to start researching.
                </p>
                <button
                    onClick={handleCreateNote}
                    className="btn-premium px-8 py-3 font-bold flex items-center gap-2"
                >
                    <FilePlus size={18} />
                    Create First Note
                </button>
            </div>
        );
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-full gap-4 text-slate-500">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-sm font-medium">Loading from Drive...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-row h-full w-full overflow-hidden">
            {/* Main Editor Canvas */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative custom-scrollbar">
                
                {/* Editor Header / Action Bar */}
                <div className="sticky top-0 z-20 px-12 py-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button 
                            onClick={() => setActivePanel(activePanel === 'ai' ? null : 'ai')}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-2 px-4 shadow-xl backdrop-blur-md
                                ${activePanel === 'ai' ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900/80 border-white/10 text-emerald-400 hover:bg-slate-800'}`}
                        >
                            <Sparkles size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Insights</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button 
                            onClick={() => setActivePanel('share')}
                            className="p-2 w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md flex items-center justify-center"
                        >
                            <Share2 size={18} />
                        </button>
                        <button 
                            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                            className={`p-2 px-4 rounded-xl border transition-all flex items-center gap-2 shadow-xl backdrop-blur-md
                                ${activePanel === 'chat' ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-900/80 border-white/10 text-emerald-400 hover:bg-slate-800'}`}
                        >
                            <MessageSquare size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
                        </button>
                    </div>
                </div>

                {/* Floating Toolbar */}
                <EditorToolbar editor={editor} />

                {/* Persistence Status */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30">
                    <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl bg-slate-900/90 backdrop-blur-xl border-white/5">
                        {status === 'saving' && <><Loader2 size={12} className="animate-spin text-emerald-400" /> <span className="text-slate-400">Syncing...</span></>}
                        {status === 'saved' && <><Cloud size={12} className="text-emerald-400" /> <span className="text-emerald-400">Vault Secure</span></>}
                        {status === 'idle' && <><Cloud size={12} className="text-slate-600" /> <span className="text-slate-600">Archived</span></>}
                        {status === 'error' && <><CloudOff size={12} className="text-red-400" /> <span className="text-red-400">Sync Error</span></>}
                    </div>
                </div>

                {/* Note Canvas */}
                <div className="flex-1 px-12 md:px-24 py-12 max-w-5xl mx-auto w-full">
                    <div className="prose prose-invert prose-emerald max-w-none focus:outline-none">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Slide-over Panels */}
            {activePanel === 'ai' && currentNoteId && (
                <AIInsightsPanel 
                    driveId={driveId} 
                    noteId={currentNoteId} 
                    onClose={() => setActivePanel(null)} 
                />
            )}

            {activePanel === 'chat' && currentNoteId && (
                <NoteChat 
                    driveId={driveId} 
                    noteId={currentNoteId} 
                    onClose={() => setActivePanel(null)} 
                />
            )}

            {activePanel === 'share' && currentNoteId && (
                <ShareModal 
                    driveId={driveId} 
                    noteId={currentNoteId} 
                    onClose={() => setActivePanel(null)} 
                />
            )}
            
            <style>{`
                .ProseMirror { outline: none; min-height: 70vh; font-size: 1.15rem; line-height: 2; color: #cbd5e1; }
                .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #475569; pointer-events: none; height: 0; }
                .ProseMirror h1 { font-size: 2.75rem; font-weight: 800; color: white; margin-bottom: 2rem; font-family: 'Outfit', sans-serif; }
                .ProseMirror h2 { font-size: 1.8rem; font-weight: 700; color: #f1f5f9; margin-top: 3rem; }
                .ProseMirror blockquote { border-left: 4px solid #10b981; padding: 0.5rem 0 0.5rem 2rem; font-style: italic; color: #94a3b8; background: rgba(16, 185, 129, 0.05); border-radius: 0 1rem 1rem 0; }
            `}</style>
        </div>
    );
};

export default NoteEditor;
