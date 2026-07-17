import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Code2, CheckCircle2, Star, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile, loading } = useAuth();

  useEffect(() => {
    refreshProfile();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="aurora-bg" />

      <div className="relative z-10 w-full" style={{ paddingTop: '120px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px' }}>
        <div className="max-w-4xl w-full" style={{ margin: '0 auto' }}>
          {/* Profile Header */}
          <div className="glass rounded-3xl animate-fade-in-up" style={{ padding: '48px', marginBottom: '32px' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center" style={{ gap: '24px' }}>
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-accent to-green-deep flex items-center justify-center text-3xl font-black text-dark-950 shrink-0">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-white/40 text-sm mt-1">@{user.username}</p>
                <p className="text-white/30 text-xs mt-1">{user.emailId}</p>
              </div>

              {user.role === 'admin' && (
                <span className="px-4 py-1.5 rounded-full bg-green-accent/10 border border-green-accent/20 text-green-accent text-xs font-semibold">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '20px', marginBottom: '32px' }}>
            <StatCard
              icon={<Trophy size={20} />}
              label="Reputation"
              value={user.reputation || 0}
              color="text-yellow-400"
              delay="animate-delay-100"
            />
            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Problems Solved"
              value={user.totalSolved || 0}
              color="text-green-accent"
              delay="animate-delay-200"
            />
            <StatCard
              icon={<Star size={20} />}
              label="Contributions"
              value={user.totalContributions || 0}
              color="text-blue-400"
              delay="animate-delay-300"
            />
          </div>

          {/* Activity placeholder */}
          <div className="glass rounded-3xl animate-fade-in-up animate-delay-400" style={{ padding: '32px' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="text-center py-12">
              <Code2 size={32} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/30 text-sm">
                Start solving problems to see your activity here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  return (
    <div className={`glass rounded-2xl animate-fade-in-up ${delay}`} style={{ padding: '24px' }}>
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  );
}
