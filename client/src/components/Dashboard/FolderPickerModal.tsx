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

export type PickerTarget = { id: string | null; name: string };

interface FolderPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (parent: PickerTarget, folderName: string) => Promise<void>;
    rootFolderId: string | null;
    tabs: VaultTab[];
    defaultTarget?: PickerTarget | null;
    childrenByFolderId: Map<string, DriveChild[]>;
    loadingFolders: Set<string>;
    onLoadChildren: (folderId: string) => Promise<void> | void;
}

const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    rootFolderId,
    tabs,
    defaultTarget,
    childrenByFolderId,
    loadingFolders,
    onLoadChildren,
}) => {
    const [folderName, setFolderName] = useState('');
    const [target, setTarget] = useState<PickerTarget | null>(defaultTarget ?? null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTarget(defaultTarget ?? null);
        setFolderName('');
        setError(null);
    }, [isOpen, defaultTarget]);

    const handleToggle = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        if (!childrenByFolderId.has(id)) onLoadChildren(id);
    };

    const handleCreate = async () => {
        if (!folderName.trim() || !target) return;
        setSubmitting(true);
        setError(null);
        try {
            await onCreate(target, folderName.trim());
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Failed to create folder');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && folderName.trim() && target && !submitting) {
            e.preventDefault();
            handleCreate();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const targetLabel = useMemo(() => {
        if (!target) return 'nowhere (pick a location)';
        if (target.id === null) return 'My-Notebook (root)';
        return target.name;
    }, [target]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
            onKeyDown={handleKeyDown}
        >
            <div
                className="w-[480px] max-w-[92vw] max-h-[86vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-[#001D4A] font-bold text-base">Create new folder</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Pick any location in your vault
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Name input */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Folder name
                    </label>
                    <input
                        autoFocus
                        type="text"
                        placeholder="e.g. Operating Systems"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="mt-2 w-full bg-[#F3F6F9] border border-transparent focus:border-[#00337C] focus:bg-white outline-none rounded-xl py-2.5 px-3 text-sm transition"
                    />
                </div>

                {/* Tree */}
                <div className="px-6 py-4 flex-1 overflow-y-auto">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Create inside
                    </label>
                    <div className="mt-2 border border-gray-100 rounded-xl py-2">
                        {/* Root option */}
                        <PickerRow
                            icon={<Home size={14} />}
                            label="My-Notebook (root, same level as Studies)"
                            level={0}
                            isActive={target?.id === null}
                            onClick={() =>
                                setTarget({ id: null, name: 'My-Notebook (root)' })
                            }
                        />

                        {/* Tabs */}
                        {tabs.map((tab) => (
                            <FolderTreeNode
                                key={tab.id}
                                id={tab.id}
                                name={tab.name}
                                level={1}
                                target={target}
                                setTarget={setTarget}
                                expanded={expanded}
                                onToggle={handleToggle}
                                childrenByFolderId={childrenByFolderId}
                                loadingFolders={loadingFolders}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
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
                            onClick={handleCreate}
                            disabled={!folderName.trim() || !target || submitting}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-[#001D4A] text-white hover:bg-[#002861] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            Create
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="px-6 pb-3 text-xs text-red-500 -mt-2">{error}</div>
                )}
                {!rootFolderId && (
                    <div className="px-6 pb-3 text-xs text-amber-600 -mt-2">
                        Vault is still loading…
                    </div>
                )}
            </div>
        </div>
    );
};

const FolderTreeNode: React.FC<{
    id: string;
    name: string;
    level: number;
    target: PickerTarget | null;
    setTarget: (t: PickerTarget) => void;
    expanded: Set<string>;
    onToggle: (id: string) => void;
    childrenByFolderId: Map<string, DriveChild[]>;
    loadingFolders: Set<string>;
}> = ({
    id,
    name,
    level,
    target,
    setTarget,
    expanded,
    onToggle,
    childrenByFolderId,
    loadingFolders,
}) => {
    const isExpanded = expanded.has(id);
    const isLoading = loadingFolders.has(id);
    const isActive = target?.id === id;
    const kids = childrenByFolderId.get(id);
    const folderKids = (kids || []).filter((k) => k.type === 'folder');

    return (
        <>
            <PickerRow
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
                isActive={isActive}
                onClick={() => setTarget({ id, name })}
                onChevron={() => onToggle(id)}
            />
            {isExpanded &&
                folderKids.map((child) => (
                    <FolderTreeNode
                        key={child.id}
                        id={child.id}
                        name={child.name}
                        level={level + 1}
                        target={target}
                        setTarget={setTarget}
                        expanded={expanded}
                        onToggle={onToggle}
                        childrenByFolderId={childrenByFolderId}
                        loadingFolders={loadingFolders}
                    />
                ))}
            {isExpanded && !isLoading && folderKids.length === 0 && kids && (
                <div
                    className="text-[11px] text-gray-400 italic"
                    style={{ paddingLeft: `${(level + 1) * 18 + 14}px`, padding: '4px 0 4px 0' }}
                >
                    (empty)
                </div>
            )}
        </>
    );
};

const PickerRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    level: number;
    isActive: boolean;
    onClick: () => void;
    chevron?: boolean;
    onChevron?: () => void;
    secondaryIcon?: React.ReactNode;
}> = ({ icon, label, level, isActive, onClick, chevron, onChevron, secondaryIcon }) => (
    <div
        onClick={onClick}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 pr-3 cursor-pointer transition ${
            isActive ? 'bg-[#EBF2FF] text-[#00337C]' : 'hover:bg-gray-50'
        }`}
    >
        {chevron ? (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChevron?.();
                }}
                className="p-0.5 text-gray-500 hover:text-gray-800 rounded"
                aria-label="Toggle"
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

export default FolderPickerModal;
