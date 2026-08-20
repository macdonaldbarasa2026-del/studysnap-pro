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
  const [isReading, setIsReading] = useState(false);
  const [showLockOverlay, setShowLockOverlay] = useState(selectedNote?.is_locked || false);
  const [pin, setPin] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const pinMaxLength = userProfile?.parental_pin?.length && userProfile.parental_pin.length >= 4 && userProfile.parental_pin.length <= 6
    ? userProfile.parental_pin.length
    : 4;

  const handleUnlock = () => {
    const correctPin = userProfile?.parental_pin;
    if (!correctPin) {
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
    <div className="flex flex-col h-screen bg-app-bg pb-[var(--safe-bottom)]">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('subject')} className="text-app-text">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-app-text truncate max-w-[200px]">
            {selectedNote?.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <button 
                onClick={() => toggleFavorite(selectedNote!)}
                className={selectedNote?.is_favorite ? "text-amber-500" : "text-app-text"}
              >
                <Star size={24} fill={selectedNote?.is_favorite ? "currentColor" : "none"} />
            </button>
            <button onClick={handleTTS} className="text-app-text">
               {isReading ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedNote?.summary && (
          <div className="bg-app-accent-soft p-4 rounded-xl border border-app-accent/10">
            <h3 className="text-xs font-bold text-app-accent uppercase tracking-wider mb-2">Summary</h3>
            <p className="text-app-text text-sm italic">{selectedNote.summary}</p>
          </div>
        )}

        <div className="bg-app-card p-4 rounded-xl border border-app-border min-h-[50vh]">
           <div className="prose prose-sm max-w-none text-app-text whitespace-pre-wrap font-sans leading-relaxed">
            {selectedNote?.content}
          </div>
        </div>

        {selectedNote && (
          <TopicVideoShelf 
            topic={selectedNote.title || 'Study Concept'} 
          />
        )}
      </main>

      <div className="p-4 grid grid-cols-2 gap-3 border-t border-app-border bg-app-card">
         <button 
                onClick={() => {
                  fetchFlashcards(selectedNote!.id);
                  setView('flashcards');
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className="ss-btn ss-btn-accent w-full"
              >
                <Layers size={18} /> Flashcards
          </button>
          <button 
                onClick={() => startQuiz(selectedNote!)}
                className="ss-btn ss-btn-primary w-full"
              >
                <Brain size={18} /> Practice Quiz
          </button>
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
