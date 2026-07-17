import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { experienceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Calendar, Briefcase, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await experienceAPI.getById(id);
        setExperience(res.data.data);
      } catch {
        toast.error('Failed to load experience');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleSolve = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to solve problems');
      return navigate('/login');
    }

    const problemId = experience.generatedProblemId?._id || experience.similarProblemId?._id;
    if (problemId) return navigate(`/solve/${problemId}`);

    setSolving(true);
    try {
      const res = await experienceAPI.solve(id);
      if (res.data.problemId) {
        toast.success('Problem ready!');
        navigate(`/solve/${res.data.problemId}`);
      } else {
        toast.success(res.data.message || 'Submitted for review');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate problem');
    } finally {
      setSolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-light spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!experience) return null;

  const hasProblem = experience.generatedProblemId || experience.similarProblemId;
  const problemTitle = experience.generatedProblemId?.title || experience.similarProblemId?.title;
  const problemDifficulty = experience.generatedProblemId?.difficulty || experience.similarProblemId?.difficulty;

  return (
    <div className="relative min-h-screen">
      <div className="aurora-bg" />

      <div className="relative z-10 w-full flex flex-col items-center" style={{ paddingTop: '160px', paddingBottom: '80px', paddingLeft: '32px', paddingRight: '32px' }}>
        <div className="w-full max-w-3xl">
          {/* Back */}
          <Link to="/interviews" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-green-accent transition-colors duration-300" style={{ marginBottom: '40px' }}>
            <ArrowLeft size={16} />
            Back to Interviews
          </Link>

          {/* Main Card */}
          <div className="glass animate-fade-in-up" style={{ padding: '40px' }}>
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="flex items-center gap-2 text-green-accent font-bold text-[0.95rem]">
                <Building2 size={18} />
                {experience.company}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span className="flex items-center gap-1.5 text-sm text-white/40">
                <Briefcase size={14} />
                {experience.role}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span className="flex items-center gap-1.5 text-sm text-white/40">
                <Calendar size={14} />
                {experience.yearAsked}
              </span>
              <span className="chip">{experience.interviewRound}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ marginBottom: '12px' }}>
              Interview at {experience.company}
            </h1>
            <p className="text-sm text-white/25" style={{ marginBottom: '40px' }}>
              Shared by {experience.submittedBy?.username || 'Anonymous'}
            </p>

            {/* Story */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5" style={{ padding: '32px', marginBottom: '40px' }}>
              <p className="text-white/60 leading-[1.8] text-[1rem] whitespace-pre-wrap">
                {experience.rawDescription}
              </p>
            </div>

            {/* Solve CTA */}
            {hasProblem ? (
              <div className="bg-green-accent/[0.04] border border-green-accent/15 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between" style={{ padding: '32px', gap: '24px' }}>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider font-semibold" style={{ marginBottom: '8px' }}>Generated Problem</p>
                  <p className="text-xl font-bold text-white" style={{ marginBottom: '8px' }}>{problemTitle}</p>
                  {problemDifficulty && (
                    <span className={`badge badge-${problemDifficulty}`}>
                      {problemDifficulty.charAt(0).toUpperCase() + problemDifficulty.slice(1)}
                    </span>
                  )}
                </div>
                <button onClick={handleSolve} disabled={solving} className="btn-glow shrink-0 text-base">
                  {solving ? <><Loader2 className="animate-spin" size={18} /> Generating...</> : <>Solve This Problem <ArrowRight size={18} /></>}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button onClick={handleSolve} disabled={solving} className="btn-glow text-base">
                  {solving ? <><Loader2 className="animate-spin" size={18} /> Generating Problem...</> : <>Generate & Solve <ArrowRight size={18} /></>}
                </button>
                <p className="mt-4 text-xs text-white/20">
                  AI will generate a structured coding problem from this experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
