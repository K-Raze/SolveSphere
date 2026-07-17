import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(emailId, password);
      toast.success('Welcome back!');
      navigate('/interviews');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      <div className="aurora-bg" />

      {/* Left: Big Bold Branding */}
      <div className="hidden lg:flex flex-1 relative z-10 items-center justify-center px-16">
        <div className="max-w-lg">
          <h1 className="text-[6rem] xl:text-[8rem] font-black text-white leading-[0.85] tracking-tighter">
            SOLVE
            <br />
            <span className="bg-gradient-to-r from-green-accent to-green-muted bg-clip-text text-transparent">
              SPHERE
            </span>
          </h1>
          <p className="mt-8 text-xl text-white/35 leading-relaxed">
            Practice real interview problems.
            <br />
            Get hired.
          </p>
        </div>
      </div>

      {/* Right: Login Card */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="glass w-full max-w-[440px]" style={{ padding: '64px 48px' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-accent to-green-deep flex items-center justify-center shadow-lg shadow-green-accent/20">
              <Zap size={20} className="text-dark-950" />
            </div>
            <span className="text-2xl font-extrabold text-white">SolveSphere</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '40px' }}>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors p-2"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glow w-full text-base" style={{ marginTop: '24px', padding: '16px' }}>
              {loading ? <div className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-white/25" style={{ marginTop: '48px' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-green-accent hover:underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
