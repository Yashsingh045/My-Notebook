import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Database, 
  Cpu, 
  ShieldCheck, 
  LayoutGrid, 
  Globe, 
  Star
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] selection:bg-[#00337C]/10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-[#00337C]">My Notebook</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-semibold text-[#00337C] border-b-2 border-[#00337C] pb-1">Home</a>
              <a href="#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Vision</a>
              <a href="#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-sm font-bold text-[#00337C] hover:text-[#002861] transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-[#00337C] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002861] transition-all shadow-md shadow-blue-900/10"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#00337C] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#002861] transition-all shadow-md shadow-blue-900/10"
              >
                Open Workspace
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8EFFF] text-[#00337C] rounded-full text-[10px] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-[#00337C] rounded-full animate-pulse" />
              Editorial Intelligence For Scholars
            </div>
            <h1 className="text-[4.5rem] leading-[1] font-bold text-[#1A1A1A] tracking-tighter">
              Architect Your <br />
              <span className="text-[#00337C]">Career Legacy.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              The definitive digital vault for your academic odyssey. Secure your studies, curate your internships, and let AI transform your history into professional mastery.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/register')}
                className="bg-[#00337C] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#002861] transition-all shadow-lg shadow-blue-900/20 group"
              >
                Get Started
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#E8F2FF] text-[#00337C] px-8 py-4 rounded-xl font-bold hover:bg-[#D9E9FF] transition-all"
              >
                Login to Vault
              </button>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 aspect-video">
              <img 
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200" 
                alt="Workspace" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Float Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-[280px] border border-[#F0F0F0]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E8F2FF] rounded-lg flex items-center justify-center text-[#00337C] flex-shrink-0">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">AI Assistant</p>
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "Your research on Quantum Cryptography aligns with 14 career trajectories in your saved archives."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden h-48 shadow-lg">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600" alt="Team" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-64 shadow-lg translate-x-4">
                <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600" alt="Writing" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="rounded-2xl overflow-hidden h-64 shadow-lg -translate-x-4">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" alt="Building" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-48 shadow-lg">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600" alt="Tech" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-[#00337C] tracking-[0.3em] uppercase">The Vision</span>
              <h2 className="text-5xl font-bold leading-tight tracking-tight text-[#1A1A1A]">
                A Four-Year Narrative, Expertly Curated.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                College is more than a series of classes; it's a four-year intellectual construction project. Most students lose their best work in forgotten folders. We provide the architecture to capture every spark of genius.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F2F2F2] rounded-xl flex items-center justify-center text-[#00337C] flex-shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A] mb-1">Continuous documentation</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Every lecture, internship reflection, and project artifact stored in a unified, searchable timeline.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F2F2F2] rounded-xl flex items-center justify-center text-[#00337C] flex-shrink-0">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A] mb-1">Career Trajectory Mapping</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">See how your 100-level basics evolve into 400-level expertise through visual progress charts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligent Primitives Section */}
      <section className="py-24 px-6 bg-[#F9F9F9]">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-20">
          <h2 className="text-4xl font-bold text-[#1A1A1A]">Intelligent Primitives</h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Sophisticated tools designed for the modern curator, blending industrial strength with AI agility.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Large Feature Card */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-12 border border-[#E5E5E5] flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 bg-[#E8F2FF] rounded-xl flex items-center justify-center text-[#00337C]">
                <Database size={24} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[#1A1A1A]">Multi-Drive Master Archive</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Seamlessly aggregate documents from across your digital ecosystem. Studies, internships, and Personal Projects, all organized in one high-performance vault.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <div className="bg-white border border-[#F0F0F0] px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500"><Globe size={16} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic</p>
                    <p className="text-xs font-bold">12 MB • 45 Files</p>
                  </div>
                </div>
                <div className="bg-white border border-[#F0F0F0] px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500"><LayoutGrid size={16} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internships</p>
                    <p className="text-xs font-bold">450 MB • 32 Files</p>
                  </div>
                </div>
                <div className="bg-white border border-[#F0F0F0] px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500"><Cpu size={16} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Analytics</p>
                    <p className="text-xs font-bold">Ind. Act • 12 Files</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative background shape */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#F2F2F2] rounded-full translate-x-1/4 translate-y-1/4 opacity-50 group-hover:scale-110 transition-transform" />
          </div>

          {/* AI Intelligence Card */}
          <div className="bg-[#6B21A8] rounded-[2.5rem] p-12 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <Cpu size={24} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold leading-tight">The Editorial Intelligence</h3>
                <p className="text-purple-100/70 leading-relaxed text-sm">
                  Our proprietary AI doesn't just store; it understands. It surfaces connections between your freshman ethics paper and your senior year law internship.
                </p>
              </div>
            </div>
            <button className="w-full bg-white text-[#6B21A8] py-4 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all mt-8">
              Explore Insights
            </button>
          </div>
        </div>

        {/* Small Feature Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mt-8">
          <div className="bg-white p-10 rounded-[2rem] border border-[#E5E5E5] space-y-6">
            <div className="w-10 h-10 bg-[#E8F2FF] rounded-lg flex items-center justify-center text-[#00337C]">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#1A1A1A]">Sovereign Encryption</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Your intellectual property is yours alone. We use end-to-end encryption to secure your private vault.</p>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[2rem] border border-[#E5E5E5] space-y-6">
            <div className="w-10 h-10 bg-[#F2F2F2] rounded-lg flex items-center justify-center text-[#00337C]">
              <LayoutGrid size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#1A1A1A]">Curated Portfolios</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Instantly export a curated selection of your work into a professional, high-end portfolio for recruiters.</p>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[2rem] border border-[#E5E5E5] space-y-6">
            <div className="w-10 h-10 bg-[#F2F2F2] rounded-lg flex items-center justify-center text-[#00337C]">
              <Globe size={20} />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#1A1A1A]">Global Persistence</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Offline-first architecture ensures your library is always accessible, regardless of your connection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold tracking-tight text-[#1A1A1A]">Voices of the Architects.</h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              Join thousands of students and researchers who have elevated their workflow.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-[#F9F9F9] p-10 rounded-[2rem] border border-[#F0F0F0] space-y-8">
              <div className="flex gap-1 text-purple-600">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-lg text-gray-600 italic leading-relaxed">
                "The Intellectual Architect changed how I view my education. It's not just a cloud drive; it's a career-building machine."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" alt="Avatar" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Elena Rodriguez</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Master of Fine Arts Candidate</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F9F9F9] p-10 rounded-[2rem] border border-[#F0F0F0] space-y-8">
              <div className="flex gap-1 text-purple-600">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-lg text-gray-600 italic leading-relaxed">
                "The AI insights identified patterns in my research I hadn't even noticed. It helped me secure my dream internship."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Avatar" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Marcus Chen</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Data Science Junior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-[#002861] rounded-[3rem] p-20 text-center text-white space-y-12 relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <h2 className="text-[4rem] font-bold leading-[1] tracking-tighter">Start Your Legacy <br /> Today.</h2>
            <p className="text-xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed">
              Your academic journey deserves more than a standard folder. Give it the architecture it needs.
            </p>
          </div>
          <div className="flex justify-center pt-4 relative z-10">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-[#00337C] px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl"
            >
              Get Started for Free
            </button>
          </div>
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
          <span className="text-lg font-bold tracking-tight text-[#00337C]">My Notebook</span>
          <div className="flex gap-8 text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Careers</a>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2024 My Notebook Curator System</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

