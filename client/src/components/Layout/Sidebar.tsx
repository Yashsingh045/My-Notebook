import React, { useState } from 'react';
import './Sidebar.css';
import { Book, ChevronRight, Hash, Home, Plus, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>(['Mathematics']);

    const toggleSubject = (name: string) => {
        setExpandedSubjects(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    return (
        <aside className="sidebar glass animate-in">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon"></div>
                    <h1>My Notebook</h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="nav-item active">
                        <Home size={18} />
                        <span>Dashboard</span>
                    </div>
                    <div className="nav-item">
                        <Settings size={18} />
                        <span>Settings</span>
                    </div>
                </div>

                <div className="nav-section animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="section-header">
                        <h3>Library</h3>
                        <button className="add-btn"><Plus size={14} /></button>
                    </div>

                    <div className="subject-item">
                        <div
                            className={`item-content ${expandedSubjects.includes('Mathematics') ? 'active' : ''}`}
                            onClick={() => toggleSubject('Mathematics')}
                        >
                            <Book size={16} />
                            <span>Mathematics</span>
                            <ChevronRight size={14} className={`chevron ${expandedSubjects.includes('Mathematics') ? 'rotated' : ''}`} />
                        </div>
                        <div className={`topic-list ${expandedSubjects.includes('Mathematics') ? 'expanded' : ''}`}>
                            <div className="topic-item">
                                <Hash size={14} />
                                <span>Calculus</span>
                            </div>
                            <div className="topic-item">
                                <Hash size={14} />
                                <span>Linear Algebra</span>
                            </div>
                        </div>
                    </div>

                    <div className="subject-item">
                        <div
                            className={`item-content ${expandedSubjects.includes('Physics') ? 'active' : ''}`}
                            onClick={() => toggleSubject('Physics')}
                        >
                            <Book size={16} />
                            <span>Physics</span>
                            <ChevronRight size={14} className={`chevron ${expandedSubjects.includes('Physics') ? 'rotated' : ''}`} />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">YT</div>
                    <div className="user-info">
                        <span className="name">Yashveer Singh</span>
                        <span className="email">yashveer@example.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
