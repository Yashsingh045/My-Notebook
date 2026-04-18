import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Folder, File as FileIcon } from 'lucide-react';
import { searchService } from '../../services/SearchService';
import type { DriveChild } from '../../services/LibraryService';

interface SearchDropdownProps {
    driveId: string | null;
    onSelectFile: (result: DriveChild) => void;
    onSelectFolder: (result: DriveChild) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
    driveId,
    onSelectFile,
    onSelectFolder,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DriveChild[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!query.trim() || !driveId) {
            setResults(null);
            setLoading(false);
            setError(null);
            return;
        }
        if (query.trim().length < 2) {
            setResults(null);
            return;
        }
        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await searchService.search(driveId, query);
                setResults(data);
                setError(null);
            } catch (err: any) {
                setError(err?.response?.data?.message || err.message || 'Search failed');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, driveId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (r: DriveChild) => {
        setOpen(false);
        setQuery('');
        if (r.type === 'folder') onSelectFolder(r);
        else onSelectFile(r);
    };

    return (
        <div ref={containerRef} className="relative">
            <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
            />
            <input
                type="text"
                placeholder="Search names and file contents…"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                className="w-full bg-[#F3F6F9] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#00337C]/20 outline-none transition-all"
            />

            {open && (query.trim().length >= 2 || loading) && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl max-h-96 overflow-y-auto z-40">
                    {loading && (
                        <div className="flex items-center gap-2 px-4 py-3 text-gray-500 text-sm">
                            <Loader2 size={14} className="animate-spin" /> Searching…
                        </div>
                    )}
                    {!loading && error && (
                        <div className="px-4 py-3 text-sm text-red-500">{error}</div>
                    )}
                    {!loading && !error && results && results.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                            No matches.
                        </div>
                    )}
                    {!loading &&
                        !error &&
                        results &&
                        results.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => handleSelect(r)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition border-b border-gray-50 last:border-b-0"
                            >
                                {r.type === 'folder' ? (
                                    <Folder size={16} className="text-[#7C3AED] flex-shrink-0" />
                                ) : (
                                    <FileIcon size={16} className="text-[#2563EB] flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                                        {r.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">
                                        {r.type === 'folder' ? 'Folder' : r.mimeType || 'File'}
                                        {r.modifiedTime
                                            ? ` · ${new Date(r.modifiedTime).toLocaleDateString()}`
                                            : ''}
                                    </p>
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
