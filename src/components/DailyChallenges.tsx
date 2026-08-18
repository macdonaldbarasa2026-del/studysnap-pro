import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  Zap,
  Star,
  Clock,
  ArrowRight,
  Gift
} from 'lucide-react';
import { DailyChallenge, FocusStats } from '../types';

interface DailyChallengesProps {
  userName: string;
  stats: FocusStats;
  onBack: () => void;
  onStartTask: (taskType: string) => void;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ 
  userName, 
  stats, 
  onBack,
  onStartTask 
}) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('studysnap-activities') || '[]');
    const today = new Date().toDateString();
    const todayActivities = activities.filter((a:any) => new Date(a.timestamp || a.created_at || 0).toDateString() === today);
    const next: DailyChallenge[] = [
      { id:'quiz', title:'Take a quiz', description:'Complete a real quiz session today.', reward_points:50, type:'quiz', completed:todayActivities.some((a:any)=>a.type==='quiz_taken') },
      { id:'note', title:'Create a note', description:'Create or scan a study note today.', reward_points:40, type:'note', completed:todayActivities.some((a:any)=>a.type==='note_created') },
      { id:'game', title:'Play a game', description:'Complete a real learning game today.', reward_points:25, type:'game', completed:todayActivities.some((a:any)=>a.type==='game_played') },
      { id:'flashcard', title:'Review flashcards', description:'Review a real flashcard session today.', reward_points:30, type:'flashcard', completed:todayActivities.some((a:any)=>a.type==='flashcards_reviewed') },
    ];
    setChallenges(next); setTotalPoints(next.reduce((acc,c)=>acc+(c.completed?c.reward_points:0),0));
  }, []);

  const progress = (challenges.filter(c => c.completed).length / challenges.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Challenges</h1>
            <p className="text-slate-500">Earn points and maintain your streak!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-600 rounded-full font-bold shadow-sm">
          <Flame size={20} className="fill-current" />
          {stats.streak_days} Day Streak
        </div>
      </header>

      {/* Progress Card */}
      <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold w-fit">
              <Zap size={14} />
              {totalPoints} Points Earned Today
            </div>
            <h2 className="text-3xl font-bold">Today's Progress</h2>
            <div className="w-full md:w-64 h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white"
              />
            </div>
            <p className="text-indigo-100 text-sm">
              {challenges.filter(c => c.completed).length} of {challenges.length} challenges completed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex flex-col items-center justify-center border border-white/20">
              <Star size={32} className="text-amber-300 mb-1" />
              <span className="text-xs font-bold">Based on your activity</span>
            </div>
            <div className="w-24 h-24 rounded-3xl bg-white/10 flex flex-col items-center justify-center border border-white/20">
              <Trophy size={32} className="text-indigo-200 mb-1" />
              <span className="text-xs font-bold">Keep learning</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Challenges List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-2">
            <Target size={20} className="text-indigo-600" />
            Active Tasks
          </h3>
          {challenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[32px] border-2 transition-all ${challenge.completed ? 'bg-white border-emerald-100 opacity-75' : 'bg-white border-transparent shadow-sm hover:border-indigo-100'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${challenge.completed ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-600'}`}>
                  {challenge.completed ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star size={14} className="fill-current" />
                  +{challenge.reward_points}
                </div>
              </div>
              <h4 className={`font-bold ${challenge.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{challenge.title}</h4>
              <p className="text-slate-500 text-sm mt-1">{challenge.description}</p>
              {!challenge.completed && (
                <button 
                  onClick={() => onStartTask(challenge.type)}
                  className="mt-4 w-full py-3 bg-slate-50 text-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all group"
                >
                  Start Task
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rewards & Streaks */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Gift size={20} className="text-indigo-600" />
              Upcoming Rewards
            </h3>
            <div className="space-y-6">
              {[
                { day: 7, title: 'Elite Badge', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                { day: 14, title: 'Premium Theme', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { day: 30, title: 'Scholar Certificate', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((reward, i) => (
                <div key={reward.day} className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${reward.bg} ${reward.color} flex items-center justify-center relative`}>
                    <reward.icon size={28} />
                    {stats.streak_days >= reward.day && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{reward.title}</h4>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Day {reward.day} Streak</p>
                  </div>
                  <div className="text-right">
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${Math.min((stats.streak_days / reward.day) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500 rounded-[40px] p-8 text-white shadow-xl shadow-amber-100">
            <div className="flex items-center justify-between mb-4">
              <Clock size={32} className="text-amber-200" />
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Limited Time</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Weekend Warrior</h3>
            <p className="text-amber-100 text-sm leading-relaxed mb-4">
              Complete 10 quizzes this weekend to earn double points and a special "Warrior" badge.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="px-2 py-1 bg-white/20 rounded">02d</div>
              <span>:</span>
              <div className="px-2 py-1 bg-white/20 rounded">14h</div>
              <span>:</span>
              <div className="px-2 py-1 bg-white/20 rounded">45m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;
