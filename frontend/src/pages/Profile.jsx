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

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="glass rounded-3xl p-8 md:p-12 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
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
          <div className="glass rounded-3xl p-8 animate-fade-in-up animate-delay-400">
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
    <div className={`glass rounded-2xl p-6 animate-fade-in-up ${delay}`}>
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  );
}
