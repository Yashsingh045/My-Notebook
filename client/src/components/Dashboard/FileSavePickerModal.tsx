import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    Home,
    Loader2,
    X,
} from 'lucide-react';
import type { DriveChild, VaultTab } from '../../services/LibraryService';

export type SaveTarget = { id: string | null; name: string };

interface FileSavePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (target: SaveTarget) => Promise<void>;
    fileName: string;
    rootFolderId: string | null;
    tabs: VaultTab[];
    childrenByFolderId: Map<string, DriveChild[]>;
    loadingFolders: Set<string>;
    onLoadChildren: (folderId: string) => Promise<void> | void;
}

const FileSavePickerModal: React.FC<FileSavePickerModalProps> = ({
    isOpen,
    onClose,
    onSave,
    fileName,
    rootFolderId,
    tabs,
    childrenByFolderId,
    loadingFolders,
    onLoadChildren,
}) => {
    const [target, setTarget] = useState<SaveTarget | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTarget(null);
        setError(null);
    }, [isOpen]);

    const toggle = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        if (!childrenByFolderId.has(id)) onLoadChildren(id);
    };

    const handleSave = async () => {
        if (!target) return;
        setSubmitting(true);
        setError(null);
        try {
            await onSave(target);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const targetLabel = useMemo(() => {
        if (!target) return 'pick a location';
        if (target.id === null) return 'My-Notebook (root)';
        return target.name;
    }, [target]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="w-[480px] max-w-[92vw] max-h-[86vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="min-w-0">
                        <h3 className="text-[#001D4A] font-bold text-base">Save to Drive</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{fileName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-4 flex-1 overflow-y-auto">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Save to folder
                    </label>
                    <div className="mt-2 border border-gray-100 rounded-xl py-2">
                        <Row
                            icon={<Home size={14} />}
                            label="My-Notebook (root, same level as Studies)"
                            level={0}
                            active={target?.id === null}
                            onClick={() => setTarget({ id: null, name: 'My-Notebook (root)' })}
                        />
                        {tabs.map((t) => (
                            <Node
                                key={t.id}
                                id={t.id}
                                name={t.name}
                                level={1}
                                target={target}
                                setTarget={setTarget}
                                expanded={expanded}
                                toggle={toggle}
                                childrenByFolderId={childrenByFolderId}
                                loadingFolders={loadingFolders}
                            />
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-500 truncate flex-1 min-w-0">
                        Into: <span className="font-semibold text-[#001D4A]">{targetLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!target || submitting || !rootFolderId}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-[#001D4A] text-white hover:bg-[#002861] transition disabled:opacity-40 flex items-center gap-2"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            Save here
                        </button>
                    </div>
                </div>

                {error && <div className="px-6 pb-3 text-xs text-red-500 -mt-2">{error}</div>}
            </div>
        </div>
    );
};

const Node: React.FC<{
    id: string;
    name: string;
    level: number;
    target: SaveTarget | null;
    setTarget: (t: SaveTarget) => void;
    expanded: Set<string>;
    toggle: (id: string) => void;
    childrenByFolderId: Map<string, DriveChild[]>;
    loadingFolders: Set<string>;
}> = ({
    id,
    name,
    level,
    target,
    setTarget,
    expanded,
    toggle,
    childrenByFolderId,
    loadingFolders,
}) => {
    const isExpanded = expanded.has(id);
    const isLoading = loadingFolders.has(id);
    const active = target?.id === id;
    const kids = childrenByFolderId.get(id);
    const folderKids = (kids || []).filter((k) => k.type === 'folder');

    return (
        <>
            <Row
                icon={
                    isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : isExpanded ? (
                        <ChevronDown size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )
                }
                chevron
                secondaryIcon={
                    isExpanded ? (
                        <FolderOpen size={14} className="text-[#7C3AED]" />
                    ) : (
                        <Folder size={14} className="text-[#7C3AED]" />
                    )
                }
                label={name}
                level={level}
                active={active}
                onClick={() => setTarget({ id, name })}
                onChevron={() => toggle(id)}
            />
            {isExpanded &&
                folderKids.map((c) => (
                    <Node
                        key={c.id}
                        id={c.id}
                        name={c.name}
                        level={level + 1}
                        target={target}
                        setTarget={setTarget}
                        expanded={expanded}
                        toggle={toggle}
                        childrenByFolderId={childrenByFolderId}
                        loadingFolders={loadingFolders}
                    />
                ))}
            {isExpanded && !isLoading && folderKids.length === 0 && kids && (
                <div
                    className="text-[11px] text-gray-400 italic"
                    style={{ paddingLeft: `${(level + 1) * 16 + 14}px`, padding: '4px 0' }}
                >
                    (empty)
                </div>
            )}
        </>
    );
};

const Row: React.FC<{
    icon: React.ReactNode;
    label: string;
    level: number;
    active: boolean;
    onClick: () => void;
    chevron?: boolean;
    onChevron?: () => void;
    secondaryIcon?: React.ReactNode;
}> = ({ icon, label, level, active, onClick, chevron, onChevron, secondaryIcon }) => (
    <div
        onClick={onClick}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 pr-3 cursor-pointer transition ${
            active ? 'bg-[#EBF2FF] text-[#00337C]' : 'hover:bg-gray-50'
        }`}
    >
        {chevron ? (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChevron?.();
                }}
                className="p-0.5 text-gray-500 hover:text-gray-800 rounded"
            >
                {icon}
            </button>
        ) : (
            <span className="p-0.5 text-gray-500">{icon}</span>
        )}
        {secondaryIcon}
        <span className="text-[13px] font-medium truncate flex-1">{label}</span>
    </div>
);

export default FileSavePickerModal;
