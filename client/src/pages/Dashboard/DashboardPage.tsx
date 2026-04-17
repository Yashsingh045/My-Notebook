import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Settings,
    LogOut,
    Search,
    Bell,
    User,
    GraduationCap,
    Briefcase,
    Archive,
    Plus,
    LayoutGrid,
    FileText,
    Brain,
    CloudIcon,
    MessageSquare,
    Sparkles,
    Upload,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FileExplorerNode, { type FileNode } from '../../components/Dashboard/FileExplorerNode';
import DocumentViewer from '../../components/Dashboard/DocumentViewer';
import SettingsTab from '../../components/Dashboard/SettingsTab';
import {
    libraryService,
    type DriveChild,
    type TabName,
} from '../../services/LibraryService';
import { fileService } from '../../services/FileService';

const VAULT_TABS: { name: TabName; icon: React.ElementType }[] = [
    { name: 'Studies', icon: GraduationCap },
    { name: 'Internships', icon: Briefcase },
    { name: 'Jobs', icon: Briefcase },
    { name: 'Archive', icon: Archive },
];

type TabKey = 'Dashboard' | TabName | 'Settings';

type SelectedFile = {
    id: string;
    name: string;
    mimeType?: string;
    webViewLink?: string;
    path: string;
};

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout, primaryDriveId, needsDriveConnection } = useAuth();

    const [activeTab, setActiveTab] = useState<TabKey>('Dashboard');
    const [tabs, setTabs] = useState<Record<TabName, string> | null>(null);
    const [tabsLoading, setTabsLoading] = useState(false);
    const [tabsError, setTabsError] = useState<string | null>(null);

    // Lazy cache: folderId → its direct children
    const [childrenByFolderId, setChildrenByFolderId] = useState<Map<string, DriveChild[]>>(
        new Map()
    );
    const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // The folder currently highlighted as the "target" for New Entry / upload.
    // When null, the active tab's root folder is the target.
    const [activeFolder, setActiveFolder] = useState<{ id: string; name: string } | null>(
        null
    );

    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Tab bootstrap ───────────────────────────────────────────
    const loadTabs = useCallback(async () => {
        if (!primaryDriveId) return;
        setTabsLoading(true);
        setTabsError(null);
        try {
            const folders = await libraryService.getTabs(primaryDriveId);
            setTabs(folders);
        } catch (err: any) {
            setTabsError(err?.response?.data?.message || err.message || 'Failed to load vault');
        } finally {
            setTabsLoading(false);
        }
    }, [primaryDriveId]);

    useEffect(() => {
        if (primaryDriveId && !needsDriveConnection) loadTabs();
    }, [primaryDriveId, needsDriveConnection, loadTabs]);

    // ─── Children loader ─────────────────────────────────────────
    const loadChildren = useCallback(
        async (folderId: string) => {
            if (!primaryDriveId) return;
            setLoadingFolders((prev) => new Set(prev).add(folderId));
            try {
                const children = await fileService.listChildren(primaryDriveId, folderId);
                setChildrenByFolderId((prev) => {
                    const next = new Map(prev);
                    next.set(folderId, children);
                    return next;
                });
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || err.message || 'Failed to load folder'
                );
            } finally {
                setLoadingFolders((prev) => {
                    const next = new Set(prev);
                    next.delete(folderId);
                    return next;
                });
            }
        },
        [primaryDriveId]
    );

    // Load a tab's children when it first becomes active.
    useEffect(() => {
        if (activeTab === 'Dashboard' || activeTab === 'Settings') return;
        if (!tabs) return;
        const rootId = tabs[activeTab as TabName];
        if (!rootId) return;
        if (!childrenByFolderId.has(rootId)) loadChildren(rootId);
    }, [activeTab, tabs, childrenByFolderId, loadChildren]);

    // ─── Expansion / selection ───────────────────────────────────
    const handleToggleFolder = useCallback(
        (folderId: string) => {
            setExpandedFolders((prev) => {
                const next = new Set(prev);
                if (next.has(folderId)) next.delete(folderId);
                else next.add(folderId);
                return next;
            });
            if (!childrenByFolderId.has(folderId)) loadChildren(folderId);
        },
        [childrenByFolderId, loadChildren]
    );

    const handleSelectFile = useCallback(async (node: FileNode) => {
        if (node.type !== 'file') return;
        setSelectedFile({
            id: node.id,
            name: node.name,
            mimeType: node.mimeType,
            path: node.path,
        });
    }, []);

    const handleSelectFolder = useCallback(
        (node: { id: string; name: string }) => {
            setActiveFolder(node);
            setExpandedFolders((prev) => {
                if (prev.has(node.id)) return prev;
                const next = new Set(prev);
                next.add(node.id);
                return next;
            });
            if (!childrenByFolderId.has(node.id)) loadChildren(node.id);
        },
        [childrenByFolderId, loadChildren]
    );

    // ─── Build the tree from the cache ───────────────────────────
    const currentRootId = useMemo(() => {
        if (activeTab === 'Dashboard' || activeTab === 'Settings') return null;
        if (!tabs) return null;
        return tabs[activeTab as TabName] || null;
    }, [activeTab, tabs]);

    const buildFileNode = useCallback(
        (child: DriveChild, parentPath: string): FileNode => {
            const path = `${parentPath}/${child.name}`;
            if (child.type === 'folder') {
                const kids = childrenByFolderId.get(child.id);
                const mapped: FileNode = {
                    id: child.id,
                    name: child.name,
                    type: 'folder',
                    path,
                    children: kids ? kids.map((k) => buildFileNode(k, path)) : [],
                };
                return mapped;
            }
            return {
                id: child.id,
                name: child.name,
                type: 'file',
                path,
                mimeType: child.mimeType,
            };
        },
        [childrenByFolderId]
    );

    const tree: FileNode[] = useMemo(() => {
        if (!currentRootId) return [];
        const rootKids = childrenByFolderId.get(currentRootId);
        if (!rootKids) return [];
        return rootKids.map((c) => buildFileNode(c, `/${activeTab}`));
    }, [currentRootId, childrenByFolderId, activeTab, buildFileNode]);

    // ─── Actions ─────────────────────────────────────────────────
    const targetFolder = useMemo(() => {
        if (activeFolder) return activeFolder;
        if (
            activeTab !== 'Dashboard' &&
            activeTab !== 'Settings' &&
            tabs &&
            tabs[activeTab as TabName]
        ) {
            return { id: tabs[activeTab as TabName], name: activeTab };
        }
        return null;
    }, [activeFolder, activeTab, tabs]);

    const ensureVaultTabSelected = (): boolean => {
        if (activeTab === 'Dashboard' || activeTab === 'Settings') {
            toast('Open Studies, Internships, Jobs, or Archive first.');
            return false;
        }
        if (!tabs) {
            toast.error('Vault still loading…');
            return false;
        }
        return true;
    };

    const handleCreateFolder = async () => {
        if (!primaryDriveId) return;
        if (!ensureVaultTabSelected()) return;
        const target = targetFolder;
        if (!target) return;

        const folderName = window.prompt(`New folder inside "${target.name}":`);
        if (!folderName || !folderName.trim()) return;

        const loadingId = toast.loading(`Creating "${folderName.trim()}"…`);
        try {
            const created = await fileService.createFolder(
                primaryDriveId,
                folderName.trim(),
                target.id
            );
            // Invalidate cache for the target folder
            setChildrenByFolderId((prev) => {
                const next = new Map(prev);
                const existing = next.get(target.id) || [];
                next.set(target.id, [...existing, created]);
                return next;
            });
            setExpandedFolders((prev) => new Set(prev).add(target.id));
            toast.success(`Folder "${created.name}" created in Drive`, { id: loadingId });
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err.message || 'Failed to create folder',
                { id: loadingId }
            );
        }
    };

    const handleFileUploadClick = () => {
        if (!ensureVaultTabSelected()) return;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files || !primaryDriveId) return;
        const target = targetFolder;
        if (!target) return;

        const uploads = Array.from(files);
        for (const file of uploads) {
            const loadingId = toast.loading(`Uploading ${file.name}…`);
            try {
                const uploaded = await fileService.uploadToFolder(
                    primaryDriveId,
                    target.id,
                    file
                );
                setChildrenByFolderId((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(target.id) || [];
                    next.set(target.id, [...existing, uploaded]);
                    return next;
                });
                toast.success(`${uploaded.name} saved to Drive`, { id: loadingId });
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || err.message || `Upload failed: ${file.name}`,
                    { id: loadingId }
                );
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRefresh = async () => {
        if (!primaryDriveId || !currentRootId) return;
        setChildrenByFolderId((prev) => {
            const next = new Map(prev);
            next.delete(currentRootId);
            return next;
        });
        await loadChildren(currentRootId);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    const activeFolderLabel = activeFolder?.name || (activeTab !== 'Dashboard' && activeTab !== 'Settings' ? activeTab : '');

    return (
        <div className="flex bg-[#F8F9FA] h-screen w-screen font-sans text-[#1A1A1A] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#E5E5E5] bg-white flex flex-col px-4 py-8">
                <div
                    className="mb-10 px-4 cursor-pointer"
                    onClick={() => setActiveTab('Dashboard')}
                >
                    <h2 className="text-[#001D4A] font-bold text-lg mb-1">Curator Space</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Academic & Career
                    </p>
                </div>

                <nav className="flex-1 space-y-2">
                    {VAULT_TABS.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                setActiveTab(item.name);
                                setSelectedFile(null);
                                setActiveFolder(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                activeTab === item.name
                                    ? 'bg-[#EBF2FF] text-[#00337C] shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <item.icon
                                size={18}
                                className={
                                    activeTab === item.name ? 'text-[#00337C]' : 'text-gray-400'
                                }
                            />
                            <span className="text-sm font-bold">{item.name}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setActiveTab('Settings');
                            setSelectedFile(null);
                            setActiveFolder(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === 'Settings'
                                ? 'bg-[#EBF2FF] text-[#00337C] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <Settings
                            size={18}
                            className={activeTab === 'Settings' ? 'text-[#00337C]' : 'text-gray-400'}
                        />
                        <span className="text-sm font-bold">Settings</span>
                    </button>
                </nav>

                <div className="pt-4 mt-auto border-t border-gray-100 flex flex-col gap-2">
                    <button
                        onClick={handleCreateFolder}
                        className="w-full flex items-center justify-center gap-2 bg-[#001D4A] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#002861] transition-all disabled:opacity-50"
                        disabled={activeTab === 'Dashboard' || activeTab === 'Settings' || !tabs}
                        title={
                            activeTab === 'Dashboard' || activeTab === 'Settings'
                                ? 'Open a vault tab first'
                                : `Create folder in ${activeFolderLabel || activeTab}`
                        }
                    >
                        <Plus size={16} /> New Entry
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-20 border-b border-[#E5E5E5] flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <h1
                        className="text-xl font-bold tracking-tight text-[#00337C] cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        My Notebook
                    </h1>

                    <div className="flex-1 max-w-lg mx-12">
                        <div className="relative">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search across your library..."
                                className="w-full bg-[#F3F6F9] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#00337C]/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-10 h-10 bg-[#E8F2FF] rounded-full flex items-center justify-center text-[#00337C] font-bold text-sm overflow-hidden border border-[#EBF2FF] cursor-pointer hover:shadow-md transition-all">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {activeTab === 'Dashboard' ? (
                    <DashboardHome
                        fileInputRef={fileInputRef}
                        onImportClick={handleFileUploadClick}
                        onFileUpload={handleFileUpload}
                    />
                ) : activeTab === 'Settings' ? (
                    <div className="flex-1 overflow-y-auto bg-white">
                        <SettingsTab />
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* File Explorer */}
                        <div className="w-80 border-r border-[#E5E5E5] flex flex-col bg-white">
                            <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[#001D4A] uppercase tracking-widest text-xs">
                                        {activeTab}
                                    </h3>
                                    {activeFolder && (
                                        <p className="text-[10px] text-gray-400 mt-1 truncate">
                                            In: {activeFolder.name}
                                            <button
                                                className="ml-2 text-[#00337C] hover:underline"
                                                onClick={() => setActiveFolder(null)}
                                            >
                                                clear
                                            </button>
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleFileUploadClick}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title={`Upload into ${activeFolderLabel || activeTab}`}
                                    >
                                        <Upload size={16} />
                                    </button>
                                    <button
                                        onClick={handleCreateFolder}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title={`New folder in ${activeFolderLabel || activeTab}`}
                                    >
                                        <FolderPlus size={16} />
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title="Refresh from Drive"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                {tabsLoading && !tabs ? (
                                    <CenteredMsg>
                                        <Loader2 size={28} className="animate-spin text-[#00337C] mb-3" />
                                        <span>Loading your vault…</span>
                                    </CenteredMsg>
                                ) : tabsError ? (
                                    <CenteredMsg>
                                        <span className="text-red-500">{tabsError}</span>
                                        <button
                                            onClick={loadTabs}
                                            className="mt-4 text-[10px] font-bold text-[#00337C] uppercase tracking-widest hover:underline"
                                        >
                                            Retry
                                        </button>
                                    </CenteredMsg>
                                ) : currentRootId &&
                                  loadingFolders.has(currentRootId) &&
                                  !childrenByFolderId.has(currentRootId) ? (
                                    <CenteredMsg>
                                        <Loader2 size={22} className="animate-spin text-[#00337C] mb-2" />
                                        <span>Loading from Drive…</span>
                                    </CenteredMsg>
                                ) : tree.length === 0 ? (
                                    <CenteredMsg>
                                        <LayoutGrid size={32} className="mb-4" />
                                        <p className="text-xs font-medium">No files yet</p>
                                        <button
                                            onClick={handleFileUploadClick}
                                            className="mt-4 text-[10px] font-bold text-[#00337C] uppercase tracking-widest hover:underline"
                                        >
                                            Upload first file
                                        </button>
                                    </CenteredMsg>
                                ) : (
                                    tree.map((child) => (
                                        <FileExplorerNode
                                            key={child.id}
                                            node={child}
                                            level={0}
                                            onFileSelect={handleSelectFile}
                                            onFolderSelect={handleSelectFolder}
                                            expandedFolders={expandedFolders}
                                            onToggleFolder={handleToggleFolder}
                                            activeFolderId={activeFolder?.id ?? null}
                                            loadingFolders={loadingFolders}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <DocumentViewer
                            file={selectedFile}
                            driveId={primaryDriveId}
                        />
                    </div>
                )}
            </main>

            {/* AI sidebar */}
            <aside className="w-80 border-l border-[#E5E5E5] bg-white flex flex-col p-8 overflow-hidden">
                <div className="mb-10">
                    <h3 className="text-[#7C3AED] font-bold text-lg mb-1">Editorial AI</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Intelligence Layer
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#7C3AED]">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                Insight
                            </span>
                        </div>
                        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Select a file from any vault tab to start working with it.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-50 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {['SUMMARIZE', 'CREATE MCQS', 'ALIGN JOBS'].map((action) => (
                            <button
                                key={action}
                                className="px-3 py-1.5 bg-purple-50 text-[#7C3AED] rounded-md text-[9px] font-bold tracking-widest hover:bg-purple-100 transition-all"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Ask the curator anything..."
                            className="w-full bg-[#F3F6F9] border-none rounded-2xl py-4 pl-5 pr-12 text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const CenteredMsg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 text-gray-500">
        {children}
    </div>
);

const DashboardHome: React.FC<{
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onImportClick: () => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ fileInputRef, onImportClick, onFileUpload }) => (
    <div className="flex-1 overflow-y-auto p-12 bg-white">
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-[#001D4A] tracking-tight">
                    Workspace Dashboard
                </h2>
                <p className="text-gray-500 text-lg">
                    Capture, synthesize, and architecturalize your career intelligence.
                </p>
            </div>

            <div className="group cursor-pointer relative" onClick={onImportClick}>
                <div className="border-2 border-dashed border-[#E5E5E5] rounded-[2rem] p-16 flex flex-col items-center justify-center gap-6 hover:border-[#00337C] transition-all bg-[#F9FBFF]/50 group-hover:bg-[#F0F5FF]">
                    <div className="w-16 h-16 bg-[#E8F2FF] rounded-2xl flex items-center justify-center text-[#00337C] shadow-sm transform group-hover:scale-110 transition-transform">
                        <CloudIcon size={32} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-[#001D4A]">Import New Intelligence</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Open one of the vault tabs (Studies, Internships, Jobs, Archive) to upload
                            files into your Drive vault.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {['PDF', 'DOCX', 'Markdown'].map((tag) => (
                            <span
                                key={tag}
                                className="px-5 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold tracking-widest uppercase"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onFileUpload}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#001D4A]">Tips</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <TipCard icon={<Brain size={20} />} accent="purple" title="Organize by career phase">
                        Studies for coursework, Internships for hands-on experience, Jobs for full-time
                        work, Archive for completed items.
                    </TipCard>
                    <TipCard icon={<FileText size={20} />} accent="blue" title="Nested folders">
                        Inside any tab, create folders per subject, company, or project.
                        Click a folder once to select it as the target for New Entry.
                    </TipCard>
                    <TipCard
                        icon={<MessageSquare size={20} />}
                        accent="emerald"
                        title="Synced to your Drive"
                    >
                        Everything you create or upload is saved to your personal Google Drive under
                        My-Notebook. No server copy, no lock-in.
                    </TipCard>
                </div>
            </div>
        </div>
    </div>
);

const TipCard: React.FC<{
    icon: React.ReactNode;
    accent: 'purple' | 'blue' | 'emerald';
    title: string;
    children: React.ReactNode;
}> = ({ icon, accent, title, children }) => {
    const bg =
        accent === 'purple'
            ? 'bg-purple-50 text-purple-600'
            : accent === 'blue'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-emerald-50 text-emerald-600';
    return (
        <div className="bg-white border border-[#E5E5E5] rounded-[1.5rem] p-6 space-y-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
            <h4 className="text-lg font-bold text-[#1A1A1A]">{title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
        </div>
    );
};

const FolderPlus: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 11h6" />
        <path d="M15 8v6" />
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

export default DashboardPage;
