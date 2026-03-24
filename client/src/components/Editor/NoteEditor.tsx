import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from './EditorToolbar';
import { noteService } from '../../services/NoteService';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';

interface NoteEditorProps {
    driveId: string;
    topicName: string;
    noteId: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ driveId, topicName, noteId }) => {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
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
            handleAutoSave(editor.getJSON());
        },
    });

    // 1. Initial Load of Note Content
    useEffect(() => {
        const loadNote = async () => {
            if (!editor) return;
            try {
                const note = await noteService.getNote(driveId, noteId);
                editor.commands.setContent(note.content || '');
                setStatus('idle');
            } catch (err) {
                console.error('Failed to load note:', err);
                setStatus('error');
            }
        };

        loadNote();
    }, [editor, driveId, noteId]);

    // 2. Debounced Auto-Save Logic
    const handleAutoSave = (jsonContent: any) => {
        setStatus('saving');
        
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(async () => {
            try {
                await noteService.updateNote(driveId, noteId, jsonContent);
                setStatus('saved');
                
                // Switch back to idle after showing "saved" for a moment
                setTimeout(() => setStatus('idle'), 3000);
            } catch (err) {
                console.error('Auto-save failed:', err);
                setStatus('error');
            }
        }, 2000); // 2-second debounce
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Persistence Status Indicator */}
            <div className="fixed bottom-10 right-10 z-30">
                <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold shadow-2xl">
                    {status === 'saving' && (
                        <>
                            <Loader2 size={14} className="animate-spin text-emerald-400" />
                            <span className="text-slate-400">Saving to Drive...</span>
                        </>
                    )}
                    {status === 'saved' && (
                        <>
                            <Cloud size={14} className="text-emerald-400" />
                            <span className="text-emerald-400">Vault Synced</span>
                        </>
                    )}
                    {status === 'idle' && (
                        <>
                            <Cloud size={14} className="text-slate-600" />
                            <span className="text-slate-600">Saved</span>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <CloudOff size={14} className="text-red-400" />
                            <span className="text-red-400">Sync Error</span>
                        </>
                    )}
                </div>
            </div>

            {/* Floating Toolbar */}
            <EditorToolbar editor={editor} />

            {/* Note Canvas */}
            <div className="flex-1 px-12 md:px-24 py-12 max-w-5xl mx-auto w-full">
                <div className="prose prose-invert prose-emerald max-w-none focus:outline-none">
                    <EditorContent editor={editor} />
                </div>
            </div>
            
            {/* Editor Styles (Scoped to TipTap) */}
            <style>{`
                .ProseMirror {
                    outline: none;
                    min-height: 70vh;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #cbd5e1;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #475569;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror h1 { font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 1.5rem; }
                .ProseMirror h2 { font-size: 1.8rem; font-weight: 700; color: #f1f5f9; margin-top: 2.5rem; }
                .ProseMirror blockquote { border-left: 4px solid #10b981; padding-left: 1.5rem; font-style: italic; color: #94a3b8; }
            `}</style>
        </div>
    );
};

export default NoteEditor;
