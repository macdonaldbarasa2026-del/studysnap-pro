import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WifiOff, 
  Baby, 
  Layers, 
  Brain, 
  Timer, 
  PenTool, 
  Calculator, 
  BookOpen, 
  X, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { View } from '../types';
import { hapticClick } from '../lib/haptics';

interface OfflineActivitiesHubProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: View) => void;
}

export const OfflineActivitiesHub: React.FC<OfflineActivitiesHubProps> = ({
  isOpen,
  onClose,
  onSelectView,
}) => {
  if (!isOpen) return null;

  const offlineActivities = [
    {
      id: 'early-learning',
      title: 'Baby & Kids Learning Mode',
      desc: 'Animal sounds, 8-note piano, colors, numbers & interactive speech synth.',
      icon: <Baby size={24} className="text-pink-400" />,
      tag: '100% Offline',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      action: () => onSelectView('early-learning'),
    },
    {
      id: 'flashcards',
      title: 'Offline Flashcard Deck',
      desc: 'Review cached cards, flip definitions & track mastery without internet.',
      icon: <Layers size={24} className="text-cyan-400" />,
      tag: 'Local Cache',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => onSelectView('flashcards'),
    },
    {
      id: 'arena',
      title: 'Brain Arena & Speed Math',
      desc: 'Play speed arithmetic, pattern match & memory matrix against local engine.',
      icon: <Brain size={24} className="text-amber-400" />,
      tag: 'Zero Latency',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      action: () => onSelectView('arena'),
    },
    {
      id: 'focus',
      title: 'Deep Focus & Daily Challenges',
      desc: 'Synthesized breathing pacing, focus clock & daily offline challenges.',
      icon: <Timer size={24} className="text-emerald-400" />,
      tag: 'Built-in Audio',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      action: () => onSelectView('daily-challenges'),
    },
    {
      id: 'problem-solver',
      title: 'Algorithmic Math & Formula Lab',
      desc: 'Step-by-step calculus, algebra formulas & scientific units calculations.',
      icon: <Calculator size={24} className="text-purple-400" />,
      tag: 'Instant Calc',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      action: () => onSelectView('problem-solver'),
    },
    {
      id: 'handwriting',
      title: 'Handwriting Canvas & Sketchpad',
      desc: 'Draw visual diagrams, sketch mind-maps & save notes to local device.',
      icon: <PenTool size={24} className="text-indigo-400" />,
      tag: 'Local Drawing',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      action: () => onSelectView('handwriting-converter'),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg max-h-[85vh] bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <WifiOff size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Offline Activities Hub
                </h2>
                <p className="text-xs text-slate-400">
                  Fully operational without internet connection
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                hapticClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Activity Cards List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {offlineActivities.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  hapticClick();
                  act.action();
                  onClose();
                }}
                className="w-full p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left flex items-start gap-4 transition-all group active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {act.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${act.badgeColor}`}>
                      {act.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {act.desc}
                  </p>
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all mt-3 shrink-0" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-300">
              <ShieldCheck size={16} className="text-emerald-400" />
              Service Worker Storage: Active
            </div>
            <button
              onClick={() => {
                hapticClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
