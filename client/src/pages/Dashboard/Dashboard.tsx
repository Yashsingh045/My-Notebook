import React from 'react';
import './Dashboard.css';
import { Clock, FileText, Star, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
    const recentNotes = [
        { id: '1', title: 'Calculus - Limits & Continuity', subject: 'Mathematics', date: '2 hours ago' },
        { id: '2', title: 'Newtonian Mechanics', subject: 'Physics', date: 'Yesterday' },
        { id: '3', title: 'Organic Chemistry Basics', subject: 'Chemistry', date: '3 days ago' },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header animate-in">
                <h2>Welcome back, Yashveer!</h2>
                <p>You have 12 notes and 5 subjects in your library.</p>
            </header>

            <section className="stats-grid">
                <div className="stat-card glass animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon purple"><TrendingUp size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Total Notes</span>
                        <span className="value">128</span>
                    </div>
                </div>
                <div className="stat-card glass animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon blue"><FileText size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Documents</span>
                        <span className="value">45</span>
                    </div>
                </div>
                <div className="stat-card glass animate-in" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon gold"><Star size={20} /></div>
                    <div className="stat-info">
                        <span className="label">Favorites</span>
                        <span className="value">12</span>
                    </div>
                </div>
            </section>

            <section className="dashboard-sections">
                <div className="recent-activity glass animate-in" style={{ animationDelay: '0.4s' }}>
                    <div className="section-header">
                        <h3>Recent Notes</h3>
                        <button className="view-all">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentNotes.map((note, index) => (
                            <div key={note.id} className="activity-item glass-hover animate-in" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                                <div className="item-icon"><FileText size={18} /></div>
                                <div className="item-details">
                                    <span className="title">{note.title}</span>
                                    <span className="subtitle">{note.subject}</span>
                                </div>
                                <div className="item-meta">
                                    <Clock size={12} />
                                    <span>{note.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="quick-access glass animate-in" style={{ animationDelay: '0.6s' }}>
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <div className="action-card glass glass-hover animate-in" style={{ animationDelay: '0.7s' }}>
                            <span>Scan Handwritten Notes</span>
                        </div>
                        <div className="action-card glass glass-hover animate-in" style={{ animationDelay: '0.8s' }}>
                            <span>Generate MCQ Set</span>
                        </div>
                        <div className="action-card glass glass-hover animate-in" style={{ animationDelay: '0.9s' }}>
                            <span>Export to PDF</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
