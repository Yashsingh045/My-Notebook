import React, { useEffect, useRef, useState } from 'react';
import { Bell, Loader2, X } from 'lucide-react';
import {
    activityService,
    type ActivityAction,
    type ActivityEntry,
} from '../../services/ActivityService';

const actionVerb: Record<ActivityAction, string> = {
    'create-folder': 'created folder',
    'upload-file': 'uploaded file',
    'create-note': 'created note',
    'save-note': 'saved note',
    'delete-file': 'deleted file',
    'add-drive': 'connected drive',
    'remove-drive': 'removed drive',
    'update-username': 'updated username to',
};

const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const time = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${date} · ${time}`;
};

const NotificationPanel: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('you');
    const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
    const [entries, setEntries] = useState<ActivityEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await activityService.list();
            setUsername(data.username);
            setAccountCreatedAt(data.accountCreatedAt);
            setEntries(data.entries);
        } catch (err: any) {
            setError(
                err?.response?.data?.message || err.message || 'Failed to load activity'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && entries.length === 0 && !loading) load();
    }, [open]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Activity"
            >
                <Bell size={20} />
                {entries.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-[400px] max-h-[28rem] bg-white border border-[#E5E5E5] rounded-2xl shadow-xl overflow-hidden flex flex-col z-40">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-[#001D4A]">Activity</h3>
                            {accountCreatedAt && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    Since {new Date(accountCreatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={load}
                                className="text-[10px] font-bold text-[#00337C] uppercase tracking-widest hover:underline px-2"
                                disabled={loading}
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-400">
                                <Loader2 size={14} className="animate-spin" /> Loading…
                            </div>
                        )}
                        {!loading && error && (
                            <div className="px-4 py-6 text-sm text-red-500">{error}</div>
                        )}
                        {!loading && !error && entries.length === 0 && (
                            <div className="px-4 py-10 text-center text-sm text-gray-400">
                                No activity yet. Create a folder or upload a file to see it here.
                            </div>
                        )}
                        {!loading &&
                            !error &&
                            entries.map((e) => (
                                <div
                                    key={e.id}
                                    className="px-4 py-3 border-b border-gray-50 last:border-b-0"
                                >
                                    <p className="text-[13px] text-[#1A1A1A]">
                                        <span className="font-semibold">{username}</span>{' '}
                                        <span className="text-gray-600">
                                            {actionVerb[e.action] || e.action}
                                        </span>{' '}
                                        <span className="font-semibold">{e.targetName}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {formatTimestamp(e.createdAt)}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
