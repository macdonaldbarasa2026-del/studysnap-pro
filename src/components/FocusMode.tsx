import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Coffee, BookOpen, Brain, Zap, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { MindRefreshModal } from './MindRefreshModal';

interface FocusModeProps {
  onExit: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onExit }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-950 z-[1000] flex flex-col items-center p-6 sm:p-8 text-white overflow-y-auto no-scrollbar pt-[calc(2rem+var(--safe-top))] pb-[calc(2rem+var(--safe-bottom))]"
    >
      {/* Background Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-600/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      <button 
        onClick={() => setShowExitConfirm(true)}
        className="absolute top-[calc(1.5rem+var(--safe-top))] right-[calc(1.5rem+var(--safe-right))] p-3 sm:p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 z-20"
      >
        <X size={20} className="sm:size-6" />
      </button>

      <div className="text-center mb-8 sm:mb-16 relative z-10 mt-auto">
        <motion.div 
          animate={{ 
            scale: isActive ? [1, 1.02, 1] : 1,
            boxShadow: isActive ? ['0 0 20px rgba(79, 70, 229, 0.1)', '0 0 40px rgba(79, 70, 229, 0.2)', '0 0 20px rgba(79, 70, 229, 0.1)'] : 'none'
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-white/10 flex flex-col items-center justify-center mb-6 sm:mb-8 mx-auto relative bg-neutral-900/50 backdrop-blur-xl"
        >
          <div className="text-4xl sm:text-6xl font-mono font-black tracking-tighter mb-1 sm:mb-2">{formatTime(seconds)}</div>
          <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Focus Time</div>
          
          {isActive && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx={96}
                cy={96}
                r={94}
                fill="none"
                stroke="rgba(79, 70, 229, 0.3)"
                strokeWidth="3"
                strokeDasharray="590"
                strokeDashoffset={590 - (590 * (seconds % 60) / 60)}
                className="sm:hidden transition-all duration-1000 ease-linear"
              />
              <circle
                cx={128}
                cy={128}
                r={126}
                fill="none"
                stroke="rgba(79, 70, 229, 0.3)"
                strokeWidth="4"
                strokeDasharray="792"
                strokeDashoffset={792 - (792 * (seconds % 60) / 60)}
                className="hidden sm:block transition-all duration-1000 ease-linear"
              />
            </svg>
          )}
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2 tracking-tight uppercase">Deep Work Mode</h1>
        <p className="text-white/40 font-medium text-xs sm:text-base max-w-[280px] sm:max-w-none mx-auto">Distractions are hidden. Only study tools remain.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16 relative z-10">
        <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shadow-xl">
            <BookOpen size={24} className="sm:size-8" />
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Read</span>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 shadow-xl">
            <Brain size={24} className="sm:size-8" />
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Review</span>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shadow-xl">
            <Zap size={24} className="sm:size-8" />
          </div>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Solve</span>
        </motion.div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 relative z-10">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(!isActive)}
          className={`px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black flex items-center gap-2 sm:gap-3 transition-all text-sm sm:text-base ${
            isActive ? 'bg-white/10 text-white border border-white/10' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40'
          }`}
        >
          {isActive ? <Pause size={18} className="sm:size-5" /> : <Play size={18} className="sm:size-5" />}
          {isActive ? 'Pause' : 'Resume'}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 text-white/60"
        >
          <RotateCcw size={18} className="sm:size-5" />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExitConfirm(true)}
          className="px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-white text-neutral-950 font-black shadow-2xl text-sm sm:text-base"
        >
          Finish
        </motion.button>
      </div>

      <motion.button 
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsActive(false);
          setShowBreakModal(true);
        }}
        className="mt-10 sm:mt-20 mb-auto flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 relative z-10 transition-colors cursor-pointer"
      >
        <Coffee size={16} className="text-amber-400 sm:size-[18px]" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
          Mind Refresh Break (Free Lo-Fi & Relaxation)
        </span>
        <Sparkles size={14} className="text-amber-400" />
      </motion.button>

      {/* Mind Refresh Break Modal */}
      <MindRefreshModal
        isOpen={showBreakModal}
        onClose={() => {
          setShowBreakModal(false);
          setIsActive(true);
        }}
      />

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 border border-white/10 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
                <Timer size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">Finish Session?</h2>
              <p className="text-white/40 mb-8 font-medium">You've focused for {formatTime(seconds)}. Ready to wrap up?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onExit}
                  className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl"
                >
                  Yes, Finish Study
                </button>
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-5 bg-white/5 text-white rounded-3xl font-black"
                >
                  Keep Focusing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
