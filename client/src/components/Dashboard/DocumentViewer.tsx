import React, { useEffect, useState } from 'react';
import { Download, MoreVertical, Loader2 } from 'lucide-react';
import { fileService } from '../../services/FileService';

interface DocumentViewerProps {
    file: {
        id: string;
        name: string;
        path: string;
        mimeType?: string;
        webViewLink?: string;
    } | null;
    driveId: string | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, driveId }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let createdUrl: string | null = null;

        const load = async () => {
            if (!file || !driveId) {
                setBlobUrl(null);
                setTextContent(null);
                return;
            }

            setLoading(true);
            setError(null);
            setBlobUrl(null);
            setTextContent(null);

            try {
                const url = await fileService.downloadBlobUrl(driveId, file.id);
                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }
                createdUrl = url;
                setBlobUrl(url);

                const isText =
                    file.mimeType?.startsWith('text/') ||
                    file.name.endsWith('.md') ||
                    file.name.endsWith('.json');
                if (isText) {
                    const res = await fetch(url);
                    const text = await res.text();
                    if (!cancelled) setTextContent(text);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.response?.data?.message || err.message || 'Failed to load file');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
            if (createdUrl) URL.revokeObjectURL(createdUrl);
        };
    }, [file, driveId]);

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

    const isPDF = file.mimeType?.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.mimeType?.startsWith('image/');
    const isText =
        file.mimeType?.startsWith('text/') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json');

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
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
                                fontWeight: 600,
                                margin: 0,
                                color: '#000',
                                wordBreak: 'break-word',
                            }}
                        >
                            {file.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0 0' }}>
                            {file.path}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    {blobUrl && (
                        <a
                            href={blobUrl}
                            download={file.name}
                            style={{
                                textDecoration: 'none',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#333',
                            }}
                            title="Download file"
                        >
                            <Download size={14} /> Download
                        </a>
                    )}
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

            {/* Body */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    backgroundColor: isPDF ? '#525659' : '#FFFFFF',
                    display: 'flex',
                }}
            >
                {loading ? (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            gap: '10px',
                        }}
                    >
                        <Loader2 size={18} className="animate-spin" />
                        Loading from Drive…
                    </div>
                ) : error ? (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#c00',
                            padding: '20px',
                        }}
                    >
                        {error}
                    </div>
                ) : isPDF && blobUrl ? (
                    <iframe
                        src={blobUrl}
                        title={file.name}
                        style={{ flex: 1, border: 'none', backgroundColor: '#525659' }}
                    />
                ) : isImage && blobUrl ? (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                            overflow: 'auto',
                        }}
                    >
                        <img
                            src={blobUrl}
                            alt={file.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
                        />
                    </div>
                ) : isText && textContent !== null ? (
                    <pre
                        style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '24px',
                            margin: 0,
                            fontSize: '13px',
                            lineHeight: 1.6,
                            color: '#333',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                    >
                        {textContent}
                    </pre>
                ) : (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            padding: '20px',
                            textAlign: 'center',
                        }}
                    >
                        Preview not available for this file type. Use Download above.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentViewer;
