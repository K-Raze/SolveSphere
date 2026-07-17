import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experienceAPI } from '../services/api';
import { Building2, Calendar, Briefcase, ChevronRight, Search, Filter } from 'lucide-react';

const COMPANIES = ['All', 'Google', 'Meta', 'Amazon', 'Apple', 'Uber', 'Microsoft', 'Netflix'];

export default function InterviewFeed() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await experienceAPI.getAll();
        setExperiences(res.data.data || []);
      } catch (err) {
        console.error('Failed to load experiences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = experiences.filter((exp) => {
    const matchesSearch =
      exp.rawDescription?.toLowerCase().includes(search.toLowerCase()) ||
      exp.company?.toLowerCase().includes(search.toLowerCase()) ||
      exp.role?.toLowerCase().includes(search.toLowerCase());
    const matchesCompany = filterCompany === 'All' || exp.company === filterCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="relative min-h-screen">
      <div className="aurora-bg" />

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Interview
              <span className="text-green-accent"> Experiences</span>
            </h1>
            <p className="mt-3 text-white/40 text-lg">
              Real stories from real engineers. Read, learn, and solve.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animate-delay-100">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interviews..."
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-light text-white placeholder:text-white/30 outline-none focus:border-green-accent/30 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {COMPANIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCompany(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterCompany === c
                      ? 'bg-green-accent text-dark-950'
                      : 'glass-light text-white/50 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
                  <div className="h-3 bg-white/5 rounded w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg">No interviews found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((exp, i) => (
                <Link
                  key={exp._id}
                  to={`/interviews/${exp._id}`}
                  className="glass rounded-2xl p-6 hover:border-green-accent/20 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 50, 300)}ms`, opacity: 0 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-green-accent" />
                      <span className="text-sm font-semibold text-white">{exp.company}</span>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-green-accent group-hover:translate-x-1 transition-all" />
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-4">
                    {exp.rawDescription}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {exp.role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {exp.yearAsked}
                    </span>
                    <span className="px-2 py-0.5 rounded-full glass-light text-white/40 text-xs">
                      {exp.interviewRound}
                    </span>
                  </div>

                  {(exp.generatedProblemId || exp.similarProblemId) && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="text-xs text-green-accent font-medium">
                        ✓ Problem Available — Solve Now
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
