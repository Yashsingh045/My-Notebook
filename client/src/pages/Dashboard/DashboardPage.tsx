import React, { useState, useRef } from 'react';
import { 
    Upload, Settings, LogOut, Search, Bell, User, 
    GraduationCap, Briefcase, Archive, Plus, 
    LayoutGrid, ChevronRight, FileText, Brain, 
    CloudIcon, MessageSquare, Sparkles, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FileExplorerNode, { type FileNode } from '../../components/Dashboard/FileExplorerNode';
import DocumentViewer from '../../components/Dashboard/DocumentViewer';
import SettingsTab from '../../components/Dashboard/SettingsTab';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const logout = auth.logout;
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Existing logic preserved
    const [fileStructure, setFileStructure] = useState<FileNode[]>([
        {
            id: 'studies',
            name: 'Studies',
            type: 'folder',
            path: '/Studies',
            children: [
                {
                    id: 'cs101',
                    name: 'CS101 - Data Structures',
                    type: 'folder',
                    path: '/Studies/CS101',
                    children: [
                        {
                            id: 'file1',
                            name: 'Lecture Notes.md',
                            type: 'file',
                            path: '/Studies/CS101/Lecture Notes.md',
                            mimeType: 'text/markdown',
                            content: '# Data Structures Lecture Notes\n\n## Arrays\n- Fixed size\n- O(1) access time\n\n## Linked Lists\n- Dynamic size\n- O(n) access time',
                        },
                        {
                            id: 'file2',
                            name: 'Assignment.pdf',
                            type: 'file',
                            path: '/Studies/CS101/Assignment.pdf',
                            mimeType: 'application/pdf',
                        },
                    ],
                },
                {
                    id: 'math201',
                    name: 'MATH201 - Calculus',
                    type: 'folder',
                    path: '/Studies/MATH201',
                    children: [
                        {
                            id: 'file3',
                            name: 'Derivatives.md',
                            type: 'file',
                            path: '/Studies/MATH201/Derivatives.md',
                            mimeType: 'text/markdown',
                            content: '# Calculus - Derivatives\n\n## Power Rule\nd/dx[x^n] = n*x^(n-1)',
                        },
                    ],
                },
            ],
        },
        {
            id: 'internships',
            name: 'Internships',
            type: 'folder',
            path: '/Internships',
            children: [
                {
                    id: 'google',
                    name: 'Google Summer 2025',
                    type: 'folder',
                    path: '/Internships/Google',
                    children: [
                        {
                            id: 'file4',
                            name: 'Project Overview.md',
                            type: 'file',
                            path: '/Internships/Google/Project Overview.md',
                            mimeType: 'text/markdown',
                            content: '# Google Internship Project\n\n## Objectives\n- Build scalable backend\n- Improve API performance',
                        },
                    ],
                },
            ],
        },
        {
            id: 'jobs',
            name: 'Jobs',
            type: 'folder',
            path: '/Jobs',
            children: [],
        },
        {
            id: 'archive',
            name: 'Archive',
            type: 'folder',
            path: '/Archive',
            children: [],
        },
    ]);

    const navigationItems = [
        { name: 'Studies', icon: GraduationCap, color: '#00337C' },
        { name: 'Internships', icon: Briefcase, color: '#00337C' },
        { name: 'Jobs', icon: Briefcase, color: '#00337C' },
        { name: 'Archive', icon: Archive, color: '#00337C' },
        { name: 'Settings', icon: Settings, color: '#00337C' },
    ];

    const handleToggleFolder = (nodeId: string) => {
        setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId);
            else newSet.add(nodeId);
            return newSet;
        });
    };

    const handleCreateFolder = () => {
        const folderName = prompt('Enter folder name:');
        if (folderName && folderName.trim()) {
            const newFolder: FileNode = {
                id: `folder_${Date.now()}`,
                name: folderName,
                type: 'folder',
                path: `/${activeTab}/${folderName}`,
                children: [],
            };

            setFileStructure((prev) => {
                const updated = [...prev];
                const tabFolder = updated.find((f) => f.name === activeTab);
                if (tabFolder) {
                    if (!tabFolder.children) tabFolder.children = [];
                    tabFolder.children.push(newFolder);
                }
                return updated;
            });
            toast.success(`Folder "${folderName}" created!`);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const newFile: FileNode = {
                    id: `file_${Date.now()}_${Math.random()}`,
                    name: file.name,
                    type: 'file',
                    path: `/${activeTab}/${file.name}`,
                    mimeType: file.type,
                };

                setFileStructure((prev) => {
                    const updated = [...prev];
                    const tabFolder = updated.find((f) => f.name === activeTab);
                    if (tabFolder) {
                        if (!tabFolder.children) tabFolder.children = [];
                        tabFolder.children.push(newFile);
                    }
                    return updated;
                });
                toast.success(`File "${file.name}" uploaded to ${activeTab}!`);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    return (
        <div className="flex bg-[#F8F9FA] h-screen w-screen font-sans text-[#1A1A1A] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#E5E5E5] bg-white flex flex-col px-4 py-8">
                <div 
                    className="mb-10 px-4 cursor-pointer"
                    onClick={() => setActiveTab('Dashboard')}
                >
                    <h2 className="text-[#001D4A] font-bold text-lg mb-1">Curator Space</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic & Career</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navigationItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                setActiveTab(item.name);
                                setSelectedFile(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                activeTab === item.name 
                                ? 'bg-[#EBF2FF] text-[#00337C] shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <item.icon size={18} className={activeTab === item.name ? 'text-[#00337C]' : 'text-gray-400'} />
                            <span className="text-sm font-bold">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="pt-4 mt-auto border-t border-gray-100 flex flex-col gap-2">
                    <button 
                        onClick={() => toast.info("New entry dialog coming soon!")}
                        className="w-full flex items-center justify-center gap-2 bg-[#001D4A] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#002861] transition-all"
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

            {/* Main Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header */}
                <header className="h-20 border-b border-[#E5E5E5] flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <h1 
                        className="text-xl font-bold tracking-tight text-[#00337C] cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        My Notebook
                    </h1>

                    <div className="flex-1 max-w-lg mx-12">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

                {/* Dashboard View */}
                {activeTab === 'Dashboard' ? (
                    <div className="flex-1 overflow-y-auto p-12 bg-white">
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-bold text-[#001D4A] tracking-tight">Workspace Dashboard</h2>
                                <p className="text-gray-500 text-lg">Capture, synthesize, and architecturalize your career intelligence.</p>
                            </div>

                            {/* Import Section */}
                            <div 
                                className="group cursor-pointer relative"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="border-2 border-dashed border-[#E5E5E5] rounded-[2rem] p-16 flex flex-col items-center justify-center gap-6 hover:border-[#00337C] transition-all bg-[#F9FBFF]/50 group-hover:bg-[#F0F5FF]">
                                    <div className="w-16 h-16 bg-[#E8F2FF] rounded-2xl flex items-center justify-center text-[#00337C] shadow-sm transform group-hover:scale-110 transition-transform">
                                        <CloudIcon size={32} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-[#001D4A]">Import New Intelligence</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Drag and drop academic papers, job descriptions, or personal notes to start curated analysis.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        {['PDF', 'DOCX', 'Markdown'].map(tag => (
                                            <span key={tag} className="px-5 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold tracking-widest uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <input 
                                    ref={fileInputRef}
                                    type="file" multiple className="hidden" 
                                    onChange={handleFileUpload} 
                                />
                            </div>

                            {/* Recent Curations */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-[#001D4A]">Recent Curations</h3>
                                    <button className="text-sm font-bold text-[#00337C] hover:underline transition-all">View all</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white border border-[#E5E5E5] rounded-[1.5rem] p-6 space-y-6 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                                <Brain size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2h ago</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#00337C] transition-colors">Deep Learning Final Thesis.pdf</h4>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-[9px] font-bold tracking-widest uppercase">AI Analyzed</span>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold tracking-widest uppercase">Studies</span>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#E5E5E5] rounded-[1.5rem] p-6 space-y-6 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yesterday</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#00337C] transition-colors">Senior Architect Role - Google</h4>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-[#E8F2FF] text-[#00337C] rounded-md text-[9px] font-bold tracking-widest uppercase">Jobs</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 bg-[#F9FBFF] border border-[#EBF2FF] rounded-[1.5rem] p-6 flex items-center gap-6 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#00337C] shadow-sm">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#00337C]">Interview Synthesis: Meta AI Team</h4>
                                            <p className="text-xs text-gray-500 mt-1">Generated from 45-minute audio recording. Includes key performance indicators discussed.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last Edited</p>
                                            <p className="text-xs font-bold text-[#1A1A1A]">Jan 14, 2024</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'Settings' ? (
                    <div className="flex-1 overflow-y-auto bg-white">
                        <SettingsTab />
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* File Explorer */}
                        <div className="w-80 border-r border-[#E5E5E5] flex flex-col bg-white">
                            <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
                                <h3 className="font-bold text-[#001D4A] uppercase tracking-widest text-xs">{activeTab}</h3>
                                <button 
                                    onClick={handleCreateFolder}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    <FolderPlus size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                {fileStructure
                                    .filter((node) => node.name === activeTab)
                                    .map((node) => (
                                        <div key={node.id}>
                                            {node.children && node.children.length > 0 ? (
                                                node.children.map((child) => (
                                                    <FileExplorerNode
                                                        key={child.id}
                                                        node={child}
                                                        level={0}
                                                        onFileSelect={setSelectedFile}
                                                        expandedFolders={expandedFolders}
                                                        onToggleFolder={handleToggleFolder}
                                                    />
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                                    <LayoutGrid size={32} className="mb-4" />
                                                    <p className="text-xs font-medium">No files yet</p>
                                                    <button 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="mt-4 text-[10px] font-bold text-[#00337C] uppercase tracking-widest hover:underline"
                                                    >
                                                        Upload first file
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {/* Detail View */}
                        <DocumentViewer file={selectedFile} />
                    </div>
                )}
            </main>

            {/* AI Sidebar */}
            <aside className="w-80 border-l border-[#E5E5E5] bg-white flex flex-col p-8 overflow-hidden">
                <div className="mb-10">
                    <h3 className="text-[#7C3AED] font-bold text-lg mb-1">Editorial AI</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intelligence Layer</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#7C3AED]">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Insight</span>
                        </div>
                        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                I've analyzed your "Deep Learning Thesis." Should I generate 10 practice MCQs for your upcoming defense?
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 opacity-70">
                        <div className="flex items-center gap-2 text-gray-400">
                            <MessageSquare size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Previous Output</span>
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                            <p className="text-[11px] text-gray-500 leading-relaxed italic">
                                "Summary: Focuses on computational efficiency of CNNs..."
                            </p>
                            <button className="flex items-center gap-2 text-[#7C3AED] text-[9px] font-bold mt-4 tracking-widest hover:underline">
                                <Plus size={10} /> SAVE TO REFERENCES
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-50 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {['SUMMARIZE', 'CREATE MCQS', 'ALIGN JOBS'].map(action => (
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

// Helper for folder icon to match image styles
const FolderPlus: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 11h6" /><path d="M15 8v6" /><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

export default DashboardPage;
