import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';

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
    onFolderCreate?: (parentPath: string) => void;
    expandedFolders: Set<string>;
    onToggleFolder: (nodeId: string) => void;
}

const FileExplorerNode: React.FC<FileExplorerNodeProps> = ({
    node,
    level,
    onFileSelect,
    onFolderCreate,
    expandedFolders,
    onToggleFolder,
}) => {
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            onToggleFolder(node.id);
        }
    };

    const handleNodeClick = () => {
        if (node.type === 'file') {
            onFileSelect(node);
        }
    };

    return (
        <div key={node.id}>
            {/* Node Row */}
            <div
                onClick={handleNodeClick}
                style={{
                    paddingLeft: `${level * 16}px`,
                    padding: '8px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: node.type === 'file' ? 'pointer' : 'default',
                    backgroundColor: node.type === 'file' ? 'transparent' : 'transparent',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                    if (node.type === 'file') {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
            >
                {/* Expand/Collapse Icon */}
                {node.type === 'folder' && hasChildren && (
                    <button
                        onClick={handleToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#666',
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                )}
                {node.type === 'folder' && !hasChildren && (
                    <div style={{ width: '16px' }} />
                )}

                {/* Icon */}
                {node.type === 'folder' ? (
                    isExpanded ? (
                        <FolderOpen size={16} color="#7C3AED" />
                    ) : (
                        <Folder size={16} color="#7C3AED" />
                    )
                ) : (
                    <File size={16} color="#2563EB" />
                )}

                {/* Name */}
                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: node.type === 'folder' ? '600' : '400',
                        color: '#333',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                    }}
                >
                    {node.name}
                </span>
            </div>

            {/* Children */}
            {node.type === 'folder' && isExpanded && node.children && node.children.length > 0 && (
                <div>
                    {node.children.map((child) => (
                        <FileExplorerNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onFileSelect={onFileSelect}
                            onFolderCreate={onFolderCreate}
                            expandedFolders={expandedFolders}
                            onToggleFolder={onToggleFolder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileExplorerNode;
