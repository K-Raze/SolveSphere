import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Floating Pill Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-8 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-5xl h-16 glass bg-dark-950/60 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between shadow-2xl shadow-black/50 relative" style={{ padding: '0 32px' }}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-accent to-green-deep flex items-center justify-center shadow-lg shadow-green-accent/20">
              <Zap size={16} className="text-dark-950" />
            </div>
            <span className="text-lg font-black text-white tracking-tight group-hover:text-green-accent transition-colors duration-300">
              SolveSphere
            </span>
          </Link>

          {/* Desktop Nav - Center */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link to="/interviews" className="text-lg font-black text-white tracking-tight hover:text-green-accent transition-colors duration-300">
              Interviews
            </Link>
            {isAuthenticated && (
              <Link to="/submit-experience" className="text-lg font-black text-white tracking-tight hover:text-green-accent transition-colors duration-300">
                Share Experience
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center" style={{ gap: '24px' }}>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-white/5 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-green-accent/10 flex items-center justify-center">
                    <User size={12} className="text-green-accent" />
                  </div>
                  <span className="text-[0.85rem] font-medium text-white/80">{user?.username || 'Profile'}</span>
                </Link>
                <button onClick={logout} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors duration-300">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[0.9rem] text-white/60 hover:text-white transition-colors duration-300 font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="bg-green-accent hover:bg-green-400 text-dark-950 text-[0.9rem] font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]" style={{ padding: '10px 28px' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white/60 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-dark-950/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
          <Link to="/interviews" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-white hover:text-green-accent transition-colors">Interviews</Link>
          {isAuthenticated ? (
            <>
              <Link to="/submit-experience" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-white hover:text-green-accent transition-colors">Share Experience</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-white hover:text-green-accent transition-colors">Profile</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-2xl font-bold text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-white hover:text-green-accent transition-colors">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-green-accent">Get Started</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
