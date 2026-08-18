import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Clock, 
  Target, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  Zap,
  BookOpen,
  Layers,
  Gamepad2,
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { UserProfile, StudyRecommendation, DailyStudyPlan } from '../types';
import { authedFetch } from "../lib/authedFetch";

interface LearningEngineProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const LearningEngine: React.FC<LearningEngineProps> = ({ userProfile, onBack }) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [studyPlan, setStudyPlan] = useState<DailyStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authedFetch('/api/gemini/smart-learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: userProfile,
            activity: ['Completed a math quiz', 'Reviewed biology flashcards', 'Struggled with physics concepts']
          })
        });
        
        const data = await response.json();
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.studyPlan) setStudyPlan(data.studyPlan);
      } catch (error) {
        console.error("Error fetching learning data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userProfile]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'review': return <BookOpen className="text-blue-500" />;
      case 'practice': return <Target className="text-emerald-500" />;
      case 'quiz': return <Brain className="text-purple-500" />;
      case 'game': return <Gamepad2 className="text-rose-500" />;
      default: return <Layers className="text-indigo-500" />;
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedPlan = { ...studyPlan, tasks: updatedTasks };
    setStudyPlan(updatedPlan);
  };

  const progress = studyPlan 
    ? (studyPlan.tasks.filter(t => t.completed).length / studyPlan.tasks.length) * 100 
    : 0;

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-app-text">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-black text-app-text">Smart Learning</h1>
      </div>

      {/* Daily Progress Card */}
      <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} />
            <h2 className="text-xl font-bold">Daily Study Plan</h2>
            <span className="ml-auto text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-black">{Math.round(progress)}%</span>
              <span className="text-sm font-bold text-white/70">
                {studyPlan?.tasks.filter(t => t.completed).length} of {studyPlan?.tasks.length} tasks done
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Focus Goal</div>
              <div className="text-xl font-bold">45 mins</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Points Today</div>
              <div className="text-xl font-bold">+{studyPlan?.tasks.filter(t => t.completed).length || 0 * 10} pts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Tasks */}
        <section>
          <h3 className="text-xl font-black text-app-text mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" />
            Today's Tasks
          </h3>
          <div className="space-y-3">
            {studyPlan?.tasks.map(task => (
              <motion.button
                key={task.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTask(task.id)}
                className={`w-full p-5 rounded-3xl border transition-all flex items-center gap-4 text-left ${
                  task.completed 
                    ? 'bg-emerald-50 border-emerald-100 opacity-70' 
                    : 'bg-app-card border-app-border shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  task.completed ? 'bg-emerald-500 text-white' : 'bg-app-bg text-app-text-muted'
                }`}>
                  {task.completed ? <CheckCircle2 size={20} /> : getIcon(task.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${task.completed ? 'text-emerald-900 line-through' : 'text-app-text'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} />
                      {task.duration} mins
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      {task.type}
                    </span>
                  </div>
                </div>
                {!task.completed && <ChevronRight size={20} className="text-app-text-muted" />}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Smart Recommendations */}
        <section>
          <h3 className="text-xl font-black text-app-text mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="p-8 rounded-[40px] bg-app-card border border-app-border text-center">
                <Zap size={40} className="mx-auto mb-4 text-amber-500 opacity-20" />
                <p className="text-app-text-muted">Analyzing your performance... Check back soon!</p>
              </div>
            ) : (
              recommendations.map(rec => (
                <div key={rec.id} className="p-6 rounded-[32px] bg-app-card border border-app-border shadow-sm relative overflow-hidden">
                  {rec.priority === 'high' && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                      Priority
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-app-bg flex items-center justify-center shrink-0">
                      {getIcon(rec.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-app-text mb-1">{rec.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        <AlertCircle size={12} />
                        Based on recent {rec.reason}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-app-text-muted mb-6 leading-relaxed">
                    We noticed you've been {rec.reason}. We suggest a quick session to strengthen this area.
                  </p>
                  <button onClick={() => localStorage.setItem('studysnap-focus-topic', rec.title)} className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100">
                    Start Session
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
