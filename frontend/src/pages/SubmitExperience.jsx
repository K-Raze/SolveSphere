import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { experienceAPI } from '../services/api';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ROUNDS = ['Phone Screen', 'Onsite', 'OA', 'Technical', 'System Design', 'Behavioral', 'Final Round'];

export default function SubmitExperience() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', interviewRound: 'Onsite', yearAsked: new Date().getFullYear(), rawDescription: ''
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return navigate('/login');
    }

    setLoading(true);
    try {
      await experienceAPI.submit({ ...form, yearAsked: Number(form.yearAsked) });
      toast.success('Experience submitted for review!');
      navigate('/interviews');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="aurora-bg" />

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-green-accent transition-colors mb-8">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="glass rounded-3xl p-8 md:p-12 animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Share Your Interview</h1>
            <p className="text-white/40 text-sm mb-8">Describe what you were asked. AI will transform it into a coding problem.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Company</label>
                  <input value={form.company} onChange={update('company')} placeholder="Google" className="input-underline" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Role</label>
                  <input value={form.role} onChange={update('role')} placeholder="Software Engineer" className="input-underline" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Round</label>
                  <select value={form.interviewRound} onChange={update('interviewRound')} className="input-underline bg-transparent cursor-pointer">
                    {ROUNDS.map((r) => <option key={r} value={r} className="bg-dark-900 text-white">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Year</label>
                  <input type="number" value={form.yearAsked} onChange={update('yearAsked')} className="input-underline" required min="2015" max="2030" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Interview Description</label>
                <textarea
                  value={form.rawDescription}
                  onChange={update('rawDescription')}
                  rows={6}
                  placeholder="Describe the coding problem you were asked in detail..."
                  className="input-underline resize-none !border-b-0 !border !border-white/10 rounded-xl !p-4"
                  required
                  minLength={50}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-glow w-full py-3.5 text-base flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Submit Experience
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
