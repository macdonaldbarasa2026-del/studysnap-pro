import React, { useState, useEffect } from 'react';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { Flashcard, Note } from '../../types';
import { playAiVoice, stopAiVoice } from '../../lib/speech';

interface FlashcardsViewProps {
  selectedNote: Note | null;
  flashcards: Flashcard[];
  currentCardIndex: number;
  isFlipped: boolean;
  setView: (view: any) => void;
  setIsFlipped: (isFlipped: boolean) => void;
  setCurrentCardIndex: (index: number | ((prev: number) => number)) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  selectedNote,
  flashcards,
  currentCardIndex,
  isFlipped,
  setView,
  setIsFlipped,
  setCurrentCardIndex,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      stopAiVoice();
    };
  }, []);

  const handleSpeakCurrent = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking) {
      stopAiVoice();
      setIsSpeaking(false);
      return;
    }

    if (!flashcards[currentCardIndex]) return;
    const textToSpeak = isFlipped 
      ? `Answer: ${flashcards[currentCardIndex].answer}` 
      : `Question: ${flashcards[currentCardIndex].question}`;

    setIsSpeaking(true);
    playAiVoice(
      textToSpeak,
      'Zephyr',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <div className="p-6 flex items-center justify-between">
        <button 
          onClick={() => {
            stopAiVoice();
            setView(selectedNote ? 'note' : 'home');
          }} 
          className="p-2 -ml-2 text-app-text"
        >
          <ChevronLeft size={28} />
        </button>
        <span className="font-bold text-app-text-muted">
          {flashcards.length > 0 ? `${currentCardIndex + 1} / ${flashcards.length}` : '0 / 0'}
        </span>
        <button
          onClick={handleSpeakCurrent}
          className={`p-2.5 rounded-full border transition-all ${
            isSpeaking 
              ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse shadow-md shadow-indigo-300' 
              : 'bg-app-card text-indigo-500 border-app-border hover:bg-indigo-50'
          }`}
          title={isSpeaking ? "Stop Voice" : "Listen to Flashcard"}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {flashcards.length > 0 ? (
          <motion.div 
            className="w-full aspect-[3/4] max-w-sm relative perspective-1000 cursor-pointer"
            onClick={() => {
              stopAiVoice();
              setIsSpeaking(false);
              setIsFlipped(!isFlipped);
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-app-card rounded-[40px] shadow-xl border border-app-border p-10 flex flex-col items-center justify-between text-center">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Question</span>
                <h2 className="text-2xl font-bold text-app-text my-auto">{flashcards[currentCardIndex].question}</h2>
                <div className="flex items-center gap-2 text-app-text-muted text-xs">
                  <span>Tap to flip</span>
                  <span>•</span>
                  <span className="text-indigo-500 font-semibold">Tap top speaker to listen</span>
                </div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-[40px] shadow-xl p-10 flex flex-col items-center justify-between text-center text-white rotate-y-180">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Answer</span>
                <h2 className="text-2xl font-medium my-auto">{flashcards[currentCardIndex].answer}</h2>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <span>Tap to flip back</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center text-app-text-muted">No flashcards generated for this note.</div>
        )}
      </div>

      <div className="p-10 flex justify-between items-center gap-4">
        <button 
          disabled={currentCardIndex === 0}
          onClick={() => {
            stopAiVoice();
            setIsSpeaking(false);
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
          }}
          className="flex-1 p-5 rounded-3xl bg-app-card border border-app-border font-bold text-app-text disabled:opacity-30 active:scale-95 transition-transform"
        >
          Previous
        </button>
        <button 
          disabled={currentCardIndex === flashcards.length - 1}
          onClick={() => {
            stopAiVoice();
            setIsSpeaking(false);
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
          }}
          className="flex-1 p-5 rounded-3xl bg-indigo-600 text-white font-bold disabled:opacity-30 active:scale-95 transition-transform"
        >
          Next
        </button>
      </div>
    </div>
  );
};
