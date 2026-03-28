import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle, FileUp } from 'lucide-react';
import { fileService } from '../../services/FileService';

interface UploadZoneProps {
    driveId: string;
    topicName: string;
    onUploadComplete: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ driveId, topicName, onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleUpload = async (files: FileList) => {
        if (!files.length) return;
        
        setUploading(true);
        setStatus('idle');
        setProgress(0);

        try {
            // We handle the first file for this implementation
            const file = files[0];
            await fileService.uploadFile(driveId, topicName, file, (p) => setProgress(p));
            
            setStatus('success');
            onUploadComplete();
            
            // Reset after delay
            setTimeout(() => {
                setStatus('idle');
                setUploading(false);
                setProgress(0);
            }, 3000);
        } catch (err) {
            console.error('Upload failed:', err);
            setStatus('error');
            setUploading(false);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleUpload(e.dataTransfer.files);
        }
    }, [driveId, topicName]);

    return (
        <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative group h-48 rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-8 text-center overflow-hidden
                ${isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
                ${uploading ? 'pointer-events-none' : 'cursor-pointer'}
            `}
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {!uploading && status === 'idle' && (
                <>
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500">
                        <Upload size={24} />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-sm font-semibold text-white">Drop research assets here</p>
                        <p className="text-xs text-slate-500">PDFs, Images, or Documents up to 50MB</p>
                    </div>
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    />
                </>
            )}

            {uploading && (
                <div className="space-y-6 w-full max-w-xs relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            Streaming to Drive
                        </span>
                        <span className="text-xs font-mono text-slate-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center animate-fade-in space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={28} />
                    </div>
                    <p className="text-sm font-bold text-white">Vault Synced Successfully</p>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center animate-fade-in space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                        <X size={28} />
                    </div>
                    <p className="text-sm font-bold text-white">Upload Interrupted</p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="text-xs text-red-400 hover:text-red-300"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
