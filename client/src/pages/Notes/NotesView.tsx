import React from 'react';
import './NotesView.css';
import { Download, Edit3, Share2, Sparkles, Tag } from 'lucide-react';

const NotesView: React.FC = () => {
    return (
        <div className="notes-view-container">
            <header className="notes-header animate-in">
                <div className="notes-title-area">
                    <div className="breadcrumb">Mathematics / Calculus</div>
                    <h2>Limits and Continuity</h2>
                    <div className="tags-row">
                        <div className="tag glass"><Tag size={12} /> Calculus</div>
                        <div className="tag glass"><Tag size={12} /> Active Recall</div>
                    </div>
                </div>

                <div className="notes-actions">
                    <button className="action-btn glass glass-hover"><Share2 size={18} /></button>
                    <button className="action-btn glass glass-hover"><Download size={18} /></button>
                    <button className="action-btn primary"><Edit3 size={18} /> Edit Note</button>
                </div>
            </header>

            <div className="notes-main-content">
                <article className="note-body glass animate-in" style={{ animationDelay: '0.2s' }}>
                    <h3>1. Concepts of Limits</h3>
                    <p>
                        In calculus, a limit is the value that a function "approaches" as the input "approaches" some value.
                        Limits are essential to calculus and mathematical analysis and are used to define continuity,
                        derivatives, and integrals.
                    </p>
                    <p>
                        The formal definition of a limit is as follows: Let f be a function defined on an open interval
                        containing c (except possibly at c) and let L be a real number.
                    </p>
                    <div className="equation-box glass">
                        lim (x → c) f(x) = L
                    </div>
                </article>

                <aside className="ai-sidebar">
                    <div className="ai-tools glass animate-in" style={{ animationDelay: '0.4s' }}>
                        <h3><Sparkles size={18} /> AI Assistant</h3>
                        <div className="tool-list">
                            <div className="ai-tool-item glass glass-hover">
                                <span>Generate Summary</span>
                            </div>
                            <div className="ai-tool-item glass glass-hover">
                                <span>Create 5 MCQs</span>
                            </div>
                            <div className="ai-tool-item glass glass-hover">
                                <span>Explain Complex Terms</span>
                            </div>
                        </div>
                    </div>

                    <div className="annotations-preview glass animate-in" style={{ animationDelay: '0.6s' }}>
                        <h3>Annotations</h3>
                        <div className="empty-state">
                            No handwritten annotations yet.
                            <button className="simple-btn">Open Canvas</button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default NotesView;
