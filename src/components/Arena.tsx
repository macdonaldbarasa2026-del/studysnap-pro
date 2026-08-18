import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Zap, 
  Users, 
  Target, 
  Shield, 
  Swords, 
  Timer, 
  Star, 
  TrendingUp, 
  Award,
  ChevronLeft,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Video,
  VideoOff,
  Monitor,
  Medal
} from 'lucide-react';
import { ArenaRank, ArenaProfile, ArenaMatch, MatchState, GameType } from '../types';
import ArenaGame from './ArenaGame';

interface ArenaProps {
  userName: string;
  onBack: () => void;
}

export default function Arena({ userName, onBack }: ArenaProps) {
  const [profile, setProfile] = useState<ArenaProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<ArenaProfile[]>([]);
  const [status, setStatus] = useState<'lobby' | 'queue' | 'match'>('lobby');
  const [isLeagueMatch, setIsLeagueMatch] = useState(false);
  const [matchData, setMatchData] = useState<{ matchId: string, opponent: string, opponentSocketId: string, role: 'p1' | 'p2', isLeague?: boolean } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [opponentStream, setOpponentStream] = useState<MediaStream | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const opponentVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard();

    return () => {
      stopScreenShare();
    };
  }, []);

  const fetchProfile = async () => {
    const profiles = JSON.parse(localStorage.getItem('arena-profiles') || '{}');
    if (!profiles[userName]) {
      profiles[userName] = {
        user_name: userName,
        rank: 'beginner',
        points: 0,
        matches_played: 0,
        matches_won: 0,
        avg_accuracy: 0,
        avg_reaction_time: 0
      };
      localStorage.setItem('arena-profiles', JSON.stringify(profiles));
    }
    setProfile(profiles[userName]);
  };

  const fetchLeaderboard = async () => {
    const profiles = JSON.parse(localStorage.getItem('arena-profiles') || '{}');
    const list = Object.values(profiles) as ArenaProfile[];
    setLeaderboard(list.sort((a, b) => b.points - a.points).slice(0, 10));
  };

  const startPracticeMatch = () => {
    const practiceMatch = { matchId: `practice_${Date.now()}`, opponent: 'Practice Session', opponentSocketId: 'local', role: 'p1' as const };
    setMatchData(practiceMatch); setStatus('match');
  };

  const joinQueue = (league: boolean = false) => {
    setIsLeagueMatch(league);
    setStatus('queue');
  };

  const leaveQueue = () => {
    setStatus('lobby');
  };

  const startScreenShare = async (match: any) => {
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      setStream(mediaStream);
      if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Failed to start screen share", err);
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setOpponentStream(null);
  };

  const getRankColor = (rank: ArenaRank) => {
    switch (rank) {
      case 'master': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'advanced': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'skilled': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  if (status === 'match' && matchData) {
    return (
      <ArenaGame 
        matchId={matchData.matchId}
        opponent={matchData.opponent}
        userName={userName}
        opponentStream={opponentStream}
        myStream={stream}
        isLeague={matchData.isLeague}
        onFinish={() => {
          setStatus('lobby');
          fetchProfile();
          fetchLeaderboard();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-app-text">
              <ChevronLeft size={28} />
            </button>
            <h1 className="text-3xl font-black text-app-text tracking-tight">Mind Arena</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 flex items-center gap-2">
              <Zap size={18} />
              <span>{profile?.points || 0} pts</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-8 rounded-[40px] bg-app-card border border-app-border shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Swords size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <Trophy size={48} />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-app-text">{userName}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRankColor(profile?.rank || 'beginner')}`}>
                  {profile?.rank || 'Beginner'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">Matches</div>
                  <div className="text-xl font-black text-app-text">{profile?.matches_played || 0}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">Wins</div>
                  <div className="text-xl font-black text-emerald-600">{profile?.matches_won || 0}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">Accuracy</div>
                  <div className="text-xl font-black text-indigo-600">{Math.round(profile?.avg_accuracy || 0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">Reaction</div>
                  <div className="text-xl font-black text-amber-600">{profile?.avg_reaction_time || 0}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={status === 'queue' ? leaveQueue : () => joinQueue(false)}
            className={`p-10 rounded-[40px] flex flex-col items-center text-center gap-6 transition-all shadow-xl ${
              status === 'queue' 
                ? 'bg-rose-500 text-white shadow-rose-200' 
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-[1.02]'
            }`}
          >
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center">
              {status === 'queue' ? <X size={40} /> : <Swords size={40} />}
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">{status === 'queue' ? 'Searching...' : '1 vs 1 Duel'}</h3>
              <p className="text-white/70 text-sm">
                {status === 'queue' ? 'Finding a worthy opponent...' : 'Challenge a live player in real-time'}
              </p>
            </div>
            {status === 'queue' && (
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                ))}
              </div>
            )}
          </button>

          <div className="grid grid-rows-2 gap-6">
            <button 
              onClick={startPracticeMatch}
              className="p-8 rounded-[40px] bg-emerald-500 text-white shadow-xl shadow-emerald-200 flex items-center gap-6 hover:scale-[1.02] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black">Practice Mode</h3>
                <p className="text-white/70 text-xs">Sharpen your skills alone</p>
              </div>
            </button>
            <button 
              onClick={() => joinQueue(true)}
              className="p-8 rounded-[40px] bg-amber-500 text-white shadow-xl shadow-amber-200 flex items-center gap-6 hover:scale-[1.02] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Medal size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black">League Match</h3>
                <p className="text-white/70 text-xs">Earn points for your school</p>
              </div>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest">Global Rankings</h3>
            <button onClick={fetchLeaderboard} className="text-xs font-bold text-indigo-600">Refresh</button>
          </div>
          <div className="space-y-3">
            {leaderboard.map((p, i) => (
              <div key={i} className="p-5 rounded-3xl bg-app-card border border-app-border flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  i === 0 ? 'bg-amber-100 text-amber-600' : 
                  i === 1 ? 'bg-slate-100 text-slate-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-app-bg text-app-text-muted'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-app-text">{p.user_name}</div>
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">{p.rank}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-indigo-600">{p.points}</div>
                  <div className="text-[10px] text-app-text-muted uppercase font-bold tracking-wider">Points</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
