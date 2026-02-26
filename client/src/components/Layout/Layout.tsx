import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout-root">
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
            <Sidebar />
            <main className="main-content">
                <header className="top-nav glass">
                    <div className="search-bar">
                        <input type="text" placeholder="Search across your notes..." className="glass" />
                    </div>
                    <div className="top-nav-actions">
                        <button className="action-btn glass glass-hover">New Note</button>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
