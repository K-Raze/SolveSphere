import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { experienceAPI } from '../services/api';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ROUNDS = [
  { label: 'Online Assessment', value: 'online-assessment' },
  { label: 'Phone Screen', value: 'phone-screen' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Take Home', value: 'take-home' },
  { label: 'Other', value: 'other' }
];

export default function SubmitExperience() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', interviewRound: 'onsite', yearAsked: new Date().getFullYear(), rawDescription: ''
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

      <div className="relative z-10 w-full" style={{ paddingTop: '120px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div className="max-w-4xl w-full" style={{ margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-green-accent transition-colors" style={{ marginBottom: '32px' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className="glass rounded-3xl animate-fade-in-up" style={{ padding: '48px' }}>
            <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ marginBottom: '8px' }}>Share Your Interview</h1>
            <p className="text-white/40 text-sm" style={{ marginBottom: '32px' }}>Describe what you were asked. AI will transform it into a coding problem.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Company</label>
                  <input value={form.company} onChange={update('company')} placeholder="Google" className="input-underline" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Role</label>
                  <input value={form.role} onChange={update('role')} placeholder="Software Engineer" className="input-underline" required />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Round</label>
                  <select value={form.interviewRound} onChange={update('interviewRound')} className="input-underline bg-transparent cursor-pointer">
                    {ROUNDS.map((r) => <option key={r.value} value={r.value} className="bg-dark-900 text-white">{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Year</label>
                  <input type="number" value={form.yearAsked} onChange={update('yearAsked')} className="input-underline" required min="2015" max="2030" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Interview Description</label>
                <textarea
                  value={form.rawDescription}
                  onChange={update('rawDescription')}
                  rows={8}
                  placeholder="Describe the coding problem you were asked in detail..."
                  className="input-underline resize-none !border-b-0 !border !border-white/10 rounded-xl !p-4"
                  style={{ width: '100%', minHeight: '150px' }}
                  required
                  minLength={50}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-glow w-full text-base flex items-center justify-center gap-2" style={{ padding: '14px 24px', marginTop: '16px' }}>
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
