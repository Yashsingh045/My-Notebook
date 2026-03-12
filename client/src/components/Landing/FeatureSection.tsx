import React from 'react';
import { Brain, FileStack, Globe, Lock, Share2, Sparkles } from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="glass-card hover:border-emerald-500/30 transition-all duration-500 p-8 rounded-3xl group">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
            {title}
        </h3>
        <p className="text-slate-400 leading-relaxed text-sm">
            {description}
        </p>
    </div>
);

const FeatureSection: React.FC = () => {
    const features = [
        {
            icon: <Lock size={28} />,
            title: "Zero-Knowledge Storage",
            description: "Your notes never touch our servers. They are stored direct-to-Drive via pass-through streams, ensuring you are the sole owner of your data."
        },
        {
            icon: <Sparkles size={28} />,
            title: "AI Study Partner",
            description: "Generate summaries, MCQs, and chat with your notes using GPT-4o. Our smart caching layer makes AI affordable and nearly instant."
        },
        {
            icon: <FileStack size={28} />,
            title: "Multi-Drive Synergy",
            description: "Connect multiple Google Drive accounts. Move subjects between vaults or back up your entire research library with one click."
        },
        {
            icon: <Share2 size={28} />,
            title: "Smart Sharing",
            description: "Share notes via unique, expiring links. Set a time-to-live (TTL) and track views while the source remains protected in your vault."
        },
        {
            icon: <Brain size={28} />,
            title: "TipTap Rich Editing",
            description: "A professional-grade editing experience with Markdown support, drag-and-drop imagery, and seamless JSON versioning."
        },
        {
            icon: <Globe size={28} />,
            title: "Public API (Soon)",
            description: "Integrate your knowledge base with external tools. Programmatic access to your vault without the security overhead of traditional ODMs."
        }
    ];

    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the <span className="text-gradient">Privacy Generation</span></h2>
                    <p className="text-slate-400 text-lg">
                        We don't need your data. Our architecture is designed to give you enterprise-grade study tools 
                        without the privacy trade-offs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <FeatureCard key={idx} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
