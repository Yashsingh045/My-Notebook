import React from 'react';
import Hero from '../components/Landing/Hero';
import FeatureSection from '../components/Landing/FeatureSection';
import CTA from '../components/Landing/CTA';

const LandingPage: React.FC = () => {
    return (
        <main className="min-h-screen bg-slate-950">
            {/* Nav Placeholder (Optional for Phase 2) */}
            <nav className="fixed top-0 left-0 w-full z-50 py-6 px-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-xl">
                        M
                    </div>
                    <span className="text-white font-bold tracking-tight text-lg">My-Notebook</span>
                </div>
            </nav>

            {/* Layout Sections */}
            <Hero />
            <FeatureSection />
            <CTA />

            {/* Simple Footer */}
            <footer className="py-20 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} My-Notebook. Built for privacy, hosted by you.
                    </p>
                </div>
            </footer>
        </main>
    );
};

export default LandingPage;
