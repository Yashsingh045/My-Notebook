import React, { useEffect, useState } from 'react';
import { File, FileText, Image as ImageIcon, FileCode, MoreVertical, Trash2, Download, ExternalLink, Loader2, FolderOpen } from 'lucide-react';
import { fileService } from '../../services/FileService';
import UploadZone from './UploadZone';

interface FileExplorerProps {
    driveId: string;
    topicName: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ driveId, topicName }) => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await fileService.listFiles(driveId, topicName);
            setFiles(data.files || []);
        } catch (err) {
            console.error('Failed to load assets:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [driveId, topicName]);

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to move this file to the trash?')) return;
        try {
            await fileService.deleteFile(driveId, fileId);
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (err) {
            alert('Failed to delete file.');
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image')) return <ImageIcon className="text-pink-400" size={24} />;
        if (mimeType.includes('pdf')) return <FileText className="text-red-400" size={24} />;
        if (mimeType.includes('json') || mimeType.includes('javascript')) return <FileCode className="text-emerald-400" size={24} />;
        return <File className="text-slate-400" size={24} />;
    };

    const formatSize = (bytes: string) => {
        const b = parseInt(bytes);
        if (isNaN(b)) return 'N/A';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        let size = b;
        while (size >= 1024 && i < units.length - 1) {
            size /= 1024;
            i++;
        }
        return `${size.toFixed(1)} ${units[i]}`;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 font-display">Research Assets</h2>
                    <p className="text-slate-400">Manage documents and media for <span className="text-slate-200">{topicName}</span></p>
                </div>
            </div>

            {/* Upload Gateway */}
            <UploadZone driveId={driveId} topicName={topicName} onUploadComplete={loadFiles} />

            {/* File Management View */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Vault Inventory ({files.length} items)
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <Loader2 size={32} className="animate-spin text-emerald-500" />
                        <span className="text-sm font-medium">Reading Drive Metadata...</span>
                    </div>
                ) : files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="glass-card p-5 rounded-3xl group hover:border-emerald-500/30 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-800/80 transition-all">
                                        {getFileIcon(file.mimeType)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-white truncate pr-4 group-hover:text-emerald-400 transition-colors">
                                        {file.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span>{formatSize(file.size)}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                        <span className="uppercase">{file.mimeType.split('/')[1]?.slice(0, 4)}</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <button 
                                        onClick={() => window.open(file.webViewLink, '_blank')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 transition-all uppercase tracking-widest"
                                    >
                                        <ExternalLink size={12} />
                                        View
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 transition-all uppercase tracking-widest">
                                        <Download size={12} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[2.5rem] border-dashed text-slate-500 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 mb-2 border border-white/5">
                            <FolderOpen size={32} />
                        </div>
                        <p className="font-bold text-white">Vault Drawer Empty</p>
                        <p className="text-xs text-slate-400 max-w-xs text-center">Your Google Drive Topic folder doesn't have any research assets yet. Drop files above to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
