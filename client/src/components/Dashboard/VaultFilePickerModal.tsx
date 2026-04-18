import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    File as FileIcon,
    Folder,
    FolderOpen,
    Loader2,
    X,
} from 'lucide-react';
import { fileService } from '../../services/FileService';
import type { DriveChild, VaultTab } from '../../services/LibraryService';

interface VaultFilePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPick: (file: { id: string; name: string; mimeType?: string }) => void;
    driveId: string | null;
    tabs: VaultTab[];
    title?: string;
    hint?: string;
}

/**
 * Modal that lets the user browse their vault (tabs → folders → files) and
 * pick exactly one file. Separate from FolderPickerModal because picking a
 * file has different UX than picking a folder to write into.
 */
const VaultFilePickerModal: React.FC<VaultFilePickerModalProps> = ({
    isOpen,
    onClose,
    onPick,
    driveId,
    tabs,
    title = 'Pick a file',
    hint,
}) => {
    const [childrenByFolderId, setChildrenByFolderId] = useState<
        Map<string, DriveChild[]>
    >(new Map());
    const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selected, setSelected] = useState<DriveChild | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelected(null);
        }
    }, [isOpen]);

    const loadChildren = async (folderId: string) => {
        if (!driveId || childrenByFolderId.has(folderId)) return;
        setLoadingFolders((prev) => new Set(prev).add(folderId));
        try {
            const kids = await fileService.listChildren(driveId, folderId);
            setChildrenByFolderId((prev) => {
                const next = new Map(prev);
                next.set(folderId, kids);
                return next;
            });
        } finally {
            setLoadingFolders((prev) => {
                const next = new Set(prev);
                next.delete(folderId);
                return next;
            });
        }
    };

    const toggle = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        loadChildren(id);
    };

    // Auto-expand the tabs on first open so the picker isn't empty.
    useEffect(() => {
        if (!isOpen) return;
        tabs.forEach((t) => {
            if (!childrenByFolderId.has(t.id)) loadChildren(t.id);
        });
        setExpanded((prev) => {
            const next = new Set(prev);
            tabs.forEach((t) => next.add(t.id));
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const targetLabel = useMemo(() => selected?.name || 'nothing picked', [selected]);

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
                        <h3 className="text-[#001D4A] font-bold text-base">{title}</h3>
                        {hint && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-4 flex-1 overflow-y-auto">
                    <div className="border border-gray-100 rounded-xl py-2">
                        {tabs.length === 0 && (
                            <div className="py-6 text-center text-sm text-gray-400">
                                Vault is empty — create a folder first.
                            </div>
                        )}
                        {tabs.map((t) => (
                            <TreeNode
                                key={t.id}
                                id={t.id}
                                name={t.name}
                                type="folder"
                                level={0}
                                expanded={expanded}
                                toggle={toggle}
                                childrenByFolderId={childrenByFolderId}
                                loadingFolders={loadingFolders}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-500 truncate flex-1 min-w-0">
                        Selected: <span className="font-semibold text-[#001D4A]">{targetLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => selected && onPick(selected)}
                            disabled={!selected}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-[#001D4A] text-white hover:bg-[#002861] transition disabled:opacity-40"
                        >
                            Use this file
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TreeNode: React.FC<{
    id: string;
    name: string;
    type: 'folder' | 'file';
    mimeType?: string;
    level: number;
    expanded: Set<string>;
    toggle: (id: string) => void;
    childrenByFolderId: Map<string, DriveChild[]>;
    loadingFolders: Set<string>;
    selected: DriveChild | null;
    setSelected: (c: DriveChild) => void;
}> = ({
    id,
    name,
    type,
    mimeType,
    level,
    expanded,
    toggle,
    childrenByFolderId,
    loadingFolders,
    selected,
    setSelected,
}) => {
    const isExpanded = expanded.has(id);
    const isLoading = loadingFolders.has(id);
    const isSelected = selected?.id === id;

    if (type === 'file') {
        return (
            <div
                onClick={() =>
                    setSelected({ id, name, type: 'file', mimeType } as DriveChild)
                }
                style={{ paddingLeft: `${level * 16 + 28}px` }}
                className={`flex items-center gap-2 py-1.5 pr-3 cursor-pointer transition ${
                    isSelected ? 'bg-[#EBF2FF] text-[#00337C]' : 'hover:bg-gray-50'
                }`}
            >
                <FileIcon size={14} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[13px] font-medium truncate">{name}</span>
            </div>
        );
    }

    const kids = childrenByFolderId.get(id) || [];
    return (
        <>
            <div
                onClick={() => toggle(id)}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                className="flex items-center gap-2 py-1.5 pr-3 cursor-pointer hover:bg-gray-50 transition"
            >
                <span className="p-0.5 text-gray-500">
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : isExpanded ? (
                        <ChevronDown size={14} />
                    ) : (
                        <ChevronRight size={14} />
                    )}
                </span>
                {isExpanded ? (
                    <FolderOpen size={14} className="text-[#7C3AED]" />
                ) : (
                    <Folder size={14} className="text-[#7C3AED]" />
                )}
                <span className="text-[13px] font-semibold truncate flex-1">{name}</span>
            </div>
            {isExpanded &&
                kids.map((c) => (
                    <TreeNode
                        key={c.id}
                        id={c.id}
                        name={c.name}
                        type={c.type}
                        mimeType={c.mimeType}
                        level={level + 1}
                        expanded={expanded}
                        toggle={toggle}
                        childrenByFolderId={childrenByFolderId}
                        loadingFolders={loadingFolders}
                        selected={selected}
                        setSelected={setSelected}
                    />
                ))}
            {isExpanded && !isLoading && kids.length === 0 && (
                <div
                    className="text-[11px] text-gray-400 italic"
                    style={{ paddingLeft: `${(level + 1) * 16 + 28}px`, padding: '4px 0' }}
                >
                    (empty)
                </div>
            )}
        </>
    );
};

export default VaultFilePickerModal;
