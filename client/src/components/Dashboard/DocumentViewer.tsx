import React from 'react';
import { Download, Copy, Share2, MoreVertical } from 'lucide-react';

interface DocumentViewerProps {
    file: {
        id: string;
        name: string;
        path: string;
        mimeType?: string;
        content?: string;
        createdAt?: string;
    } | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file }) => {
    if (!file) {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F9FAFB',
                    color: '#999',
                    fontSize: '16px',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                <div style={{ fontSize: '48px' }}>📄</div>
                <div>Select a file to view</div>
            </div>
        );
    }

    const isPDF = file.mimeType?.includes('pdf');
    const isImage = file.mimeType?.includes('image');
    const isText = file.mimeType?.includes('text') || file.name?.endsWith('.md');

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                borderLeft: '1px solid #E5E7EB',
                borderRight: '1px solid #E5E7EB',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    borderBottom: '1px solid #E5E7EB',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#E0E7FF',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                        }}
                    >
                        📄
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0',
                                color: '#000',
                                wordBreak: 'break-word',
                            }}
                        >
                            {file.name}
                        </h3>
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#999',
                                margin: '2px 0 0 0',
                            }}
                        >
                            {file.path}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <button
                        style={{
                            background: 'none',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#333',
                        }}
                        title="Download file"
                    >
                        <Download size={14} /> Download
                    </button>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#666',
                        }}
                        title="More options"
                    >
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    backgroundColor: '#FFFFFF',
                }}
            >
                {isText && file.content ? (
                    <div
                        style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#333',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            fontFamily: 'monospace',
                        }}
                    >
                        {file.content}
                    </div>
                ) : isImage ? (
                    <img
                        src={file.content || ''}
                        alt={file.name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: '8px',
                        }}
                    />
                ) : isPDF ? (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#999',
                            padding: '20px',
                        }}
                    >
                        📕 PDF files can be downloaded and viewed
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#999',
                            padding: '20px',
                        }}
                    >
                        Preview not available for this file type
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    borderTop: '1px solid #E5E7EB',
                    padding: '12px 24px',
                    fontSize: '11px',
                    color: '#999',
                    backgroundColor: '#F9FAFB',
                }}
            >
                Created: {file.createdAt || 'Unknown'}
            </div>
        </div>
    );
};

export default DocumentViewer;
