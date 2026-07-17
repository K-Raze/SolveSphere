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

      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 relative z-10 items-center justify-center px-12">
        <div>
          <h1 className="text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tight">
            SOLVE
            <br />
            <span className="bg-gradient-to-r from-green-accent to-green-muted bg-clip-text text-transparent">
              SPHERE
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-md">
            Practice real interview problems. Get hired.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="glass rounded-3xl p-10 w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-accent to-green-deep flex items-center justify-center">
              <Zap size={18} className="text-dark-950" />
            </div>
            <span className="text-xl font-bold text-white">SolveSphere</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="you@example.com"
                className="input-underline"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-underline pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? <div className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/30">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
