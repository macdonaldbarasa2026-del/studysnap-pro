import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  ChevronLeft, 
  Star, 
  Zap, 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Milestone,
  Trophy,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface AcademicTimelineProps {
  userName: string;
  onBack: () => void;
}

export const AcademicTimeline: React.FC<AcademicTimelineProps> = ({ userName, onBack }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('studysnap-activities') || '[]');
    const realEvents: TimelineEvent[] = activities.map((a:any, index:number) => ({ id:a.id || `${index}`, user_name:userName, title:String(a.type || 'Study activity').replaceAll('_',' '), description:a.metadata?.title || `${a.type || 'Study'} activity recorded in StudySnap.`, type:a.type==='game_played'?'achievement':a.type==='note_read'?'study_session':'improvement', date:a.timestamp || a.created_at || new Date().toISOString() }));
    setEvents(realEvents.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()));
  }, [userName]);

  const filteredEvents = events.filter(e => selectedType === 'all' || e.type === selectedType);

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return <Milestone className="text-indigo-600" size={20} />;
      case 'achievement': return <Trophy className="text-amber-500" size={20} />;
      case 'study_session': return <BookOpen className="text-emerald-600" size={20} />;
      case 'improvement': return <TrendingUp className="text-rose-600" size={20} />;
    }
  };

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return 'bg-indigo-50 border-indigo-100';
      case 'achievement': return 'bg-amber-50 border-amber-100';
      case 'study_session': return 'bg-emerald-50 border-emerald-100';
      case 'improvement': return 'bg-rose-50 border-rose-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Academic Timeline</h1>
            <p className="text-xs text-slate-500">Your visual learning journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
          <Activity size={14} className="animate-pulse" />
          Real-time Progress
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Days</p>
            <p className="text-3xl font-black text-slate-900">17</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Milestones</p>
            <p className="text-3xl font-black text-indigo-600">4</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Achievements</p>
            <p className="text-3xl font-black text-amber-500">12</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Study Hours</p>
            <p className="text-3xl font-black text-emerald-600">42</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl shadow-sm mb-12">
          {(['all', 'milestone', 'achievement', 'study_session', 'improvement'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                selectedType === type ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-12">
            {filteredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-[26px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
                  event.type === 'milestone' ? 'bg-indigo-600' : 
                  event.type === 'achievement' ? 'bg-amber-500' : 
                  event.type === 'study_session' ? 'bg-emerald-600' : 
                  'bg-rose-600'
                }`} />

                {/* Date Label */}
                <div className="absolute left-0 top-0 -translate-x-full pr-8 text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Event Card */}
                <div className={`p-8 rounded-[40px] border shadow-sm transition-all hover:shadow-md group ${getTypeColor(event.type)}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{event.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">{event.description}</p>
                  {selectedEventId === event.id && <div className="mb-4 p-4 rounded-2xl bg-white/70 text-sm text-slate-600 border border-white">Event details: {event.description}</div>}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={12} />
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)} aria-label="View event details" className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                      <ArrowRight size={20} className={selectedEventId === event.id ? "rotate-90 transition-transform" : "transition-transform"} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* End of Timeline */}
        <div className="mt-20 text-center pb-12">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-400">The journey continues...</h3>
          <p className="text-slate-400 text-sm">Every study session brings you closer to your goals.</p>
        </div>
      </main>
    </div>
  );
};

export default AcademicTimeline;
