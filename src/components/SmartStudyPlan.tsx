import React, { useMemo } from 'react';
import { Brain, Clock3, Flame, Play, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { View, Subject, FocusStats } from '../types';

interface SmartStudyPlanProps {
  subjects: Subject[];
  stats: FocusStats;
  activityStats: Record<string, number>;
  onViewChange: (view: View) => void;
  onFocusMode: () => void;
}

/** A small, deterministic daily plan: useful immediately, honest about what it knows. */
export const SmartStudyPlan: React.FC<SmartStudyPlanProps> = ({ subjects, stats, activityStats, onViewChange, onFocusMode }) => {
  const completedToday = activityStats.today || 0;
  const streak = stats?.streak_days || activityStats.streak || 0;
  const focusMinutes = Math.max(0, Math.round(stats?.total_study_time || 0));
  const nextSubject = useMemo(() => subjects[0], [subjects]);

  const steps = [
    { icon: <Clock3 size={18} />, title: 'Focus for 25 minutes', detail: nextSubject ? `Focus on ${nextSubject.name}` : 'Choose a subject to get started', action: onFocusMode, label: 'Start focus' },
    { icon: <Brain size={18} />, title: 'Test your memory', detail: 'Check what you remember instead of rereading', action: () => onViewChange('quiz'), label: 'Practice now' },
    { icon: <RotateCcw size={18} />, title: 'Review one weak area', detail: 'Turn one weak area into a quick review', action: () => onViewChange('revision-engine'), label: 'Review now' },
  ];

  return (
    <section className="mb-10 sm:mb-12" aria-labelledby="smart-plan-title">
      <div className="p-5 sm:p-7 bg-app-card border border-app-border shadow-sm rounded-[28px]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-app-accent text-[10px] font-black uppercase tracking-[0.22em]"><Sparkles size={14} /> Smart Study Plan</div>
            <h2 id="smart-plan-title" className="text-2xl sm:text-3xl font-display font-black text-app-text mt-2">Your plan for today</h2>
            <p className="text-sm text-app-text-muted mt-1">Three focused actions, chosen to keep your momentum moving.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[250px]">
            <Metric icon={<Target size={14}/>} label="Today" value={String(completedToday)} />
            <Metric icon={<Flame size={14}/>} label="Streak" value={`${streak}d`} />
            <Metric icon={<Trophy size={14}/>} label="Focus" value={`${focusMinutes}m`} />
          </div>
        </div>
        <div className="grid gap-3 mt-6">
          {steps.map((step, index) => (
            <button key={step.title} onClick={step.action} className="group w-full text-left flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-app-border bg-app-bg/70 hover:bg-app-bg p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0"><span className="sr-only">Step {index + 1}</span>{step.icon}</div>
              <div className="min-w-0 flex-1 w-full"><p className="font-black text-app-text leading-tight">{step.title}</p><p className="text-xs text-app-text-muted mt-0.5 sm:truncate">{step.detail}</p></div>
              <span className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-app-accent text-white px-3 py-2.5 text-xs font-black"><Play size={12} fill="currentColor" />{step.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl bg-app-bg p-3 text-center border border-app-border"><div className="flex justify-center text-app-accent mb-1">{icon}</div><div className="text-sm font-black text-app-text">{value}</div><div className="text-[9px] uppercase tracking-wider font-bold text-app-text-muted">{label}</div></div>
);
