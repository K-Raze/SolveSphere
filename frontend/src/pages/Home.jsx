import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Shield, Code2, Users, Sparkles, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light text-xs text-green-accent font-medium mb-8">
              <Sparkles size={14} />
              AI-Powered Interview Prep
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tight animate-fade-in-up animate-delay-100">
            SOLVE
            <br />
            <span className="bg-gradient-to-r from-green-accent to-green-muted bg-clip-text text-transparent">
              SPHERE
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Real interview experiences from top tech companies, transformed into structured coding challenges by AI. Practice what actually gets asked.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-300">
            <Link
              to="/interviews"
              className="btn-glow px-8 py-3.5 text-base flex items-center gap-2"
            >
              Explore Interviews
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 text-base rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all font-medium"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Built for <span className="text-green-accent">serious</span> preparation
          </h2>
          <p className="text-white/40 text-center mb-16 max-w-xl mx-auto">
            Everything you need to go from reading an interview experience to acing it yourself.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain size={24} />}
              title="AI Problem Generation"
              description="Gemini AI transforms raw interview stories into structured, solvable coding problems with test cases."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Smart Duplicate Detection"
              description="Hybrid pipeline using MongoDB text search + AI semantic comparison ensures no duplicate problems."
            />
            <FeatureCard
              icon={<Code2 size={24} />}
              title="Sandboxed Execution"
              description="Run your code securely via Judge0 API. Supports JavaScript, Python, C++, and Java."
            />
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="Context-Aware AI Hints"
              description="Stuck? Ask the AI for a hint based on your actual code. It guides, never gives the answer."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Community Discussions"
              description="Share approaches, debate solutions, and learn from other candidates on every problem."
            />
            <FeatureCard
              icon={<Trophy size={24} />}
              title="Reputation & Leaderboard"
              description="Earn points for every problem solved and climb the global leaderboard."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start solving?
          </h2>
          <p className="text-white/40 mb-8">
            Join the community of developers preparing with real interview data.
          </p>
          <Link to="/register" className="btn-glow px-10 py-4 text-base inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass rounded-2xl p-6 hover:border-green-accent/20 transition-all duration-300 group cursor-default">
      <div className="w-12 h-12 rounded-xl bg-green-accent/10 flex items-center justify-center text-green-accent mb-4 group-hover:bg-green-accent/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}
