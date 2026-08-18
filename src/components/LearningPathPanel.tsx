import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Flame, LockKeyhole, Play, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { Subject, FocusStats, View } from '../types';

interface LearningPathPanelProps {
  subjects: Subject[];
  stats: FocusStats;
  activityStats: Record<string, number>;
  onViewChange: (view: View) => void;
}

const pathSteps = [
  { id: 'learn', title: 'Learn', subtitle: 'Build the idea', icon: Sparkles },
  { id: 'practice', title: 'Practice', subtitle: 'Test your memory', icon: Target },
  { id: 'review', title: 'Review', subtitle: 'Fix weak spots', icon: RotateCcw },
  { id: 'master', title: 'Master', subtitle: 'Prove what you know', icon: Trophy },
];

export const LearningPathPanel: React.FC<LearningPathPanelProps> = ({ subjects, stats, activityStats, onViewChange }) => {
  const [activeStep, setActiveStep] = useState('practice');
  const streak = stats.streak_days || 0;
  const completedToday = Number(activityStats['daily-plan'] || 0) + Number(activityStats['quiz'] || 0);
  const progress = Math.min(100, 20 + completedToday * 20 + Math.min(streak, 7) * 5);
  const subjectName = subjects[0]?.name || 'your first subject';

  const stepIndex = useMemo(() => pathSteps.findIndex(step => step.id === activeStep), [activeStep]);

  const start = () => {
    if (activeStep === 'learn') onViewChange('studysnap-ai');
    else if (activeStep === 'practice') onViewChange('quiz');
    else if (activeStep === 'review') onViewChange('revision-engine');
    else onViewChange('quiz');
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-app-border bg-app-card p-5 sm:p-7 shadow-sm" aria-labelledby="learning-path-title">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-app-accent text-xs font-black uppercase tracking-[0.16em]"><Sparkles size={14} /> Learning path</div>
          <h2 id="learning-path-title" className="mt-1 text-xl sm:text-2xl font-black text-app-text">Small steps, real progress</h2>
          <p className="mt-1 text-sm text-app-text-muted">A simple path for {subjectName}. Choose the next step when you are ready.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-2 text-xs font-black"><Flame size={15} className="fill-current" /> {streak} day streak</div>
      </div>

      <div className="mt-6 h-2 rounded-full bg-app-bg overflow-hidden" aria-label={`${progress}% path progress`}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-app-accent rounded-full" />
      </div>

      <div className="relative mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pathSteps.map((step, index) => {
          const Icon = step.icon;
          const complete = index < stepIndex || (index === 0 && stats.notes > 0);
          const active = step.id === activeStep;
          return (
            <button key={step.id} type="button" onClick={() => setActiveStep(step.id)} className={`relative text-left rounded-2xl border p-4 transition-all ${active ? 'border-app-accent bg-app-accent-soft shadow-sm' : 'border-app-border bg-app-bg hover:border-app-accent/40'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${complete ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-app-accent text-white' : 'bg-app-card text-app-text-muted'}`}>
                {complete ? <Check size={19} /> : <Icon size={19} />}
              </div>
              <div className="mt-3 font-black text-sm text-app-text">{step.title}</div>
              <div className="text-[11px] text-app-text-muted mt-1">{step.subtitle}</div>
              {index > 0 && index > stepIndex + 1 && <LockKeyhole size={13} className="absolute right-3 top-3 text-app-text-muted" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-app-bg border border-app-border p-4">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-app-text-muted">Next activity</div>
          <div className="font-black text-app-text mt-1">{pathSteps[stepIndex]?.title || 'Practice'} · {pathSteps[stepIndex]?.subtitle}</div>
        </div>
        <button type="button" onClick={start} className="inline-flex items-center justify-center gap-2 rounded-xl bg-app-accent text-white px-5 py-3 font-black text-sm hover:opacity-90 transition-opacity"><Play size={16} fill="currentColor" /> Start</button>
      </div>
    </section>
  );
};

export default LearningPathPanel;
