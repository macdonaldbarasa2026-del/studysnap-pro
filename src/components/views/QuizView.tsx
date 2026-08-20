import React, { useEffect, useState } from 'react';
import { ChevronLeft, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { Note } from '../../types';
import confetti from 'canvas-confetti';
import { playAiVoice, stopAiVoice } from '../../lib/speech';

interface QuizViewProps {
  selectedNote: Note | null;
  quizFinished: boolean;
  currentQuizIndex: number;
  quizQuestions: any[];
  quizScore: number;
  selectedOption: string | null;
  setView: (view: any) => void;
  handleQuizAnswer: (option: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  selectedNote,
  quizFinished,
  currentQuizIndex,
  quizQuestions,
  quizScore,
  selectedOption,
  setView,
  handleQuizAnswer,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      stopAiVoice();
    };
  }, []);

  useEffect(() => {
    if (quizFinished) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#00ffcc', '#ff00ff']
      });

      const finishSummary = `Quiz completed! You scored ${quizScore} out of ${quizQuestions.length}. ${
        quizScore >= quizQuestions.length * 0.8
          ? 'Exceptional mastery of this topic!'
          : 'Great effort! Keep practicing to strengthen your recall.'
      }`;
      playAiVoice(finishSummary, 'Aoede', () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  }, [quizFinished, quizScore, quizQuestions.length]);

  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      stopAiVoice();
      setIsSpeaking(false);
      return;
    }

    const currentQ = quizQuestions[currentQuizIndex];
    if (!currentQ) return;

    const optionsText = currentQ.options ? currentQ.options.map((opt: string, idx: number) => `Option ${idx + 1}: ${opt}`).join('. ') : '';
    const fullText = `Question ${currentQuizIndex + 1}: ${currentQ.question}. ${optionsText}`;

    setIsSpeaking(true);
    playAiVoice(fullText, 'Zephyr', () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  return (
    <div className="min-h-full flex flex-col bg-app-bg">
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
        {!quizFinished && (
          <span className="font-bold text-app-text-muted">
            {currentQuizIndex + 1} / {quizQuestions.length}
          </span>
        )}
        {!quizFinished ? (
          <button
            onClick={handleSpeakQuestion}
            className={`p-2.5 rounded-full border transition-all ${
              isSpeaking
                ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse shadow-md shadow-indigo-300'
                : 'bg-app-card text-indigo-500 border-app-border hover:bg-indigo-50'
            }`}
            title={isSpeaking ? "Stop Voice" : "Read Question Aloud"}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div className="flex-1 p-6">
        {quizFinished ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-app-text">Quiz Complete!</h2>
            <p className="text-app-text-muted mb-8">You scored {quizScore} out of {quizQuestions.length}</p>
            <button 
              onClick={() => {
                stopAiVoice();
                setView(selectedNote ? 'note' : 'home');
              }}
              className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold active:scale-95 transition-transform"
            >
              {selectedNote ? 'Back to Note' : 'Back to Home'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-app-text">{quizQuestions[currentQuizIndex]?.question}</h2>
            <div className="space-y-3">
              {quizQuestions[currentQuizIndex]?.options.map((option: string) => (
                <button
                  key={option}
                  onClick={() => {
                    stopAiVoice();
                    setIsSpeaking(false);
                    if (!selectedOption) handleQuizAnswer(option);
                  }}
                  className={`w-full p-5 rounded-3xl text-left font-medium transition-all active:scale-[0.99] ${
                    selectedOption === option 
                      ? option === quizQuestions[currentQuizIndex].correctAnswer 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-rose-500 text-white'
                      : selectedOption && option === quizQuestions[currentQuizIndex].correctAnswer
                        ? 'bg-emerald-500 text-white'
                        : 'bg-app-card border border-app-border text-app-text'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
