import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Users, 
  Globe, 
  School, 
  TrendingUp, 
  Swords, 
  ChevronLeft,
  ChevronRight, 
  Star,
  Shield,
  Medal,
  Timer,
  Zap
} from 'lucide-react';
import { LeagueSeason, LeagueRanking, InstitutionLeagueStats, UserProfile } from '../types';

interface LeagueDashboardProps {
  userName: string;
  userProfile: UserProfile | null;
  onJoinMatch: (isLeague: boolean) => void;
  onBack: () => void;
}

const LeagueDashboard: React.FC<LeagueDashboardProps> = ({ userName, userProfile, onJoinMatch, onBack }) => {
  const [season, setSeason] = useState<LeagueSeason | null>(null);
  const [userRanking, setUserRanking] = useState<LeagueRanking | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeagueRanking[]>([]);
  const [instLeaderboard, setInstLeaderboard] = useState<InstitutionLeagueStats[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'school'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seasonRes, rankingRes, leaderboardRes, instRes] = await Promise.all([
        fetch('/api/league/status'),
        fetch(`/api/league/ranking/${userName}`),
        fetch('/api/league/leaderboard'),
        fetch('/api/league/institutions')
      ]);

      const [seasonData, rankingData, leaderboardData, instData] = await Promise.all([
        seasonRes.json(),
        rankingRes.json(),
        leaderboardRes.json(),
        instRes.json()
      ]);

      setSeason(seasonData);
      setUserRanking(rankingData);
      setLeaderboard(leaderboardData);
      setInstLeaderboard(instData);
    } catch (error) {
      console.error('Failed to fetch league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'champion': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'elite': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'silver': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'champion': return <Trophy size={24} />;
      case 'elite': return <Shield size={24} />;
      case 'gold': return <Medal size={24} />;
      case 'silver': return <Star size={24} />;
      default: return <Target size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">League Arena</h1>
      </div>

      {/* Header / Season Info */}
      <div className="relative overflow-hidden rounded-[40px] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-widest">
              <Zap size={16} className="fill-current" />
              Active Season
            </div>
            <h1 className="text-5xl font-black">{season?.name || 'Loading Season...'}</h1>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Timer size={20} />
                <span className="font-bold">Ends in 24 days</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={20} />
                <span className="font-bold">Global Tournament</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onJoinMatch(true)}
            className="px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black text-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-4"
          >
            <Swords size={24} />
            Enter Arena
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: User Stats & Tier */}
        <div className="space-y-8">
          <div className="p-8 rounded-[40px] bg-white border border-app-border shadow-sm space-y-6">
            <h2 className="text-xl font-black text-app-text flex items-center gap-3">
              <Shield className="text-indigo-600" />
              Your Standing
            </h2>
            
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-app-bg border border-app-border">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${getTierColor(userRanking?.tier || 'bronze')}`}>
                {getTierIcon(userRanking?.tier || 'bronze')}
              </div>
              <div>
                <div className="text-xs font-black text-app-text-muted uppercase tracking-widest">Current Tier</div>
                <div className="text-3xl font-black capitalize text-app-text">{userRanking?.tier}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
                <div className="text-2xl font-black text-indigo-600">{userRanking?.points}</div>
                <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">League Points</div>
              </div>
              <div className="p-6 rounded-3xl bg-app-bg border border-app-border">
                <div className="text-2xl font-black text-emerald-600">{userRanking?.matches_won}</div>
                <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Wins</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-app-text-muted">Progress to {userRanking?.tier === 'bronze' ? 'Silver' : 'Next Tier'}</span>
                <span className="text-app-text">{(userRanking?.points || 0) % 200}/200 LP</span>
              </div>
              <div className="h-3 bg-app-bg rounded-full overflow-hidden border border-app-border">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((userRanking?.points || 0) % 200) / 2}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white border border-app-border shadow-sm space-y-6">
            <h2 className="text-xl font-black text-app-text flex items-center gap-3">
              <School className="text-indigo-600" />
              Institution Stats
            </h2>
            {userProfile?.institution_id ? (
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                  <div className="text-sm font-bold text-indigo-900 mb-1">Representing</div>
                  <div className="text-xl font-black text-indigo-600">{userProfile.institution_id}</div>
                </div>
                <p className="text-sm text-app-text-muted leading-relaxed">
                  Your performance directly contributes to your school's global ranking. Keep winning to climb the leaderboard!
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-app-text-muted">You haven't joined an institution yet.</p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('studysnap:join-institution'))} className="text-indigo-600 font-bold text-sm hover:underline">Join Institution</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Leaderboards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 p-1.5 bg-app-card border border-app-border rounded-3xl w-fit">
            <button 
              onClick={() => setActiveTab('global')}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-app-text-muted hover:text-app-text'}`}
            >
              Global Players
            </button>
            <button 
              onClick={() => setActiveTab('school')}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'school' ? 'bg-indigo-600 text-white shadow-lg' : 'text-app-text-muted hover:text-app-text'}`}
            >
              Top Institutions
            </button>
          </div>

          <div className="bg-white rounded-[40px] border border-app-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-app-border flex items-center justify-between">
              <h3 className="text-2xl font-black text-app-text">
                {activeTab === 'global' ? 'Global Leaderboard' : 'Institution Rankings'}
              </h3>
              <div className="flex items-center gap-2 text-app-text-muted text-sm font-bold">
                <Globe size={16} />
                Season 1
              </div>
            </div>

            <div className="divide-y divide-app-border max-h-[600px] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'global' ? (
                  <motion.div 
                    key="global"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.user_name} className="p-6 flex items-center gap-6 hover:bg-app-bg transition-colors group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx < 3 ? 'bg-indigo-600 text-white' : 'bg-app-bg text-app-text-muted'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-app-text truncate">{entry.user_name}</span>
                            {idx === 0 && <Star size={16} className="text-yellow-500 fill-current" />}
                          </div>
                          <div className="text-xs font-bold text-app-text-muted flex items-center gap-2">
                            <School size={12} />
                            {entry.institution_id || 'Independent'}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTierColor(entry.tier)}`}>
                            {entry.tier}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-indigo-600">{entry.points}</div>
                            <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Points</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="school"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {instLeaderboard.map((inst, idx) => (
                      <div key={inst.institution_id} className="p-6 flex items-center gap-6 hover:bg-app-bg transition-colors group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx < 3 ? 'bg-emerald-600 text-white' : 'bg-app-bg text-app-text-muted'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-app-text truncate">{inst.name}</div>
                          <div className="text-xs font-bold text-app-text-muted flex items-center gap-2">
                            <Users size={12} />
                            {inst.student_count} Active Students
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-emerald-600">{inst.points}</div>
                          <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Total LP</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueDashboard;
