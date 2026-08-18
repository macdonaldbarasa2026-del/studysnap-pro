import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  ChevronLeft, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { StudyMistake } from '../types';

interface ErrorTrackerProps {
  userName: string;
  onBack: () => void;
  onStartRevision: (topic: string) => void;
}

export const ErrorTracker: React.FC<ErrorTrackerProps> = ({ userName, onBack, onStartRevision }) => {
  const [mistakes, setMistakes] = useState<StudyMistake[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');

  useEffect(() => {
    setMistakes([]);
  }, [userName]);

  const topics = ['all', ...Array.from(new Set(mistakes.map(m => m.topic)))];

  const filteredMistakes = mistakes.filter(m => {
    const matchesSearch = m.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || m.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Smart Error Tracker</h1>
            <p className="text-xs text-slate-500">Turn mistakes into learning opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold flex items-center gap-1">
            <AlertCircle size={14} />
            {mistakes.length} Errors Found
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Errors</p>
              <p className="text-2xl font-black text-slate-900">{mistakes.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weakest Topic</p>
              <p className="text-2xl font-black text-slate-900">Chemistry</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Improvement</p>
              <p className="text-2xl font-black text-slate-900">+24%</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search mistakes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl shadow-sm">
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  selectedTopic === topic ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes List */}
        <div className="space-y-6">
          {filteredMistakes.map((mistake, i) => (
            <motion.div
              key={mistake.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:border-rose-200 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mistake.severity === 'high' ? 'bg-rose-100 text-rose-600' : 
                    mistake.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{mistake.topic}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(mistake.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => onStartRevision(mistake.topic)} aria-label={`Open actions for ${mistake.topic}`} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <MoreVertical size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Question</p>
                <p className="text-lg font-bold text-slate-900 leading-relaxed">{mistake.question}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <XCircle size={12} />
                    Your Answer
                  </p>
                  <p className="font-bold text-rose-900">{mistake.wrong_answer}</p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Correct Answer
                  </p>
                  <p className="font-bold text-emerald-900">{mistake.correct_answer}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={14} className="text-amber-500 fill-current" />
                  AI Explanation & Fix
                </h4>
                <p className="text-slate-700 font-medium leading-relaxed">{mistake.explanation}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => onStartRevision(mistake.topic)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                >
                  <RefreshCw size={18} />
                  Practice Similar Problems
                </button>
                <button onClick={() => onStartRevision(mistake.topic)} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                  <BookOpen size={18} />
                  Review Topic
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ErrorTracker;
