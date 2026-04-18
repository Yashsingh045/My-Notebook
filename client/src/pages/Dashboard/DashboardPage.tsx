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
    Home,
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
    Folder,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FileExplorerNode, { type FileNode } from '../../components/Dashboard/FileExplorerNode';
import DocumentViewer from '../../components/Dashboard/DocumentViewer';
import SettingsTab from '../../components/Dashboard/SettingsTab';
import FolderPickerModal, {
    type PickerTarget,
} from '../../components/Dashboard/FolderPickerModal';
import FileSavePickerModal, {
    type SaveTarget,
} from '../../components/Dashboard/FileSavePickerModal';
import NoteDocEditor, { NOTE_SUFFIX } from '../../components/Editor/NoteDocEditor';
import SearchDropdown from '../../components/Dashboard/SearchDropdown';
import NotificationPanel from '../../components/Dashboard/NotificationPanel';
import AIPanel from '../../components/Dashboard/AIPanel';
import NewNoteModal from '../../components/Dashboard/NewNoteModal';
import {
    libraryService,
    type DriveChild,
    type VaultTab,
} from '../../services/LibraryService';
import { fileService } from '../../services/FileService';

const ICON_FOR_TAB: Record<string, React.ElementType> = {
    Studies: GraduationCap,
    Internships: Briefcase,
    Jobs: Briefcase,
    Archive: Archive,
};
const iconForTab = (name: string): React.ElementType => ICON_FOR_TAB[name] || Folder;

