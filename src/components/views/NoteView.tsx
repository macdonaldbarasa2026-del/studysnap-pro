import React, { useState } from 'react';
import { ChevronLeft, Star, Layers, Brain, Search, Maximize2, Minimize2, Volume2, VolumeX, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, UserProfile } from '../../types';
import { playAiVoice, stopAiVoice } from '../../lib/speech';
import { TopicVideoShelf } from '../TopicVideoShelf';

interface NoteViewProps {
  selectedNote: Note | null;
  setView: (view: any) => void;
  toggleFavorite: (note: Note) => void;
  toggleLock: (note: Note) => void;
  fetchFlashcards: (noteId: string) => void;
  setCurrentCardIndex: (index: number) => void;
  setIsFlipped: (isFlipped: boolean) => void;
  startQuiz: (note: Note) => void;
  handleResearch: (query: string) => void;
  userProfile?: UserProfile | null;
}

export const NoteView: React.FC<NoteViewProps> = ({
  selectedNote,
  setView,
  toggleFavorite,
  toggleLock,
  fetchFlashcards,
  setCurrentCardIndex,
  setIsFlipped,
  startQuiz,
  handleResearch,
  userProfile,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showLockOverlay, setShowLockOverlay] = useState(selectedNote?.is_locked || false);
  const [pin, setPin] = useState('');
  const [unlockError, setUnlockError] = useState('');
  // parental_pin can be 4-6 digits (see ParentMode); the keypad must accept
  // up to that many digits or a longer PIN could never be typed in here.
  const pinMaxLength = userProfile?.parental_pin?.length && userProfile.parental_pin.length >= 4 && userProfile.parental_pin.length <= 6
    ? userProfile.parental_pin.length
    : 4;

  const handleUnlock = () => {
    // Locked notes must be unlocked by the configured owner (parental) PIN.
    // Previously this only checked that 4+ digits had been typed, so any
    // 4-digit number - not the real PIN - would unlock a locked note. Now we
    // compare against the actual configured parental_pin.
    const correctPin = userProfile?.parental_pin;
    if (!correctPin) {
      // No PIN has been configured yet, so there is nothing to unlock against.
      setUnlockError('No parental PIN is set up yet. Set one up in Parent Mode first.');
      setPin('');
      return;
    }
    if (pin === correctPin) {
      setShowLockOverlay(false);
      setPin('');
      setUnlockError('');
    } else {
      setUnlockError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleTTS = async () => {
    if (showLockOverlay) return;
    if (isReading) {
      setIsReading(false);
      stopAiVoice();
      return;
    }

    if (!selectedNote) return;

    setIsReading(true);
    try {
      await playAiVoice(
        `Reading note: ${selectedNote.title}. ${selectedNote.content}`, 
        'Kore',
        () => setIsReading(true),
        () => setIsReading(false)
      );
    } catch (error) {
      console.error('TTS Error:', error);
      setIsReading(false);
    }
  };

  return (
    <div className={`transition-all duration-700 ${isFocusMode ? 'bg-white' : 'pb-40'}`}>
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="p-6 glass sticky top-0 z-10 border-b border-app-border flex items-center justify-between backdrop-blur-xl pt-[calc(1.5rem+var(--safe-top))]"
          >
            <div className="flex items-center gap-5">
              <motion.button 
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('subject')} 
                className="p-2 -ml-2 text-app-text-muted hover:text-app-accent transition-colors"
              >
                <ChevronLeft size={28} />
              </motion.button>
              <h1 className="text-xl font-black tracking-tight truncate max-w-[180px] text-app-text font-sans uppercase tracking-widest text-xs">
                {selectedNote?.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <ActionButton 
                onClick={() => setIsFocusMode(true)}
                icon={<Maximize2 size={20} />}
                color="text-app-text"
                activeBg="bg-app-bg"
              />
              <ActionButton 
                onClick={handleTTS}
                active={isReading}
                icon={isReading ? <VolumeX size={20} /> : <Volume2 size={20} />}
                color="text-app-accent"
                activeBg="bg-app-accent/10"
              />
              <ActionButton 
                onClick={() => toggleLock(selectedNote!)}
                active={selectedNote?.is_locked}
                icon={selectedNote?.is_locked ? <Lock size={20} /> : <Unlock size={20} />}
                color="text-rose-600"
                activeBg="bg-rose-600/10"
              />
              <ActionButton 
                onClick={() => toggleFavorite(selectedNote!)}
                active={selectedNote?.is_favorite}
                icon={<Star size={20} fill={selectedNote?.is_favorite ? "currentColor" : "none"} />}
                color="text-amber-500"
                activeBg="bg-amber-500/10"
              />
              <ActionButton 
                onClick={() => {
                  fetchFlashcards(selectedNote!.id);
                  setView('flashcards');
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                icon={<Layers size={20} />}
                color="text-indigo-600"
                activeBg="bg-indigo-600/10"
              />
              <ActionButton 
                onClick={() => startQuiz(selectedNote!)}
                icon={<Brain size={20} />}
                color="text-emerald-600"
                activeBg="bg-emerald-600/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFocusMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsFocusMode(false)}
          className="fixed top-8 right-8 z-50 p-4 rounded-full bg-app-accent text-white shadow-2xl"
        >
          <Minimize2 size={24} />
        </motion.button>
      )}

      <div className={`p-8 space-y-12 max-w-2xl mx-auto transition-all duration-700 ${isFocusMode ? 'pt-24' : ''} relative`}>
        {showLockOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-app-text mb-2">Note Locked</h3>
            <p className="text-app-text-muted font-bold mb-8 uppercase tracking-widest text-xs">Enter parental pin to view</p>
            
            {unlockError && <p className="text-rose-600 text-sm font-bold mb-4">{unlockError}</p>}

            <div className="flex gap-3 mb-8">
              {Array.from({ length: pinMaxLength }).map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-rose-200 ${pin.length > i ? 'bg-rose-600 border-rose-600' : ''}`} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (num === 'C') setPin('');
                    else if (num === '✓') handleUnlock();
                    else if (pin.length < pinMaxLength) setPin(prev => prev + num);
                  }}
                  className="w-16 h-16 rounded-2xl bg-white border border-app-border flex items-center justify-center text-xl font-black text-app-text shadow-sm"
                >
                  {num}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {selectedNote?.summary && (
          <section className="relative group">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-app-accent rounded-full opacity-20 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.3em] mb-6">Executive Summary</h2>
            <div className="p-8 rounded-[40px] bg-app-accent/5 text-app-text leading-relaxed whitespace-pre-wrap font-medium text-lg italic border border-app-accent/10 shadow-sm">
              {selectedNote.summary}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.3em] mb-6">Detailed Analysis</h2>
          <div className={`text-app-text leading-[1.8] whitespace-pre-wrap font-serif selection:bg-app-accent/20 transition-all duration-500 ${isFocusMode ? 'text-2xl' : 'text-xl'}`}>
            {selectedNote?.content}
          </div>
        </section>

        {/* Recommended YouTube Video Explanations */}
        {selectedNote && (
          <section className="pt-4">
            <TopicVideoShelf 
              topic={selectedNote.title || 'Study Concept'} 
            />
          </section>
        )}
      </div>
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  color: string;
  activeBg: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, active, color, activeBg }) => (
  <motion.button 
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-300 ${active ? `${activeBg} ${color}` : 'bg-app-card text-app-text-muted border border-app-border hover:border-app-accent/30'}`}
  >
    {icon}
  </motion.button>
);
