import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experienceAPI } from '../services/api';
import { Building2, Calendar, Briefcase, ChevronRight, Search } from 'lucide-react';

const COMPANIES = ['All', 'Google', 'Meta', 'Amazon', 'Apple', 'Uber', 'Microsoft'];

export default function InterviewFeed() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await experienceAPI.getAll();
        setExperiences(res.data.data || []);
      } catch (err) {
        console.error('Failed to load experiences:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
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

      <div className="relative z-10 w-full flex flex-col items-center" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
        <div style={{ height: '160px', width: '100%' }}></div> {/* Bulletproof spacer */}
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center justify-center">
          {/* Header */}
          <div className="animate-fade-in-up flex flex-col items-center justify-center text-center w-full" style={{ marginBottom: '56px' }}>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight text-center">
              Interview
              <span className="text-green-accent"> Experiences</span>
            </h1>
            <p className="mt-6 text-white/35 text-lg max-w-xl text-center">
              Real stories from real engineers. Read, learn, and solve.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col items-center justify-center gap-8 animate-fade-in-up delay-1 w-full" style={{ marginBottom: '64px' }}>
            <div className="relative w-full max-w-2xl">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interviews..."
                className="w-full rounded-full glass-card text-white placeholder:text-white/25 outline-none text-[1.05rem]"
                style={{ padding: '20px 24px 20px 64px' }}
              />
            </div>

            <div className="flex items-center justify-center flex-wrap max-w-3xl" style={{ gap: '16px' }}>
              {COMPANIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCompany(c)}
                  style={{ padding: '10px 24px', borderRadius: '12px' }}
                  className={`text-sm font-semibold transition-all duration-300 ${
                    filterCompany === c
                      ? 'bg-green-accent text-dark-950 shadow-[0_0_20px_rgba(0,255,150,0.3)]'
                      : 'glass-card text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-56 animate-pulse" style={{ padding: '32px' }}>
                  <div className="h-5 bg-white/5 rounded-lg w-1/3 mb-6" />
                  <div className="h-4 bg-white/5 rounded-lg w-full mb-3" />
                  <div className="h-4 bg-white/5 rounded-lg w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
              <p className="text-white/25 text-xl">No interviews found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
              {filtered.map((exp, i) => (
                <Link
                  key={exp._id}
                  to={`/interviews/${exp._id}`}
                  className="glass-card group animate-fade-in-up block"
                  style={{ animationDelay: `${Math.min(i * 60, 400)}ms`, opacity: 0, padding: '28px' }}
                >
                  {/* Company */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-green-accent/10 flex items-center justify-center">
                        <Building2 size={16} className="text-green-accent" />
                      </div>
                      <span className="text-[0.95rem] font-bold text-white">{exp.company}</span>
                    </div>
                    <ChevronRight size={18} className="text-white/15 group-hover:text-green-accent group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Description */}
                  <p className="text-[0.9rem] text-white/40 leading-relaxed line-clamp-3 mb-5">
                    {exp.rawDescription}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-white/25">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={13} />
                      {exp.role}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {exp.yearAsked}
                    </span>
                    <span className="chip">{exp.interviewRound}</span>
                  </div>

                  {/* Problem available */}
                  {(exp.generatedProblemId || exp.similarProblemId) && (
                    <div className="border-t border-white/5" style={{ marginTop: '28px', paddingTop: '24px' }}>
                      <span className="text-xs text-green-accent font-semibold tracking-wide">
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
