import React, { useState } from 'react';
import { Sparkles, Brain, ListCheck, FileText, Loader2, ChevronRight, X } from 'lucide-react';
import { aiService } from '../../services/AIService';

interface AIInsightsPanelProps {
    driveId: string;
    noteId: string;
    onClose: () => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ driveId, noteId, onClose }) => {
    const [loading, setLoading] = useState<'mcqs' | 'summary' | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [mcqs, setMcqs] = useState<any[]>([]);

    const handleGenerateMCQs = async () => {
        setLoading('mcqs');
        try {
            const data = await aiService.generateMCQs(driveId, noteId);
            setMcqs(data.mcqs || []);
        } catch (err) {
            console.error('MCQ generation failed:', err);
        } finally {
            setLoading(null);
        }
    };

    const handleSummarize = async () => {
        setLoading('summary');
        try {
            const data = await aiService.summarizeNote(driveId, noteId);
            setSummary(data);
        } catch (err) {
            console.error('Summarization failed:', err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <aside className="w-96 bg-slate-950 border-l border-white/5 flex flex-col h-full animate-slide-in-right relative z-30 shadow-2xl">
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">AI Insights</h2>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleGenerateMCQs}
                        disabled={!!loading}
                        className="flex flex-col items-center justify-center gap-3 p-4 glass-card rounded-2xl hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            {loading === 'mcqs' ? <Loader2 size={20} className="animate-spin" /> : <ListCheck size={20} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center line-clamp-1">Quiz Me</span>
                    </button>
                    <button 
                        onClick={handleSummarize}
                        disabled={!!loading}
                        className="flex flex-col items-center justify-center gap-3 p-4 glass-card rounded-2xl hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            {loading === 'summary' ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider text-center line-clamp-1">Summarize</span>
                    </button>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Summary Result */}
                    {summary && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Brain size={14} className="text-purple-400" />
                                Academic Summary
                            </h3>
                            <div className="glass-card p-4 rounded-xl text-sm text-slate-300 leading-relaxed border-purple-500/10 bg-purple-500/[0.02]">
                                {summary.summary}
                            </div>
                        </div>
                    )}

                    {/* MCQs Result */}
                    {mcqs.length > 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <ListCheck size={14} className="text-emerald-400" />
                                Flash Quiz
                            </h3>
                            <div className="space-y-3">
                                {mcqs.map((q, idx) => (
                                    <div key={idx} className="glass-card p-4 rounded-xl border-white/5 hover:border-emerald-500/20 transition-all">
                                        <p className="text-xs font-semibold text-white mb-3 leading-medium">{idx + 1}. {q.question}</p>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {q.options.map((opt: string, oIdx: number) => (
                                                <div key={oIdx} className="text-[10px] py-1.5 px-2.5 rounded-lg bg-white/[0.03] text-slate-400 border border-white/5">
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!summary && mcqs.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <Sparkles size={40} className="mb-4 text-slate-700" />
                            <p className="text-xs text-slate-600 font-medium max-w-[180px] leading-relaxed">
                                Use the tools above to extract core intelligence from your research.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="p-4 border-t border-white/5 bg-slate-900/20">
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">OpenAI GPT-4o Online</span>
                </div>
            </footer>
        </aside>
    );
};

export default AIInsightsPanel;
