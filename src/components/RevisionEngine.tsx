import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Brain, 
  ArrowRight,
  TrendingUp,
  History,
  Sparkles,
  BookOpen,
  Layers
} from 'lucide-react';
import { RevisionSchedule, Note, Flashcard } from '../types';

interface RevisionEngineProps {
  userName: string;
  notes: Note[];
  flashcards: Flashcard[];
  onBack: () => void;
  onReviewNote: (note: Note) => void;
  onReviewFlashcards: (noteId: string) => void;
}

export const RevisionEngine: React.FC<RevisionEngineProps> = ({ 
  userName, 
  notes, 
  flashcards, 
  onBack,
  onReviewNote,
  onReviewFlashcards
}) => {
  const [schedules, setSchedules] = useState<RevisionSchedule[]>([]);
  const [dueToday, setDueToday] = useState<RevisionSchedule[]>([]);
  const [stats, setStats] = useState({
    total_items: 0,
    mastered: 0,
    learning: 0,
    due_count: 0
  });

  useEffect(() => {
    // Load schedules from local storage or database
    const savedSchedules = localStorage.getItem(`revision_schedules_${userName}`);
    if (savedSchedules) {
      const parsedSchedules = JSON.parse(savedSchedules);
      setSchedules(parsedSchedules);
      
      const today = new Date().toISOString().split('T')[0];
      const due = parsedSchedules.filter((s: RevisionSchedule) => s.next_review <= today);
      setDueToday(due);

      setStats({
        total_items: parsedSchedules.length,
        mastered: parsedSchedules.filter((s: RevisionSchedule) => s.interval > 30).length,
        learning: parsedSchedules.filter((s: RevisionSchedule) => s.interval <= 30).length,
        due_count: due.length
      });
    } else {
      // Initialize schedules for existing notes/flashcards if none exist
      const initialSchedules: RevisionSchedule[] = notes.map(note => ({
        id: Math.random().toString(36).substr(2, 9),
        user_name: userName,
        item_id: note.id,
        item_type: 'note',
        next_review: new Date().toISOString().split('T')[0],
        interval: 0,
        ease_factor: 2.5
      }));
      setSchedules(initialSchedules);
      setDueToday(initialSchedules);
      localStorage.setItem(`revision_schedules_${userName}`, JSON.stringify(initialSchedules));
    }
  }, [userName, notes]);

  const getItemDetails = (schedule: RevisionSchedule) => {
    if (schedule.item_type === 'note') {
      return notes.find(n => n.id === schedule.item_id);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-app-bg p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-app-card rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-app-text">Smart Revision Engine</h1>
            <p className="text-app-text-muted">Optimized learning using spaced repetition</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Brain size={24} />
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Due Today', value: stats.due_count, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Mastered', value: stats.mastered, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Learning', value: stats.learning, icon: History, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Total Items', value: stats.total_items, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-app-card p-4 rounded-3xl shadow-sm border border-app-border"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-app-text-muted text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-app-text">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Due Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Review Queue
            </h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
              {dueToday.length} Items
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {dueToday.length > 0 ? (
                dueToday.map((schedule) => {
                  const item = getItemDetails(schedule);
                  if (!item) return null;

                  return (
                    <motion.div
                      key={schedule.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-app-card p-5 rounded-[32px] shadow-sm border border-app-border flex items-center justify-between group hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {schedule.item_type === 'note' ? <BookOpen size={24} /> : <Layers size={24} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-app-text">{(item as Note).title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-app-text-muted flex items-center gap-1">
                              <Clock size={12} />
                              Interval: {schedule.interval}d
                            </span>
                            <span className="text-xs text-app-text-muted flex items-center gap-1">
                              <TrendingUp size={12} />
                              Ease: {schedule.ease_factor.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onReviewNote(item as Note)}
                          className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-app-card rounded-[40px] p-12 text-center border-2 border-dashed border-app-border">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-app-text mb-2">All caught up!</h3>
                  <p className="text-app-text-muted max-w-xs mx-auto">
                    You've completed all your scheduled revisions for today. Great job!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles className="mb-4 text-indigo-200" size={32} />
              <h3 className="text-2xl font-bold mb-2">Daily Insight</h3>
              <p className="text-indigo-100 leading-relaxed">
                Your memory strength in "Science" has increased by 15% this week. Keep up the consistent revision!
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="bg-app-card rounded-[40px] p-8 shadow-sm border border-app-border">
            <h3 className="font-bold text-app-text mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Learning Curve
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Retention Rate', value: 85, color: 'bg-emerald-500' },
                { label: 'Study Consistency', value: 92, color: 'bg-indigo-500' },
                { label: 'Topic Mastery', value: 64, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-app-text-muted font-medium">{item.label}</span>
                    <span className="text-app-text font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={`h-full ${item.color}`}
                    />
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

export default RevisionEngine;
