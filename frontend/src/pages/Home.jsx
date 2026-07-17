import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Shield, Code2, Users, Sparkles, Trophy, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="aurora-bg" />

      {/* ===== HERO ===== */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center min-h-screen pt-20">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card text-[0.8rem] text-green-accent font-semibold tracking-wide mb-14">
            <Sparkles size={15} />
            AI-Powered Interview Prep
          </span>
        </div>

        <h1 className="animate-fade-in-up delay-1 text-[5rem] md:text-[7rem] lg:text-[9rem] font-black text-white leading-[0.95] tracking-tighter">
          SOLVE<br />
          <span className="bg-gradient-to-r from-green-accent via-green-muted to-green-accent bg-clip-text text-transparent">
            SPHERE
          </span>
        </h1>

        <p className="animate-fade-in-up delay-2 mt-12 text-lg md:text-xl text-white/40 max-w-2xl" style={{ lineHeight: '2' }}>
          Real interview experiences from top tech companies, transformed into
          structured coding challenges by AI. Practice what actually gets asked.
        </p>

        <div className="animate-fade-in-up delay-3 flex flex-col sm:flex-row items-center justify-center" style={{ marginTop: '24px', gap: '32px' }}>
          <Link to="/interviews" className="btn-glow" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            Explore Interviews
            <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="btn-outline" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 px-8 flex flex-col items-center" style={{ paddingTop: '160px', paddingBottom: '160px' }}>
        <div className="max-w-6xl w-full mx-auto flex flex-col" style={{ gap: '96px' }}>
          <div className="flex flex-col items-center justify-center w-full text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for <span className="text-green-accent">serious</span> preparation
            </h2>
            <p className="text-white/35 text-lg max-w-xl text-center leading-relaxed" style={{ textAlign: 'center' }}>
              Everything you need to go from reading an interview experience to acing it yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full" style={{ gap: '48px' }}>
            <FeatureCard icon={<Brain size={26} />} title="AI Problem Generation" description="Gemini AI transforms raw interview stories into structured, solvable coding problems with test cases." />
            <FeatureCard icon={<Shield size={26} />} title="Smart Duplicate Detection" description="Hybrid pipeline using MongoDB text search + AI semantic comparison ensures no duplicate problems." />
            <FeatureCard icon={<Code2 size={26} />} title="Sandboxed Execution" description="Run your code securely via Judge0 API. Supports JavaScript, Python, C++, and Java." />
            <FeatureCard icon={<Sparkles size={26} />} title="Context-Aware AI Hints" description="Stuck? Ask the AI for a hint based on your actual code. It guides, never gives the answer." />
            <FeatureCard icon={<Users size={26} />} title="Community Discussions" description="Share approaches, debate solutions, and learn from other candidates on every problem." />
            <FeatureCard icon={<Trophy size={26} />} title="Reputation & Leaderboard" description="Earn points for every problem solved and climb the global leaderboard." />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 px-8 flex flex-col items-center" style={{ paddingTop: '160px', paddingBottom: '160px' }}>
        <div className="max-w-4xl w-full mx-auto text-center glass flex flex-col items-center" style={{ padding: '96px 40px', gap: '40px' }}>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Ready to start solving?
          </h2>
          <p className="text-white/35 text-lg">
            Join the community of developers preparing with real interview data.
          </p>
          <Link to="/register" className="btn-glow text-lg mt-4" style={{ padding: '16px 40px' }}>
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-8 border-t border-white/5 w-full flex flex-col items-center justify-center">
        <div className="max-w-6xl w-full mx-auto flex flex-col items-center justify-center" style={{ gap: '16px' }}>
          <div className="w-12 h-12 rounded-full bg-green-accent/5 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,255,150,0.05)] border border-green-accent/10">
            <Zap size={18} className="text-green-accent" />
          </div>
          <div className="flex flex-col items-center justify-center" style={{ gap: '8px' }}>
            <span className="text-[0.95rem] text-white/50 tracking-wide">
              © 2025 <strong className="text-white/80 font-bold">SolveSphere</strong>. All rights reserved.
            </span>
            <span className="text-sm text-white/30 flex items-center justify-center" style={{ gap: '6px' }}>
              Built with <span className="text-green-accent">♥</span> by K-Raze
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-card group cursor-default flex flex-col h-full" style={{ padding: '48px' }}>
      <div className="w-14 h-14 rounded-2xl bg-green-accent/10 flex items-center justify-center text-green-accent mb-8 group-hover:bg-green-accent/15 transition-colors duration-300 shrink-0">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-[1rem] text-white/35 leading-[1.8] flex-1">{description}</p>
    </div>
  );
}
