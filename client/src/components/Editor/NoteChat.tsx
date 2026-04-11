import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User as UserIcon, Loader2, Command } from 'lucide-react';
import { aiService } from '../../services/AIService';

interface NoteChatProps {
    driveId: string;
    noteId: string;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const NoteChat: React.FC<NoteChatProps> = ({ driveId, noteId, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "I've indexed this note. What would you like to explore or clarify?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const data = await aiService.chatWithNote(driveId, noteId, userMsg, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error while processing your request. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-slate-950 border border-white/5 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-in-up z-50 ring-1 ring-white/10">
            {/* Chat Header */}
            <header className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MessageSquare size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-widest">Vault Chat</h2>
                        <div className="flex items-center gap-1.5 leading-none mt-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-emerald-500/80">Context Active</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg">
                    <X size={16} />
                </button>
            </header>

            {/* Message Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.03),transparent)]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${msg.role === 'assistant' ? 'bg-slate-900 border-white/5 text-emerald-400' : 'bg-emerald-500 border-emerald-400/20 text-white'}`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <UserIcon size={16} />}
                        </div>
                        <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-slate-900/80 text-slate-300 border border-white/5 shadow-sm' : 'bg-emerald-500/10 text-emerald-50 border border-emerald-500/20'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-4 items-start animate-fade-in">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-emerald-400">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-slate-900/80 text-slate-500 text-sm border border-white/5 italic">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-slate-900/30">
                <div className="relative group">
                    <input 
                        type="text"
                        placeholder="Ask anything about this note..."
                        className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-4 pl-4 pr-14 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 bottom-2 px-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 rounded-xl transition-all flex items-center justify-center shadow-lg"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <Command size={10} />
                        <span>Enter to send</span>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NoteChat;
