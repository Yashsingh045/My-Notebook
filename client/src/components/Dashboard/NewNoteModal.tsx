import React, { useEffect, useState } from 'react';
import { FileText, Loader2, X } from 'lucide-react';

interface NewNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string) => Promise<void>;
    /** Name of the folder the note will land in (for display only). */
    targetFolderName: string;
}

const DEFAULT_TITLE = 'Untitled note';

const NewNoteModal: React.FC<NewNoteModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    targetFolderName,
}) => {
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTitle(DEFAULT_TITLE);
        setError(null);
    }, [isOpen]);

    const handleCreate = async () => {
        const trimmed = title.trim();
        if (!trimmed) {
            setError('Title is required.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onCreate(trimmed);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Failed to create note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !submitting) {
            e.preventDefault();
            handleCreate();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#E8F2FF] text-[#00337C] rounded-lg flex items-center justify-center">
                            <FileText size={14} />
                        </div>
                        <div>
                            <h3 className="text-[#001D4A] font-bold text-base leading-tight">
                                New note
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                Saves into {targetFolderName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Title
                    </label>
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="Note title"
                        className="mt-2 w-full bg-[#F3F6F9] border border-transparent focus:border-[#00337C] focus:bg-white outline-none rounded-xl py-2.5 px-3 text-sm transition"
                    />
                    <p className="text-[11px] text-gray-400 mt-2">
                        Saved as <span className="font-mono">{title.trim() || 'untitled'}.note.json</span>{' '}
                        in your Drive — fully editable afterwards.
                    </p>
                    {error && (
                        <div className="mt-3 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={submitting || !title.trim()}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-[#001D4A] text-white hover:bg-[#002861] transition disabled:opacity-40 flex items-center gap-2"
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        Create & open
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewNoteModal;
