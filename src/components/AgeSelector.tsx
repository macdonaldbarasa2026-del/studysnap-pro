import React from 'react';
import { motion } from 'motion/react';
import { Baby, User, Users, Swords, ArrowRight } from 'lucide-react';
import { AgeGroup } from '../types';

interface AgeSelectorProps {
  userName: string;
  onSelect: (ageGroup: AgeGroup) => void;
}

export const AgeSelector: React.FC<AgeSelectorProps> = ({ userName, onSelect }) => {
  const ageGroups: { id: AgeGroup; name: string; range: string; icon: React.ReactNode; color: string; description: string }[] = [
    { 
      id: 'baby', 
      name: 'Baby', 
      range: '0-5 years', 
      icon: <Baby size={32} />, 
      color: 'bg-pink-100 text-pink-600',
      description: 'Early learning with simple language, stories, colors, shapes, and sounds.'
    },
    { 
      id: 'kid', 
      name: 'Kid', 
      range: '6-12 years', 
      icon: <Users size={32} />, 
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Guided lessons, practice, and age-appropriate study tools.'
    },
    { 
      id: 'teen', 
      name: 'Teen', 
      range: '13-17 years', 
      icon: <Swords size={32} />, 
      color: 'bg-indigo-100 text-indigo-600',
      description: 'Study, revision, exams, and supervised academic tools.'
    },
    { 
      id: 'adult', 
      name: 'Adult', 
      range: '18+ years', 
      icon: <User size={32} />, 
      color: 'bg-emerald-100 text-emerald-600',
      description: 'Research, productivity, collaboration, and advanced study tools.'
    }
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black mb-4 tracking-tight font-sans">Hi, {userName}!</h1>
        <p className="text-app-text-muted font-bold uppercase tracking-[0.2em] text-xs">Personalize your journey</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ageGroups.map((group, idx) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(group.id)}
            className="p-8 rounded-[40px] bg-app-card border border-app-border card-shadow hover:shadow-xl transition-all text-left flex flex-col gap-6 group"
          >
            <div className={`w-20 h-20 rounded-3xl ${group.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              {group.icon}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-black text-app-text tracking-tight">{group.name}</h3>
                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-app-bg border border-app-border text-app-text-muted uppercase tracking-widest">
                  {group.range}
                </span>
              </div>
              <p className="text-app-text-muted leading-relaxed font-medium">
                {group.description}
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-app-border/50 flex items-center justify-between text-app-text-muted group-hover:text-app-accent transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Mode</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
