import React from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    File,
    Loader2,
} from 'lucide-react';

export interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    children?: FileNode[];
    mimeType?: string;
    path: string;
    content?: string;
}

interface FileExplorerNodeProps {
    node: FileNode;
    level: number;
    onFileSelect: (file: FileNode) => void;
    onFolderSelect?: (folder: { id: string; name: string }) => void;
    expandedFolders: Set<string>;
    onToggleFolder: (nodeId: string) => void;
    activeFolderId?: string | null;
    loadingFolders?: Set<string>;
}

const FileExplorerNode: React.FC<FileExplorerNodeProps> = ({
    node,
    level,
    onFileSelect,
    onFolderSelect,
    expandedFolders,
    onToggleFolder,
    activeFolderId,
    loadingFolders,
}) => {
    const isExpanded = expandedFolders.has(node.id);
    const isActive = activeFolderId === node.id;
    const isLoading = loadingFolders?.has(node.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') onToggleFolder(node.id);
    };

    const handleRowClick = () => {
        if (node.type === 'file') onFileSelect(node);
        else onFolderSelect?.({ id: node.id, name: node.name });
    };

    return (
        <div>
            <div
                onClick={handleRowClick}
                style={{
                    paddingLeft: `${level * 16}px`,
                    padding: '8px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#EBF2FF' : 'transparent',
                    borderRadius: '6px',
                    transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.04)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                }}
            >
                {node.type === 'folder' ? (
                    <button
                        onClick={handleToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#666',
                        }}
                        aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                    >
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : isExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                ) : (
                    <div style={{ width: '16px' }} />
                )}

                {node.type === 'folder' ? (
                    isExpanded ? (
                        <FolderOpen size={16} color="#7C3AED" />
                    ) : (
                        <Folder size={16} color="#7C3AED" />
                    )
                ) : (
                    <File size={16} color="#2563EB" />
                )}

                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: node.type === 'folder' ? 600 : 400,
                        color: isActive ? '#00337C' : '#333',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                    }}
                >
                    {node.name}
                </span>
            </div>

            {node.type === 'folder' && isExpanded && node.children && node.children.length > 0 && (
                <div>
                    {node.children.map((child) => (
                        <FileExplorerNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onFileSelect={onFileSelect}
                            onFolderSelect={onFolderSelect}
                            expandedFolders={expandedFolders}
                            onToggleFolder={onToggleFolder}
                            activeFolderId={activeFolderId}
                            loadingFolders={loadingFolders}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileExplorerNode;
