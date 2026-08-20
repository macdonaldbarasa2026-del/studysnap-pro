import { VideoShelf } from './VideoShelf';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Baby, Palette, Shapes, Music, ArrowLeft, Volume2, Sparkles, Star, Heart, VolumeX, Smile } from 'lucide-react';

interface EarlyLearningModeProps {
  onExit: () => void;
}

type Activity = 'menu' | 'colors' | 'shapes' | 'animals' | 'numbers' | 'piano' | 'videos';

export const EarlyLearningMode: React.FC<EarlyLearningModeProps> = ({ onExit }) => {
  const [activity, setActivity] = useState<Activity>('menu');
  const [activeStarId, setActiveStarId] = useState<number | null>(null);
  const [celebration, setCelebration] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('studysnap-baby-sound') !== 'silent';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'studysnap-baby-sound',
        soundEnabled ? 'talk' : 'silent'
      );
    } catch {
      // Local storage may be unavailable in restricted browsing contexts.
    }

    if (!soundEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [soundEnabled]);

  // Web Audio Synthesizer for Musical Keys
  const playTone = (freq: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
  };

  const speak = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech is optional; visual learning continues without it.
    }
  };

  const triggerCelebration = () => {
    setCelebration(true);
    setTimeout(() => setCelebration(false), 1500);
  };

  const colors = [
    { name: 'Red', color: 'bg-red-500 border-red-600', text: 'text-red-500', icon: '🍎' },
    { name: 'Blue', color: 'bg-blue-500 border-blue-600', text: 'text-blue-500', icon: '🐟' },
    { name: 'Green', color: 'bg-emerald-500 border-emerald-600', text: 'text-emerald-500', icon: 'Frog' },
    { name: 'Yellow', color: 'bg-amber-400 border-amber-500', text: 'text-amber-500', icon: '⭐' },
    { name: 'Purple', color: 'bg-purple-500 border-purple-600', text: 'text-purple-500', icon: '🍇' },
    { name: 'Orange', color: 'bg-orange-500 border-orange-600', text: 'text-orange-500', icon: '🍊' },
    { name: 'Pink', color: 'bg-pink-400 border-pink-500', text: 'text-pink-500', icon: '🌸' },
    { name: 'Cyan', color: 'bg-cyan-400 border-cyan-500', text: 'text-cyan-500', icon: '🐬' },
  ];

  const shapes = [
    { name: 'Circle', desc: 'Round and round!', icon: <div className="w-24 h-24 rounded-full bg-indigo-500 shadow-xl border-4 border-indigo-300" /> },
    { name: 'Square', desc: '4 equal sides!', icon: <div className="w-24 h-24 bg-emerald-500 shadow-xl border-4 border-emerald-300 rounded-xl" /> },
    { name: 'Star', desc: 'Twinkle twinkle!', icon: <Star size={96} className="text-amber-400 fill-amber-400 drop-shadow-xl" /> },
    { name: 'Heart', desc: 'Lots of love!', icon: <Heart size={96} className="text-rose-500 fill-rose-500 drop-shadow-xl" /> },
  ];

  const animals = [
    { name: 'Cat', emoji: '🐱', sound: 'Meow! Meow!' },
    { name: 'Dog', emoji: '🐶', sound: 'Woof! Woof!' },
    { name: 'Lion', emoji: '🦁', sound: 'Roar! I am the King!' },
    { name: 'Cow', emoji: '🐮', sound: 'Moo! Mooo!' },
    { name: 'Frog', emoji: '🐸', sound: 'Ribbit! Hop hop!' },
    { name: 'Panda', emoji: '🐼', sound: 'Hello little friend!' },
  ];

  const numbers = [
    { num: 1, word: 'One', emoji: '🎈', color: 'from-pink-500 to-rose-500' },
    { num: 2, word: 'Two', emoji: '🐥🐥', color: 'from-amber-400 to-orange-500' },
    { num: 3, word: 'Three', emoji: '⭐⭐⭐', color: 'from-emerald-400 to-teal-500' },
    { num: 4, word: 'Four', emoji: '🚗🚗🚗🚗', color: 'from-blue-400 to-indigo-500' },
    { num: 5, word: 'Five', emoji: '🖐️', color: 'from-purple-400 to-violet-500' },
  ];

  const pianoKeys = [
    { note: 'C', name: 'Do', freq: 261.63, color: 'bg-red-500 text-white' },
    { note: 'D', name: 'Re', freq: 293.66, color: 'bg-orange-500 text-white' },
    { note: 'E', name: 'Mi', freq: 329.63, color: 'bg-yellow-400 text-slate-900' },
    { note: 'F', name: 'Fa', freq: 349.23, color: 'bg-green-500 text-white' },
    { note: 'G', name: 'Sol', freq: 392.00, color: 'bg-cyan-500 text-white' },
    { note: 'A', name: 'La', freq: 440.00, color: 'bg-blue-500 text-white' },
    { note: 'B', name: 'Ti', freq: 493.88, color: 'bg-purple-500 text-white' },
    { note: 'C2', name: 'High Do', freq: 523.25, color: 'bg-pink-500 text-white' },
  ];

  const renderMenu = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-5 max-w-5xl mx-auto">
      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('colors'); speak('Colors Learning Fun!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-pink-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">COLORS</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Tap to discover red, blue, green!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">🎨</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('shapes'); speak('Shapes and Figures!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-indigo-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">SHAPES</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Circles, Stars & Hearts!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">🔺</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('animals'); speak('Animal Friends!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-emerald-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">ANIMALS</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Hear cats, dogs & lions!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">🦁</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('numbers'); speak('Let us count 1 2 3!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-amber-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">NUMBERS</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Count balloons & stars!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">🔢</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('piano'); speak('Baby Musical Piano!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-sky-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">BABY PIANO</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Play real cheerful musical notes!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">🎹</div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => { setActivity('videos'); speak('Kids Learning Videos & Rhymes!'); }}
        className="min-h-32 sm:min-h-36 rounded-3xl bg-white border-2 border-violet-200 shadow-sm flex items-center justify-between p-4 sm:p-5 text-slate-800 relative overflow-hidden group"
      >
        <div className="text-left z-10">
          <span className="text-lg sm:text-xl font-black tracking-tight block">BABY VIDEOS</span>
          <span className="text-[11px] sm:text-xs text-slate-500 block mt-1">Nursery rhymes, colors & songs!</span>
        </div>
        <div className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">📺</div>
      </motion.button>
    </div>
  );

  return (
    <div className="relative w-full min-h-full bg-slate-50 font-sans select-none">
      {/* Celebration Confetti Burst */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 pointer-events-none z-[120] flex items-center justify-center"
          >
            <div className="text-8xl animate-bounce">🌟 🎉 ⭐ 🥳 🌟</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <motion.div 
          animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-8 text-5xl"
        >
          🎈
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 right-12 text-6xl"
        >
          ☁️
        </motion.div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 left-16 text-6xl opacity-30"
        >
          ⭐
        </motion.div>
      </div>

      {/* Top Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b-4 border-sky-200/80 shadow-md relative z-10">
        {activity !== 'menu' ? (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActivity('menu'); speak('Back to main menu!'); }}
            className="w-14 h-14 rounded-3xl bg-sky-500 text-white shadow-lg border-2 border-white flex items-center justify-center font-black active:scale-95"
          >
            <ArrowLeft size={30} />
          </motion.button>
        ) : (
          <div className="w-14 h-14 rounded-3xl bg-pink-500 text-white shadow-lg border-2 border-white flex items-center justify-center">
            <Baby size={32} />
          </div>
        )}
        
        <button
          type="button"
          onClick={() => setSoundEnabled((enabled) => !enabled)}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Turn baby mode speech off' : 'Turn baby mode speech on'}
          className="w-14 h-14 rounded-3xl bg-white text-sky-600 border-2 border-sky-200 shadow-sm flex items-center justify-center active:scale-95"
        >
          {soundEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
        </button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-800 uppercase flex items-center gap-2 justify-center">
            {activity === 'menu' ? 'BABY LEARN PRO' : activity.toUpperCase()}
            <Sparkles className="text-amber-400 animate-pulse" size={24} />
          </h1>
          <p className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Interactive Early Learning</p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs tracking-wider shadow-lg border border-slate-700"
        >
          EXIT
        </motion.button>
      </div>

      {/* Activity Canvas */}
      <div className="w-full p-4 sm:p-6 relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activity}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-4xl"
          >
            {activity === 'menu' && renderMenu()}

            {activity === 'colors' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {colors.map((c) => (
                  <motion.button
                    key={c.name}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      speak(c.name);
                      triggerCelebration();
                    }}
                    className={`h-40 rounded-[36px] ${c.color} border-4 border-white shadow-xl flex flex-col items-center justify-center gap-2 text-white active:scale-95 transition-all`}
                  >
                    <span className="text-5xl drop-shadow-md">{c.icon}</span>
                    <span className="text-2xl font-black uppercase tracking-wider drop-shadow-md">{c.name}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {activity === 'shapes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {shapes.map((s) => (
                  <motion.button
                    key={s.name}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      speak(`${s.name}! ${s.desc}`);
                      triggerCelebration();
                    }}
                    className="bg-white rounded-[40px] p-8 border-4 border-sky-200 shadow-xl flex flex-col items-center justify-center gap-4 text-slate-800"
                  >
                    <div className="py-2">{s.icon}</div>
                    <div className="text-center">
                      <span className="text-3xl font-black uppercase tracking-wide block">{s.name}</span>
                      <span className="text-sm font-bold text-sky-600 mt-1 block">{s.desc}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {activity === 'animals' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {animals.map((a) => (
                  <motion.button
                    key={a.name}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      speak(`${a.name}! ${a.sound}`);
                      triggerCelebration();
                    }}
                    className="bg-white rounded-[40px] p-6 border-4 border-amber-200 shadow-xl flex flex-col items-center justify-center gap-2 text-slate-800 active:scale-95"
                  >
                    <span className="text-7xl drop-shadow-md hover:scale-125 transition-transform">{a.emoji}</span>
                    <span className="text-2xl font-black uppercase tracking-wider mt-2">{a.name}</span>
                    <span className="text-xs font-bold text-amber-600 italic">{a.sound}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {activity === 'numbers' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {numbers.map((n) => (
                  <motion.button
                    key={n.num}
                    whileHover={{ scale: 1.06, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      speak(`Number ${n.num}! ${n.word}`);
                      triggerCelebration();
                    }}
                    className={`bg-gradient-to-br ${n.color} text-white rounded-[40px] p-8 border-4 border-white shadow-2xl flex flex-col items-center justify-center gap-3`}
                  >
                    <span className="text-7xl font-black drop-shadow-lg">{n.num}</span>
                    <span className="text-2xl font-extrabold uppercase tracking-widest">{n.word}</span>
                    <span className="text-3xl">{n.emoji}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {activity === 'piano' && (
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[40px] border-4 border-sky-300 shadow-2xl text-center">
                <p className="text-sm font-extrabold text-sky-700 uppercase tracking-widest mb-6">
                  Tap keys to play real cheerful tunes! 🎵
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {pianoKeys.map((p) => (
                    <motion.button
                      key={p.note}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9, y: 8 }}
                      onClick={() => {
                        playTone(p.freq);
                        speak(p.name);
                      }}
                      className={`h-48 rounded-3xl ${p.color} border-4 border-white shadow-xl flex flex-col items-center justify-end pb-6 font-black text-lg active:scale-95 transition-all`}
                    >
                      <span className="text-2xl mb-2">🎵</span>
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{p.note}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activity === 'videos' && (
              <div className="max-w-4xl mx-auto w-full pb-8">
                <VideoShelf age="baby" topic="" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Banner */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-t-4 border-sky-200 text-center flex items-center justify-center gap-3 relative z-10">
        <Volume2 size={24} className="text-sky-600 animate-bounce" />
        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
          TOUCH ANY CARD TO LISTEN & LEARN!
        </span>
      </div>
    </div>
  );
};