type TabKey = 'Dashboard' | 'Settings' | string; // otherwise, a VaultTab.id

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
    const [tabs, setTabs] = useState<VaultTab[] | null>(null);
    const [rootFolderId, setRootFolderId] = useState<string | null>(null);
    const [tabsLoading, setTabsLoading] = useState(false);
    const [tabsError, setTabsError] = useState<string | null>(null);

    const [childrenByFolderId, setChildrenByFolderId] = useState<Map<string, DriveChild[]>>(
        new Map()
    );
    const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const [activeFolder, setActiveFolder] = useState<{ id: string; name: string } | null>(
        null
    );
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    type PendingImport = { id: string; file: File; blobUrl: string };
    const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
    const [savingImport, setSavingImport] = useState<PendingImport | null>(null);
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dashboardImportRef = useRef<HTMLInputElement>(null);

    // ─── Tab bootstrap ───────────────────────────────────────────
    const loadTabs = useCallback(async () => {
        if (!primaryDriveId) return;
        setTabsLoading(true);
        setTabsError(null);
        try {
            const resp = await libraryService.getTabs(primaryDriveId);
            setTabs(resp.tabs);
            setRootFolderId(resp.rootFolderId);
        } catch (err: any) {
            setTabsError(err?.response?.data?.message || err.message || 'Failed to load vault');
        } finally {
            setTabsLoading(false);
        }
    }, [primaryDriveId]);

    useEffect(() => {
        if (primaryDriveId && !needsDriveConnection) loadTabs();
    }, [primaryDriveId, needsDriveConnection, loadTabs]);

    useEffect(() => {
        return () => {
            pendingImports.forEach((p) => URL.revokeObjectURL(p.blobUrl));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const activeVaultTab = useMemo(
        () =>
            tabs && activeTab !== 'Dashboard' && activeTab !== 'Settings'
                ? tabs.find((t) => t.id === activeTab) || null
                : null,
        [tabs, activeTab]
    );

    useEffect(() => {
        if (!activeVaultTab) return;
        if (!childrenByFolderId.has(activeVaultTab.id)) loadChildren(activeVaultTab.id);
    }, [activeVaultTab, childrenByFolderId, loadChildren]);

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

    const handleSelectFile = useCallback((node: FileNode) => {
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

    // ─── Build tree ──────────────────────────────────────────────
    const currentRootId = activeVaultTab?.id ?? null;

    const buildFileNode = useCallback(
        (child: DriveChild, parentPath: string): FileNode => {
            const path = `${parentPath}/${child.name}`;
            if (child.type === 'folder') {
                const kids = childrenByFolderId.get(child.id);
                return {
                    id: child.id,
                    name: child.name,
                    type: 'folder',
                    path,
                    children: kids ? kids.map((k) => buildFileNode(k, path)) : [],
                };
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
        if (!currentRootId || !activeVaultTab) return [];
        const rootKids = childrenByFolderId.get(currentRootId);
        if (!rootKids) return [];
        return rootKids.map((c) => buildFileNode(c, `/${activeVaultTab.name}`));
    }, [currentRootId, activeVaultTab, childrenByFolderId, buildFileNode]);

    // ─── Actions ─────────────────────────────────────────────────
    const defaultPickerTarget: PickerTarget | null = activeFolder
        ? activeFolder
        : activeVaultTab
          ? { id: activeVaultTab.id, name: activeVaultTab.name }
          : null;

    const handleOpenPicker = () => {
        if (!tabs) {
            toast.error('Vault still loading…');
            return;
        }
        setShowPicker(true);
    };

    const handleCreateFromPicker = async (parent: PickerTarget, name: string) => {
        if (!primaryDriveId) throw new Error('No drive connected');

        // parent.id === null means root of My-Notebook
        const created = await fileService.createFolder(
            primaryDriveId,
            name,
            parent.id ?? (rootFolderId as string)
        );

        if (parent.id === null) {
            // Root-level: refresh tab list so the new sibling appears
            await loadTabs();
            toast.success(`"${created.name}" created at vault root`);
        } else {
            setChildrenByFolderId((prev) => {
                const next = new Map(prev);
                const existing = next.get(parent.id as string) || [];
                next.set(parent.id as string, [...existing, created]);
                return next;
            });
            setExpandedFolders((prev) => new Set(prev).add(parent.id as string));
            toast.success(`"${created.name}" created in ${parent.name}`);
        }
    };

    const handleFileUploadClick = () => {
        if (activeTab === 'Dashboard' || activeTab === 'Settings') {
            toast('Open a vault tab first');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleDashboardImportClick = () => {
        dashboardImportRef.current?.click();
    };

    const handleDashboardImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files) return;
        const additions: PendingImport[] = Array.from(files).map((f) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file: f,
            blobUrl: URL.createObjectURL(f),
        }));
        setPendingImports((prev) => [...prev, ...additions]);
        if (dashboardImportRef.current) dashboardImportRef.current.value = '';
    };

    const removePending = (id: string) => {
        setPendingImports((prev) => {
            const target = prev.find((p) => p.id === id);
            if (target) URL.revokeObjectURL(target.blobUrl);
            return prev.filter((p) => p.id !== id);
        });
    };

    const handleSavePendingToTarget = async (target: SaveTarget) => {
        if (!primaryDriveId || !savingImport) throw new Error('Missing state');
        const parentFolderId = target.id ?? (rootFolderId as string);
        if (!parentFolderId) throw new Error('Drive root not available');
        const uploaded = await fileService.uploadToFolder(
            primaryDriveId,
            parentFolderId,
            savingImport.file
        );
        // Refresh that folder's cache if we've already loaded it
        setChildrenByFolderId((prev) => {
            if (!prev.has(parentFolderId)) return prev;
            const next = new Map(prev);
            next.set(parentFolderId, [...(next.get(parentFolderId) || []), uploaded]);
            return next;
        });
        // If user saved to root (same level as Studies), refresh sidebar tabs
        if (target.id === null) await loadTabs();
        toast.success(`${uploaded.name} saved to ${target.name}`);
        removePending(savingImport.id);
        setSavingImport(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (!files || !primaryDriveId) return;
        const target = activeFolder || activeVaultTab;
        if (!target) return;
        const targetId = 'id' in target ? target.id : '';

        for (const file of Array.from(files)) {
            const toastId = toast.loading(`Uploading ${file.name}…`);
            try {
                const uploaded = await fileService.uploadToFolder(primaryDriveId, targetId, file);
                setChildrenByFolderId((prev) => {
                    const next = new Map(prev);
                    const existing = next.get(targetId) || [];
                    next.set(targetId, [...existing, uploaded]);
                    return next;
                });
                toast.success(`${uploaded.name} saved to Drive`, { id: toastId });
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || err.message || `Upload failed: ${file.name}`,
                    { id: toastId }
                );
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOpenNewNote = () => {
        const target = activeFolder || activeVaultTab;
        if (!target) {
            toast('Open a vault tab first');
            return;
        }
        setShowNewNoteModal(true);
    };

    const handleCreateNote = async (title: string) => {
        if (!primaryDriveId) return;
        const target = activeFolder || activeVaultTab;
        if (!target) throw new Error('No folder selected');
        const fileName = `${title}${NOTE_SUFFIX}`;
        const targetId = 'id' in target ? target.id : '';
        const emptyDoc = {
            type: 'tiptap-note',
            version: 1,
            title,
            doc: { type: 'doc', content: [{ type: 'paragraph' }] },
            updatedAt: new Date().toISOString(),
        };
        const blob = new File([JSON.stringify(emptyDoc)], fileName, {
            type: 'application/json',
        });
        const created = await fileService.uploadToFolder(primaryDriveId, targetId, blob);
        setChildrenByFolderId((prev) => {
            const next = new Map(prev);
            const existing = next.get(targetId) || [];
            next.set(targetId, [...existing, created]);
            return next;
        });
        setSelectedFile({
            id: created.id,
            name: created.name,
            mimeType: created.mimeType,
            path: `/${target.name}/${created.name}`,
        });
        toast.success(`Note "${title}" created`);
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

    const activeFolderLabel = activeFolder?.name || activeVaultTab?.name || '';

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

                <nav className="flex-1 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => {
                            setActiveTab('Dashboard');
                            setSelectedFile(null);
                            setActiveFolder(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === 'Dashboard'
                                ? 'bg-[#EBF2FF] text-[#00337C] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <Home
                            size={18}
                            className={activeTab === 'Dashboard' ? 'text-[#00337C]' : 'text-gray-400'}
                        />
                        <span className="text-sm font-bold">Home</span>
                    </button>
                    {tabs?.map((tab) => {
                        const Icon = iconForTab(tab.name);
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSelectedFile(null);
                                    setActiveFolder(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-[#EBF2FF] text-[#00337C] shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                                title={tab.isStandard ? tab.name : `${tab.name} (custom)`}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? 'text-[#00337C]' : 'text-gray-400'}
                                />
                                <span className="text-sm font-bold truncate">{tab.name}</span>
                                {!tab.isStandard && (
                                    <span className="ml-auto text-[9px] uppercase tracking-widest text-gray-300">
                                        custom
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    {tabsLoading && !tabs && (
                        <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs">
                            <Loader2 size={14} className="animate-spin" /> Loading vault…
                        </div>
                    )}
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
                        onClick={handleOpenPicker}
                        className="w-full flex items-center justify-center gap-2 bg-[#001D4A] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#002861] transition-all disabled:opacity-50"
                        disabled={!tabs}
                        title="Create a folder anywhere in your vault"
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
                        <SearchDropdown
                            driveId={primaryDriveId}
                            onSelectFile={(r) => {
                                setSelectedFile({
                                    id: r.id,
                                    name: r.name,
                                    mimeType: r.mimeType,
                                    webViewLink: r.webViewLink,
                                    path: `/search/${r.name}`,
                                });
                            }}
                            onSelectFolder={(r) => {
                                // Make sure the folder becomes a navigable target.
                                // If it's already a known tab, activate it; otherwise
                                // treat it as a generic selected folder.
                                const asTab = (tabs || []).find((t) => t.id === r.id);
                                if (asTab) {
                                    setActiveTab(asTab.id);
                                    setActiveFolder(null);
                                } else {
                                    setActiveFolder({ id: r.id, name: r.name });
                                    if (!childrenByFolderId.has(r.id)) loadChildren(r.id);
                                }
                                toast.success(`Jumped to folder "${r.name}"`);
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationPanel />
                        <button
                            onClick={() => {
                                setActiveTab('Settings');
                                setSelectedFile(null);
                                setActiveFolder(null);
                            }}
                            title="Open Settings"
                            className="w-10 h-10 bg-[#E8F2FF] rounded-full flex items-center justify-center text-[#00337C] font-bold text-sm overflow-hidden border border-[#EBF2FF] cursor-pointer hover:shadow-md transition-all"
                        >
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {activeTab === 'Dashboard' ? (
                    <DashboardHome
                        importInputRef={dashboardImportRef}
                        onImportClick={handleDashboardImportClick}
                        onImportFiles={handleDashboardImport}
                        pendingImports={pendingImports}
                        onRemove={removePending}
                        onRequestSave={(imp) => setSavingImport(imp)}
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
                                        {activeVaultTab?.name}
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
                                        onClick={handleOpenNewNote}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title={`New note in ${activeFolderLabel}`}
                                    >
                                        <FileText size={16} />
                                    </button>
                                    <button
                                        onClick={handleFileUploadClick}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title={`Upload into ${activeFolderLabel}`}
                                    >
                                        <Upload size={16} />
                                    </button>
                                    <button
                                        onClick={handleOpenPicker}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                        title="Create folder anywhere"
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

                        {selectedFile && selectedFile.name.endsWith(NOTE_SUFFIX) && primaryDriveId ? (
                            <NoteDocEditor
                                driveId={primaryDriveId}
                                file={{ id: selectedFile.id, name: selectedFile.name }}
                                onClose={() => setSelectedFile(null)}
                                onSaved={(f) =>
                                    setSelectedFile((prev) =>
                                        prev ? { ...prev, id: f.id, name: f.name } : prev
                                    )
                                }
                            />
                        ) : (
                            <DocumentViewer file={selectedFile} driveId={primaryDriveId} />
                        )}
                    </div>
                )}
            </main>

            {/* AI sidebar */}
            <AIPanel
                driveId={primaryDriveId}
                tabs={tabs ?? []}
                contextFile={
                    selectedFile
                        ? {
                              id: selectedFile.id,
                              name: selectedFile.name,
                              mimeType: selectedFile.mimeType,
                          }
                        : null
                }
            />


            {/* New note modal */}
            <NewNoteModal
                isOpen={showNewNoteModal}
                onClose={() => setShowNewNoteModal(false)}
                onCreate={handleCreateNote}
                targetFolderName={activeFolder?.name || activeVaultTab?.name || ''}
            />

            {/* File save picker modal (pending dashboard imports) */}
            <FileSavePickerModal
                isOpen={savingImport !== null}
                onClose={() => setSavingImport(null)}
                onSave={handleSavePendingToTarget}
                fileName={savingImport?.file.name || ''}
                rootFolderId={rootFolderId}
                tabs={tabs ?? []}
                childrenByFolderId={childrenByFolderId}
                loadingFolders={loadingFolders}
                onLoadChildren={loadChildren}
            />

            {/* Folder picker modal */}
            <FolderPickerModal
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onCreate={handleCreateFromPicker}
                rootFolderId={rootFolderId}
                tabs={tabs ?? []}
                defaultTarget={defaultPickerTarget}
                childrenByFolderId={childrenByFolderId}
                loadingFolders={loadingFolders}
                onLoadChildren={loadChildren}
            />
        </div>
    );
};

const CenteredMsg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 text-gray-500">
        {children}
    </div>
);

type PendingImport = { id: string; file: File; blobUrl: string };

const DashboardHome: React.FC<{
    importInputRef: React.RefObject<HTMLInputElement | null>;
    onImportClick: () => void;
    onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pendingImports: PendingImport[];
    onRemove: (id: string) => void;
    onRequestSave: (imp: PendingImport) => void;
}> = ({
    importInputRef,
    onImportClick,
    onImportFiles,
    pendingImports,
    onRemove,
    onRequestSave,
}) => (
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
                            Pick files here to stage them. Preview first, then save — nothing goes to
                            Drive until you click <b>Save</b>.
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
                    ref={importInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onImportFiles}
                />
            </div>

            {pendingImports.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#001D4A]">Pending imports</h3>
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                            Not saved yet
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pendingImports.map((imp) => (
                            <PendingImportRow
                                key={imp.id}
                                imp={imp}
                                onRemove={onRemove}
                                onRequestSave={onRequestSave}
                            />
                        ))}
                    </div>
                </div>
            )}

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
                        Click "New Entry" to pick any location — including the root, same level as
                        Studies — and nest folders however you like.
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

const PendingImportRow: React.FC<{
    imp: PendingImport;
    onRemove: (id: string) => void;
    onRequestSave: (imp: PendingImport) => void;
}> = ({ imp, onRemove, onRequestSave }) => {
    const sizeKb = Math.max(1, Math.round(imp.file.size / 1024));
    return (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition">
            <div className="w-10 h-10 bg-[#E8F2FF] text-[#00337C] rounded-xl flex items-center justify-center">
                <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">{imp.file.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                    {imp.file.type || 'unknown type'} · {sizeKb} KB
                </p>
            </div>
            <div className="flex items-center gap-2">
                <a
                    href={imp.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E5E5E5] text-gray-600 hover:bg-gray-50 transition"
                >
                    Open preview
                </a>
                <button
                    onClick={() => onRequestSave(imp)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#001D4A] text-white hover:bg-[#002861] transition"
                >
                    Save
                </button>
                <button
                    onClick={() => onRemove(imp.id)}
                    className="px-2 py-1.5 text-xs font-bold rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Discard (not saved)"
                >
                    Discard
                </button>
            </div>
        </div>
    );
};

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
