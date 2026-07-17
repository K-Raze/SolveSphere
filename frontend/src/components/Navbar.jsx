import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-accent to-green-deep flex items-center justify-center">
            <Zap size={18} className="text-dark-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-green-accent transition-colors">
            SolveSphere
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/interviews" className="text-sm text-white/60 hover:text-green-accent transition-colors font-medium">
            Interviews
          </Link>
          {isAuthenticated && (
            <Link to="/submit-experience" className="text-sm text-white/60 hover:text-green-accent transition-colors font-medium">
              Share Experience
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <User size={16} />
                <span>{user?.username || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-glow px-5 py-2 text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white/70" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5 px-6 py-4 space-y-3">
          <Link to="/interviews" onClick={() => setMobileOpen(false)} className="block text-sm text-white/70 hover:text-green-accent">
            Interviews
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm text-white/70 hover:text-green-accent">
                Profile
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm text-red-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-white/70">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-sm text-green-accent font-semibold">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
