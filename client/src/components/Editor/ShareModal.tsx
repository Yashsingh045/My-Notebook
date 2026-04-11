import React, { useState } from 'react';
import { Share2, Clock, Link as LinkIcon, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { shareService } from '../../services/ShareService';

interface ShareModalProps {
    driveId: string;
    noteId: string;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ driveId, noteId, onClose }) => {
    const [expiresIn, setExpiresIn] = useState(24); // Default 24h
    const [loading, setLoading] = useState(false);
    const [shareData, setShareData] = useState<{ url: string; code: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const data = await shareService.createShareLink(driveId, noteId, expiresIn);
            setShareData({
                url: `${window.location.origin}/share/${data.accessCode}`,
                code: data.accessCode
            });
        } catch (err) {
            console.error('Sharing failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!shareData) return;
        navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden relative animate-scale-in">
                
                {/* Emerald Atmosphere Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none"></div>

                <header className="p-8 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white font-display">Share Knowledge</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Secure Public Proxy</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <div className="p-8 space-y-8 relative z-10">
                    {!shareData ? (
                        /* Selection State */
                        <>
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiration Period</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: '1 Hour', val: 1 },
                                        { label: '24 Hours', val: 24 },
                                        { label: '7 Days', val: 168 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            onClick={() => setExpiresIn(opt.val)}
                                            className={`py-4 rounded-2xl border transition-all text-xs font-bold uppercase tracking-wider
                                                ${expiresIn === opt.val 
                                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                                                    : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10'}`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <Clock size={16} className="mb-0.5" />
                                                {opt.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <ShieldCheck size={18} />
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    This creates a secure proxy link. Access will be granted directly from your vault until the link expires. Revoke any time.
                                </p>
                            </div>

                            <button 
                                onClick={handleGenerateLink}
                                disabled={loading}
                                className="w-full btn-premium py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Generating Securespace...' : 'Generate Share Link'}
                                {!loading && <LinkIcon size={16} className="transition-transform group-hover:rotate-45" />}
                            </button>
                        </>
                    ) : (
                        /* Result State */
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Direct Vault Link</label>
                                <div className="relative group">
                                    <input 
                                        readOnly
                                        value={shareData.url}
                                        className="w-full bg-slate-950 border border-emerald-500/30 rounded-2xl py-4 flex pl-4 pr-12 text-sm text-emerald-100 font-mono shadow-inner"
                                    />
                                    <button 
                                        onClick={copyToClipboard}
                                        className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center shadow-lg"
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-emerald-400/60 py-2">
                                <Check size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Link Active for {expiresIn}h</span>
                            </div>

                            <button 
                                onClick={() => setShareData(null)}
                                className="w-full py-4 text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-[0.2em] transition-colors"
                            >
                                Generate New Link
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
