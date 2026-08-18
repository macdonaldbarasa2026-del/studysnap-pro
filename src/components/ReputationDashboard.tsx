import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  Trophy, 
  Medal, 
  Users, 
  ArrowLeft,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Search,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';

interface ReputationDashboardProps {
  userProfile: UserProfile;
  onBack: () => void;
}

interface LeaderboardEntry {
  user_name: string;
  reputation_score: number;
  reputation_level: string;
}

export const ReputationDashboard: React.FC<ReputationDashboardProps> = ({ userProfile, onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/reputation/leaderboard');
        const data = await res.json();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'academic_master': return <Crown className="text-amber-500" />;
      case 'expert': return <Trophy className="text-indigo-500" />;
      case 'scholar': return <Medal className="text-emerald-500" />;
      default: return <Star className="text-app-text-muted" />;
    }
  };

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-app-text">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-black text-app-text">Academic Reputation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm text-center">
            <div className="w-24 h-24 rounded-[32px] bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6 text-4xl">
              {getLevelIcon(userProfile.reputation_level)}
            </div>
            <h2 className="text-2xl font-black text-app-text mb-1">{userProfile.user_name}</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">
              {userProfile.reputation_level.replace('_', ' ')}
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-app-bg border border-app-border">
                <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1">Total Score</div>
                <div className="text-3xl font-black text-app-text">{userProfile.reputation_score}</div>
              </div>
              <div className="p-4 rounded-2xl bg-app-bg border border-app-border">
                <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1">Global Rank</div>
                <div className="text-3xl font-black text-app-text">#124</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[32px] bg-emerald-50 border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              How to earn points
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Exam Performance', points: '+50' },
                { label: 'Quiz Accuracy', points: '+20' },
                { label: 'Helping Others', points: '+15' },
                { label: 'Research Activity', points: '+30' },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-emerald-800 font-medium">{item.label}</span>
                  <span className="font-black text-emerald-600">{item.points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-app-text flex items-center gap-2">
                <Users className="text-indigo-600" />
                Global Leaderboard
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-10 pr-4 py-2 rounded-xl bg-app-bg border border-app-border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div 
                  key={entry.user_name}
                  className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    entry.user_name === userProfile.user_name 
                      ? 'bg-indigo-50 border border-indigo-100' 
                      : 'hover:bg-app-bg'
                  }`}
                >
                  <div className="w-8 text-center font-black text-app-text-muted">
                    {i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-app-border flex items-center justify-center text-indigo-600 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center font-black text-indigo-600">{entry.user_name.slice(0,1).toUpperCase()}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-app-text">{entry.user_name}</h4>
                    <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                      {entry.reputation_level.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-app-text">{entry.reputation_score}</div>
                    <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Points</div>
                  </div>
                  <div className="ml-2">
                    {getLevelIcon(entry.reputation_level)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
