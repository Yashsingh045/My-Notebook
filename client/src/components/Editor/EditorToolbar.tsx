import React from 'react';
import { Editor } from '@tiptap/react';
import { 
    Bold, Italic, List, ListOrdered, Code, 
    Heading1, Heading2, Quote, Undo, Redo 
} from 'lucide-react';

interface ToolbarProps {
    editor: Editor | null;
}

const EditorToolbar: React.FC<ToolbarProps> = ({ editor }) => {
    if (!editor) return null;

    const buttons = [
        { icon: <Bold size={18} />, action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
        { icon: <Italic size={18} />, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
        { icon: <Heading1 size={18} />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: { heading: { level: 1 } } },
        { icon: <Heading2 size={18} />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: { heading: { level: 2 } } },
        { icon: <List size={18} />, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
        { icon: <ListOrdered size={18} />, action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList' },
        { icon: <Quote size={18} />, action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote' },
        { icon: <Code size={18} />, action: () => editor.chain().focus().toggleCode().run(), active: 'code' },
    ];

    return (
        <div className="flex items-center gap-1 p-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl glass-card sticky top-20 z-20 mx-auto w-fit transition-all duration-300">
            <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
                <button 
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <Undo size={18} />
                </button>
                <button 
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <Redo size={18} />
                </button>
            </div>

            {buttons.map((btn, idx) => (
                <button
                    key={idx}
                    onClick={btn.action}
                    className={`p-2 rounded-xl transition-all ${
                        editor.isActive(btn.active as any) 
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

export default EditorToolbar;
