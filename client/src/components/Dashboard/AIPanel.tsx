import React, { useEffect, useRef, useState } from 'react';
import {
    Loader2,
    MessageSquare,
    Paperclip,
    Send,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    aiService,
    type AIMessage,
    type AssistAction,
} from '../../services/AIService';
import type { VaultTab } from '../../services/LibraryService';
import VaultFilePickerModal from './VaultFilePickerModal';

interface AIPanelProps {
    driveId: string | null;
    contextFile: { id: string; name: string; mimeType?: string } | null;
    tabs: VaultTab[];
}

const ACTION_LABEL: Record<AssistAction, string> = {
    chat: 'Chat',
    summarize: 'Summarize',
    mcqs: 'Create MCQs',
    explain: 'Explain',
    'align-jobs': 'Align Jobs',
};

const ACTION_PROMPT: Record<AssistAction, string> = {
    chat: '',
    summarize: 'Summarize this file',
    mcqs: 'Create study MCQs from this file',
    explain: 'Explain this file to me',
    'align-jobs': 'Suggest jobs based on this file',
};

const AIPanel: React.FC<AIPanelProps> = ({ driveId, contextFile, tabs }) => {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<
        { id: string; name: string; mimeType?: string } | null
    >(null);
    const [showPicker, setShowPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // When explicitly attached, the AI uses that file and ignores the auto-selected one.
    const effectiveFile = attachedFile ?? contextFile;
    const isAttached = attachedFile !== null;

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, loading]);

    const runAssist = async (action: AssistAction, userMessage?: string) => {
        if (!driveId && (action !== 'chat' || !userMessage)) return;

        const visibleUserText = userMessage || ACTION_PROMPT[action];
        const nextHistory = [...messages];
        if (visibleUserText) {
            nextHistory.push({ role: 'user', content: visibleUserText });
            setMessages(nextHistory);
        }
        setLoading(true);
        setError(null);

        try {
            const response = await aiService.assist({
                action,
                message: action === 'chat' ? userMessage : undefined,
                history: messages,
                context:
                    effectiveFile && driveId
                        ? { driveId, fileId: effectiveFile.id }
                        : undefined,
            });
            setMessages((prev) => [
                ...prev,
                ...(action !== 'chat' && visibleUserText
                    ? []
                    : []),
                { role: 'assistant', content: response },
            ]);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message || err.message || 'AI request failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        runAssist('chat', text);
    };

    const handleClear = () => {
        setMessages([]);
        setError(null);
    };

    const hasContext = effectiveFile !== null && driveId !== null;
    const quickActionsEnabled = hasContext && !loading;

    return (
        <aside className="w-80 border-l border-[#E5E5E5] bg-white flex flex-col overflow-hidden">
            <div className="px-8 pt-8 pb-4">
                <h3 className="text-[#7C3AED] font-bold text-lg mb-1">Editorial AI</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Intelligence Layer
                </p>
                {hasContext ? (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl">
                        {isAttached ? (
                            <Paperclip size={12} className="text-[#7C3AED] shrink-0" />
                        ) : (
                            <Sparkles size={12} className="text-[#7C3AED] shrink-0" />
                        )}
                        <span className="text-[11px] text-[#7C3AED] font-semibold truncate flex-1">
                            {isAttached ? 'Attached: ' : 'Using: '}
                            {effectiveFile!.name}
                        </span>
                        {isAttached && (
                            <button
                                onClick={() => setAttachedFile(null)}
                                className="p-0.5 rounded text-[#7C3AED] hover:bg-purple-100 transition"
                                title="Detach"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="mt-3 text-[11px] text-gray-400">
                        Select a note/text file or attach one to unlock quick actions.
                    </p>
                )}
                <button
                    onClick={() => setShowPicker(true)}
                    disabled={!driveId || tabs.length === 0}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] bg-white border border-purple-100 rounded-lg py-1.5 hover:bg-purple-50 transition disabled:opacity-40"
                >
                    <Paperclip size={12} /> {isAttached ? 'Replace attached file' : 'Attach file'}
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 pb-2 space-y-4"
            >
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center text-center py-8 text-gray-400 gap-2">
                        <MessageSquare size={22} className="text-gray-300" />
                        <p className="text-xs">
                            Ask anything — responses are grounded in the open file when one is
                            selected.
                        </p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <ChatBubble key={i} message={m} />
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 size={14} className="animate-spin" /> Thinking…
                    </div>
                )}
                {error && !loading && (
                    <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <X size={12} /> {error}
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="px-6 pb-3 pt-3 border-t border-gray-50">
                <div className="flex flex-wrap gap-2">
                    {(['summarize', 'mcqs', 'explain', 'align-jobs'] as AssistAction[]).map(
                        (a) => (
                            <button
                                key={a}
                                disabled={!quickActionsEnabled}
                                onClick={() => runAssist(a)}
                                title={
                                    hasContext
                                        ? ACTION_PROMPT[a]
                                        : 'Select a note/text file first'
                                }
                                className="px-3 py-1.5 bg-purple-50 text-[#7C3AED] rounded-md text-[9px] font-bold tracking-widest hover:bg-purple-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {ACTION_LABEL[a].toUpperCase()}
                            </button>
                        )
                    )}
                    {messages.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="ml-auto text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center gap-1"
                            title="Clear conversation"
                        >
                            <Trash2 size={10} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="px-6 pb-6">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Ask the curator anything…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-[#F3F6F9] border-none rounded-2xl py-4 pl-5 pr-12 text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-60"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-40"
                        title="Send"
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
            </div>

            <VaultFilePickerModal
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onPick={(f) => {
                    setAttachedFile(f);
                    setShowPicker(false);
                    toast.success(`Attached "${f.name}" to AI`);
                }}
                driveId={driveId}
                tabs={tabs}
                title="Attach a file"
                hint="The AI will answer using only the file you pick."
            />
        </aside>
    );
};

const ChatBubble: React.FC<{ message: AIMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    isUser
                        ? 'bg-[#001D4A] text-white rounded-br-md'
                        : 'bg-gray-50 border border-gray-100 text-[#1A1A1A] rounded-bl-md'
                }`}
            >
                {message.content}
            </div>
        </div>
    );
};

export default AIPanel;
