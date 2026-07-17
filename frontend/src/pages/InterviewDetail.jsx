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
    const fetch = async () => {
      try {
        const res = await experienceAPI.getById(id);
        setExperience(res.data.data);
      } catch (err) {
        toast.error('Failed to load experience');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleSolve = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to solve problems');
      return navigate('/login');
    }

    const problemId = experience.generatedProblemId?._id || experience.similarProblemId?._id;
    if (problemId) {
      return navigate(`/solve/${problemId}`);
    }

    // Trigger AI generation
    setSolving(true);
    try {
      const res = await experienceAPI.solve(id);
      if (res.data.problemId) {
        toast.success('Problem ready!');
        navigate(`/solve/${res.data.problemId}`);
      } else {
        toast.success(res.data.message || 'Problem submitted for review');
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
        <Loader2 className="animate-spin text-green-accent" size={32} />
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

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Link to="/interviews" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-green-accent transition-colors mb-8">
            <ArrowLeft size={16} />
            Back to Interviews
          </Link>

          {/* Card */}
          <div className="glass rounded-3xl p-8 md:p-12 animate-fade-in-up">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="flex items-center gap-2 text-green-accent font-semibold">
                <Building2 size={18} />
                {experience.company}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                <Briefcase size={14} />
                {experience.role}
              </span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                <Calendar size={14} />
                {experience.yearAsked}
              </span>
              <span className="px-3 py-1 rounded-full glass-light text-xs text-white/50">
                {experience.interviewRound}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Interview at {experience.company}
            </h1>
            <p className="text-sm text-white/30 mb-8">
              Shared by {experience.submittedBy?.username || 'Anonymous'}
            </p>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 leading-relaxed text-base whitespace-pre-wrap">
                {experience.rawDescription}
              </p>
            </div>

            {/* Solve CTA */}
            {hasProblem && (
              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/40 mb-1">Generated Problem</p>
                    <p className="text-lg font-semibold text-white">{problemTitle}</p>
                    {problemDifficulty && (
                      <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-medium badge-${problemDifficulty}`}>
                        {problemDifficulty.charAt(0).toUpperCase() + problemDifficulty.slice(1)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSolve}
                    disabled={solving}
                    className="btn-glow px-8 py-3.5 text-base flex items-center gap-2 shrink-0"
                  >
                    {solving ? (
                      <><Loader2 className="animate-spin" size={18} /> Generating...</>
                    ) : (
                      <>Solve This Problem <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {!hasProblem && (
              <div className="mt-10 pt-8 border-t border-white/5">
                <button
                  onClick={handleSolve}
                  disabled={solving}
                  className="btn-glow px-8 py-3.5 text-base flex items-center gap-2"
                >
                  {solving ? (
                    <><Loader2 className="animate-spin" size={18} /> Generating Problem...</>
                  ) : (
                    <>Generate & Solve <ArrowRight size={18} /></>
                  )}
                </button>
                <p className="mt-3 text-xs text-white/30">
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
