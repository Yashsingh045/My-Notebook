import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Code as CodeIcon,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Save,
    Loader2,
    Cloud,
    CloudOff,
    ArrowLeft,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Highlighter,
    CheckSquare,
    Palette,
} from 'lucide-react';
import { fileService } from '../../services/FileService';

export const NOTE_SUFFIX = '.note.json';

export type NoteFile = {
    id: string;
    name: string;
};

export type NoteDocPayload = {
    type: 'tiptap-note';
    version: 1;
    title: string;
    doc: unknown; // TipTap JSON document
    updatedAt: string;
};

interface NoteDocEditorProps {
    driveId: string;
    file: NoteFile;
    onClose: () => void;
    onSaved?: (file: NoteFile) => void;
}

type Status = 'loading' | 'idle' | 'saving' | 'saved' | 'dirty' | 'error';

const buildEmptyPayload = (title: string): NoteDocPayload => ({
    type: 'tiptap-note',
    version: 1,
    title,
    doc: { type: 'doc', content: [{ type: 'paragraph' }] },
    updatedAt: new Date().toISOString(),
});

const stripNoteSuffix = (name: string) =>
    name.endsWith(NOTE_SUFFIX) ? name.slice(0, -NOTE_SUFFIX.length) : name;

const NoteDocEditor: React.FC<NoteDocEditorProps> = ({
    driveId,
    file,
    onClose,
    onSaved,
}) => {
    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState<string>(stripNoteSuffix(file.name));
    const dirtyRef = useRef(false);
    const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const editor: Editor | null = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Start writing your note…' }),
            UnderlineExtension,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem.configure({ nested: true }),
        ],
        content: '',
        onUpdate: () => {
            dirtyRef.current = true;
            setStatus('dirty');
            scheduleAutosave();
        },
    });

    const scheduleAutosave = useCallback(() => {
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            handleSave();
        }, 1500);
    }, []);

    // Load existing note content
    useEffect(() => {
        if (!editor) return;
        let cancelled = false;
        const load = async () => {
            setStatus('loading');
            setError(null);
            try {
                const text = await fileService.downloadText(driveId, file.id);
                if (cancelled) return;
                let payload: NoteDocPayload | null = null;
                try {
                    const parsed = JSON.parse(text);
                    if (parsed && parsed.type === 'tiptap-note' && parsed.doc) {
                        payload = parsed as NoteDocPayload;
                    }
                } catch {
                    // fall through, treat as empty
                }
                if (!payload) {
                    payload = buildEmptyPayload(stripNoteSuffix(file.name));
                }
                setTitle(payload.title || stripNoteSuffix(file.name));
                editor.commands.setContent(payload.doc as any);
                dirtyRef.current = false;
                setStatus('idle');
            } catch (err: any) {
                if (cancelled) return;
                setError(
                    err?.response?.data?.message || err.message || 'Failed to load note'
                );
                setStatus('error');
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [editor, driveId, file.id, file.name]);

    const handleSave = useCallback(async () => {
        if (!editor) return;
        setStatus('saving');
        setError(null);
        try {
            const payload: NoteDocPayload = {
                type: 'tiptap-note',
                version: 1,
                title,
                doc: editor.getJSON(),
                updatedAt: new Date().toISOString(),
            };
            const updated = await fileService.updateFileContent(
                driveId,
                file.id,
                JSON.stringify(payload),
                'application/json'
            );
            dirtyRef.current = false;
            setStatus('saved');
            onSaved?.({ id: updated.id, name: updated.name });
            setTimeout(() => {
                setStatus((s) => (s === 'saved' ? 'idle' : s));
            }, 1500);
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Save failed');
            setStatus('error');
        }
    }, [editor, title, driveId, file.id, onSaved]);

    useEffect(() => {
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
    }, []);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    title="Close editor"
                >
                    <ArrowLeft size={16} />
                </button>
                <input
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        dirtyRef.current = true;
                        setStatus('dirty');
                        scheduleAutosave();
                    }}
                    placeholder="Untitled note"
                    className="flex-1 min-w-0 bg-transparent text-lg font-bold text-[#001D4A] outline-none focus:ring-0"
                />
                <StatusBadge status={status} />
                <button
                    onClick={handleSave}
                    disabled={status === 'saving' || status === 'loading'}
                    className="px-3 py-1.5 rounded-lg bg-[#001D4A] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#002861] disabled:opacity-50"
                >
                    {status === 'saving' ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Save size={14} />
                    )}
                    Save
                </button>
            </div>

            {/* Toolbar */}
            <Toolbar editor={editor} />

            {/* Editor */}
            <div className="flex-1 overflow-y-auto bg-[#FAFBFC]">
                <div className="max-w-3xl mx-auto px-10 py-10">
                    {status === 'loading' ? (
                        <div className="flex items-center justify-center gap-2 text-gray-400 py-20">
                            <Loader2 size={16} className="animate-spin" /> Loading note…
                        </div>
                    ) : status === 'error' ? (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    ) : (
                        <div className="prose max-w-none tiptap-note">
                            <EditorContent editor={editor} />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tiptap-note .ProseMirror {
                    outline: none;
                    min-height: 60vh;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: #1a1a1a;
                }
                .tiptap-note .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .tiptap-note .ProseMirror h1 { font-size: 1.9rem; font-weight: 700; color: #001D4A; margin: 1.2rem 0 0.6rem; }
                .tiptap-note .ProseMirror h2 { font-size: 1.45rem; font-weight: 700; color: #001D4A; margin: 1rem 0 0.5rem; }
                .tiptap-note .ProseMirror ul, .tiptap-note .ProseMirror ol { padding-left: 1.5rem; }
                .tiptap-note .ProseMirror code { background: #F3F6F9; padding: 1px 6px; border-radius: 4px; font-size: 0.9em; }
                .tiptap-note .ProseMirror pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; }
                .tiptap-note .ProseMirror blockquote { border-left: 3px solid #00337C; padding-left: 1rem; color: #475569; margin: 1rem 0; }
                .tiptap-note .ProseMirror a { color: #2563EB; text-decoration: underline; cursor: pointer; }
                .tiptap-note .ProseMirror mark { border-radius: 2px; padding: 0 2px; }
                .tiptap-note .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0.25rem; }
                .tiptap-note .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
                .tiptap-note .ProseMirror ul[data-type="taskList"] li > label { margin-top: 0.35rem; }
                .tiptap-note .ProseMirror ul[data-type="taskList"] li > div { flex: 1; }
                .tiptap-note .ProseMirror ul[data-type="taskList"] input[type="checkbox"] { accent-color: #00337C; }
            `}</style>
        </div>
    );
};

const FONT_COLORS = [
    '#1A1A1A', '#DC2626', '#D97706', '#059669',
    '#2563EB', '#7C3AED', '#DB2777', '#6B7280',
];

const HIGHLIGHT_COLORS = [
    '#FEF3C7', '#FEE2E2', '#DCFCE7', '#DBEAFE',
    '#EDE9FE', '#FCE7F3', '#F3F4F6',
];

const Toolbar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
    const [colorMenu, setColorMenu] = useState(false);
    const [highlightMenu, setHighlightMenu] = useState(false);
    if (!editor) return null;
    const btn = (active: boolean) =>
        `p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition ${
            active ? 'bg-[#EBF2FF] text-[#00337C]' : ''
        }`;

    const promptLink = () => {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL (empty to remove)', prev || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="px-6 py-2 border-b border-[#F0F0F0] flex items-center gap-1 flex-wrap">
            {/* Headings */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={btn(editor.isActive('heading', { level: 1 }))}
                title="Heading 1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btn(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                <Heading2 size={16} />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Inline marks */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={btn(editor.isActive('bold'))}
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btn(editor.isActive('italic'))}
                title="Italic"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={btn(editor.isActive('underline'))}
                title="Underline"
            >
                <UnderlineIcon size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={btn(editor.isActive('strike'))}
                title="Strikethrough"
            >
                <Strikethrough size={16} />
            </button>

            {/* Font color */}
            <div className="relative">
                <button
                    onClick={() => {
                        setColorMenu((v) => !v);
                        setHighlightMenu(false);
                    }}
                    className={btn(false)}
                    title="Font color"
                >
                    <Palette size={16} />
                </button>
                {colorMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-30 grid grid-cols-4 gap-1.5 w-[124px]">
                        {FONT_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    editor.chain().focus().setColor(c).run();
                                    setColorMenu(false);
                                }}
                                title={c}
                                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <button
                            onClick={() => {
                                editor.chain().focus().unsetColor().run();
                                setColorMenu(false);
                            }}
                            className="col-span-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#00337C] mt-1"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Highlight */}
            <div className="relative">
                <button
                    onClick={() => {
                        setHighlightMenu((v) => !v);
                        setColorMenu(false);
                    }}
                    className={btn(editor.isActive('highlight'))}
                    title="Highlight"
                >
                    <Highlighter size={16} />
                </button>
                {highlightMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-30 grid grid-cols-4 gap-1.5 w-[124px]">
                        {HIGHLIGHT_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    editor.chain().focus().setHighlight({ color: c }).run();
                                    setHighlightMenu(false);
                                }}
                                title={c}
                                className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <button
                            onClick={() => {
                                editor.chain().focus().unsetHighlight().run();
                                setHighlightMenu(false);
                            }}
                            className="col-span-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#00337C] mt-1"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Alignment */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={btn(editor.isActive({ textAlign: 'left' }))}
                title="Align left"
            >
                <AlignLeft size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={btn(editor.isActive({ textAlign: 'center' }))}
                title="Align center"
            >
                <AlignCenter size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={btn(editor.isActive({ textAlign: 'right' }))}
                title="Align right"
            >
                <AlignRight size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Lists */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btn(editor.isActive('bulletList'))}
                title="Bulleted list"
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={btn(editor.isActive('orderedList'))}
                title="Numbered list"
            >
                <ListOrdered size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={btn(editor.isActive('taskList'))}
                title="Task list"
            >
                <CheckSquare size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Blocks */}
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={btn(editor.isActive('blockquote'))}
                title="Quote"
            >
                <Quote size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={btn(editor.isActive('codeBlock'))}
                title="Code block"
            >
                <CodeIcon size={16} />
            </button>
            <button
                onClick={promptLink}
                className={btn(editor.isActive('link'))}
                title="Link"
            >
                <LinkIcon size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                className={btn(false)}
                title="Undo"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className={btn(false)}
                title="Redo"
            >
                <Redo size={16} />
            </button>
        </div>
    );
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const base =
        'text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 px-2 py-1 rounded';
    switch (status) {
        case 'saving':
            return (
                <span className={`${base} text-emerald-600 bg-emerald-50`}>
                    <Loader2 size={10} className="animate-spin" /> Saving
                </span>
            );
        case 'saved':
            return (
                <span className={`${base} text-emerald-600 bg-emerald-50`}>
                    <Cloud size={10} /> Saved
                </span>
            );
        case 'dirty':
            return (
                <span className={`${base} text-amber-600 bg-amber-50`}>
                    <CloudOff size={10} /> Unsaved
                </span>
            );
        case 'error':
            return (
                <span className={`${base} text-red-500 bg-red-50`}>
                    <CloudOff size={10} /> Error
                </span>
            );
        default:
            return null;
    }
};

export default NoteDocEditor;
