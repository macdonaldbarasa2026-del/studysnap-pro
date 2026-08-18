import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, ChevronDown, ChevronUp, User, Sparkles, ChevronLeft } from 'lucide-react';
import { StudyBite } from '../types';

interface StudyBitesProps {
  userName: string;
  onBack?: () => void;
}

export const StudyBites: React.FC<StudyBitesProps> = ({ userName, onBack }) => {
  const [bites, setBites] = useState<StudyBite[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBites = async () => {
      try {
        const response = await fetch('/api/bites');
        const data = await response.json();
        setBites(data);
      } catch (error) {
        console.error("Failed to fetch bites", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBites();
  }, []);

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < bites.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-indigo-500" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="h-full bg-black overflow-hidden relative pt-[var(--safe-top)] pb-[var(--safe-bottom)]"
      onWheel={handleScroll}
      ref={containerRef}
    >
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-[calc(1rem+var(--safe-top))] left-[calc(1rem+var(--safe-left))] z-50 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft size={20} className="sm:size-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={bites[currentIndex]?.id}
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="h-full w-full flex flex-col items-center justify-center p-4 sm:p-6 relative"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black z-0" />

      {/* Content Card */}
      <div className="z-10 w-full max-w-lg glass rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-12 shadow-2xl shadow-black/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-app-accent/10 via-transparent to-emerald-500/10 opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-app-accent flex items-center justify-center shadow-lg shadow-app-accent/20">
              <User className="text-white sm:size-8" size={24} />
            </div>
            <div>
              <h3 className="text-white font-display font-black text-base sm:text-xl tracking-tight">{bites[currentIndex]?.author}</h3>
              <p className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">@{bites[currentIndex]?.topic}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-6 sm:mb-8 leading-tight tracking-tight">
              {bites[currentIndex]?.topic}
            </h2>
            <p className="text-white/80 text-lg sm:text-2xl leading-relaxed font-medium">
              {bites[currentIndex]?.content}
            </p>
          </div>

          <div className="mt-10 sm:mt-12 flex flex-wrap gap-3">
            {bites[currentIndex]?.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] sm:text-xs text-white/60 font-black uppercase tracking-widest border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-6 sm:right-10 bottom-32 sm:bottom-40 flex flex-col gap-6 sm:gap-8 z-20">
        <button onClick={() => { const id = bites[currentIndex]?.id; if (id) setLiked(prev => ({ ...prev, [id]: !prev[id] })); }} aria-label="Like study bite" className="flex flex-col items-center gap-2 group">
          <div className={`p-4 sm:p-5 rounded-[1.5rem] transition-all group-hover:scale-110 border border-white/5 ${liked[bites[currentIndex]?.id || ''] ? 'bg-rose-500/30' : 'bg-white/10'}`}>
            <Heart className="text-white group-hover:text-rose-500 sm:size-8" size={24} fill={liked[bites[currentIndex]?.id || ''] ? 'currentColor' : 'none'} />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-black tracking-widest">{(bites[currentIndex]?.likes || 0) + (liked[bites[currentIndex]?.id || ''] ? 1 : 0)}</span>
        </button>
        <button onClick={() => document.getElementById('bite-comments')?.scrollIntoView({ behavior: 'smooth' })} aria-label="View comments" className="flex flex-col items-center gap-2 group">
          <div className="p-4 sm:p-5 bg-white/10 rounded-[1.5rem] group-hover:bg-app-accent/20 transition-all group-hover:scale-110 border border-white/5">
            <MessageCircle className="text-white group-hover:text-app-accent sm:size-8" size={24} />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-black tracking-widest">{bites[currentIndex]?.comments}</span>
        </button>
        <button onClick={async () => { const bite = bites[currentIndex]; try { if (navigator.share) await navigator.share({ title: bite?.topic || 'Study Bite', text: bite?.content || '' }); else await navigator.clipboard?.writeText(bite?.content || ''); } catch {} }} aria-label="Share study bite" className="flex flex-col items-center gap-2 group">
          <div className="p-4 sm:p-5 bg-white/10 rounded-[1.5rem] group-hover:bg-emerald-500/20 transition-all group-hover:scale-110 border border-white/5">
            <Share2 className="text-white group-hover:text-emerald-500 sm:size-8" size={24} />
          </div>
          <span className="text-white text-[10px] sm:text-xs font-black tracking-widest">{bites[currentIndex]?.shares}</span>
        </button>
        <button onClick={() => { const id = bites[currentIndex]?.id; if (id) setSaved(prev => ({ ...prev, [id]: !prev[id] })); }} aria-label="Save study bite" className="flex flex-col items-center gap-2 group">
          <div className={`p-4 sm:p-5 rounded-[1.5rem] group-hover:bg-amber-500/20 transition-all group-hover:scale-110 border border-white/5 ${saved[bites[currentIndex]?.id || ''] ? 'bg-amber-500/30' : 'bg-white/10'}`}>
            <Bookmark className="text-white group-hover:text-amber-500 sm:size-8" size={24} fill={saved[bites[currentIndex]?.id || ''] ? 'currentColor' : 'none'} />
          </div>
        </button>
      </div>

          {/* Navigation Hints */}
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 sm:gap-2 text-white/30 animate-bounce">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">Scroll for more</span>
            <ChevronDown size={16} className="sm:size-5" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {bites.map((_, idx) => (
          <div 
            key={idx}
            className={`w-1 transition-all duration-300 rounded-full ${idx === currentIndex ? 'h-8 bg-indigo-500' : 'h-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
};
