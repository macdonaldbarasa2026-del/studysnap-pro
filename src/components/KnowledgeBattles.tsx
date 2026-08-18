import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, 
  ChevronLeft, 
  Trophy, 
  Users, 
  Timer, 
  Sword, 
  Shield, 
  Star, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Activity,
  Sparkles
} from 'lucide-react';
import { authedFetch } from "../lib/authedFetch";

interface KnowledgeBattlesProps {
  userName: string;
  onBack: () => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export const KnowledgeBattles: React.FC<KnowledgeBattlesProps> = ({ userName, onBack }) => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartBattle = async () => {
    setIsLoading(true);
    try {
      const response = await authedFetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Generate 5 challenging general knowledge trivia questions for a competitive academic battle.' })
      });
      const data = await response.json();
      if (data.quiz && data.quiz.length > 0) {
        const formattedQuestions: Question[] = data.quiz.map((q: any, index: number) => ({
          id: index.toString(),
          text: q.question,
          options: q.options,
          correctAnswer: q.options.indexOf(q.correctAnswer) !== -1 ? q.options.indexOf(q.correctAnswer) : 0,
          points: 100
        }));
        setQuestions(formattedQuestions);
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectAnswers(0);
        setStreak(0);
        setTimeLeft(15);
        setSelectedOption(null);
        setIsCorrect(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + questions[currentQuestionIndex].points + (streak * 10));
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setTimeLeft(15);
      } else {
        setGameState('results');
      }
    }, 1500);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && selectedOption === null) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedOption === null) {
      handleAnswer(-1); // Time out
    }
  }, [timeLeft, gameState, selectedOption]);

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col text-white overflow-hidden pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      {/* Header */}
      <header className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4 max-w-[60%]">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors shrink-0">
            <ChevronLeft size={20} className="sm:size-6" />
          </button>
          <div className="truncate">
            <h1 className="text-lg sm:text-xl font-bold truncate">Knowledge Battles</h1>
            <p className="text-[8px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest truncate">Fast-paced academic combat</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Timer size={16} className={`sm:size-5 ${timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
              <span className={`text-lg sm:text-2xl font-black tabular-nums ${timeLeft < 5 ? 'text-rose-500' : 'text-white'}`}>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-900/20">
              <Zap size={14} className="sm:size-[18px] fill-current" />
              <span className="text-base sm:text-lg font-black">{score}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto no-scrollbar">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-600/10 rounded-full blur-2xl sm:blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-rose-600/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000" />
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'lobby' && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center max-w-md w-full py-8"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-600 rounded-[32px] sm:rounded-[40px] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-indigo-500/20 rotate-12">
                <Sword size={48} className="text-white sm:size-16" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4">Ready for Battle?</h2>
              <p className="text-slate-400 mb-8 sm:mb-12 text-base sm:text-lg">30 seconds. Random topics. High stakes. Prove your knowledge.</p>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
                <div className="p-4 sm:p-6 bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Battle Format</p>
                  <p className="text-xl sm:text-2xl font-black text-indigo-400">5 Questions</p>
                </div>
                <div className="p-4 sm:p-6 bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Time / Question</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">15 sec</p>
                </div>
              </div>

              <button 
                onClick={handleStartBattle}
                disabled={isLoading}
                className="w-full py-5 sm:py-6 bg-indigo-600 text-white rounded-2xl sm:rounded-[32px] font-black text-xl sm:text-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-3 sm:gap-4 group disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Battle...' : 'Find Opponent'}
                {!isLoading && <ArrowRight size={24} className="sm:size-7 group-hover:translate-x-2 transition-transform" />}
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl py-4"
            >
              {/* Question Card */}
              <div className="bg-slate-900 rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 border border-slate-800 shadow-2xl mb-6 sm:mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-slate-800">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 15, ease: 'linear' }}
                    className="h-full bg-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <span className="px-3 sm:px-4 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">Question {currentQuestionIndex + 1}/{questions.length}</span>
                  {streak > 1 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-amber-500 font-black animate-bounce text-sm sm:text-base">
                      <Flame size={16} className="sm:size-5 fill-current" />
                      {streak}x STREAK
                    </div>
                  )}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">{questions[currentQuestionIndex].text}</h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {questions[currentQuestionIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedOption !== null}
                    className={`p-5 sm:p-6 rounded-2xl sm:rounded-[32px] text-left text-base sm:text-lg font-bold border-2 transition-all flex items-center justify-between group ${
                      selectedOption === null ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 hover:bg-slate-800' :
                      i === questions[currentQuestionIndex].correctAnswer ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' :
                      selectedOption === i ? 'bg-rose-600/20 border-rose-500 text-rose-400' :
                      'bg-slate-900 border-slate-800 opacity-50'
                    }`}
                  >
                    <span className="max-w-[85%]">{option}</span>
                    {selectedOption !== null && i === questions[currentQuestionIndex].correctAnswer && <CheckCircle2 size={20} className="sm:size-6" />}
                    {selectedOption === i && i !== questions[currentQuestionIndex].correctAnswer && <XCircle size={20} className="sm:size-6" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md w-full py-8"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-500 rounded-[32px] sm:rounded-[40px] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-amber-900/20">
                <Trophy size={48} className="text-white sm:size-16" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black mb-2">Victory!</h2>
              <p className="text-slate-400 mb-8 sm:mb-12 text-base sm:text-lg">You outsmarted your opponent.</p>
              
              {(() => {
                const accuracy = questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0;
                const xpGained = Math.max(0, score + (correctAnswers * 50));
                const rank = score >= 400 ? 'Elite' : score >= 250 ? 'Skilled' : score >= 100 ? 'Rising' : 'Rookie';
                return (
                  <div className="bg-slate-900 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-slate-800 mb-8 sm:mb-12 space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Final Score</span>
                      <span className="text-2xl sm:text-3xl font-black text-indigo-400">{score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Accuracy</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">{accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">XP Gained</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-500">+{xpGained}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">Battle Rank</span>
                      <span className="text-lg sm:text-xl font-black text-white">{rank}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={handleStartBattle}
                  className="flex-1 py-4 sm:py-5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20"
                >
                  Play Again
                </button>
                <button 
                  onClick={onBack}
                  className="px-8 py-4 sm:py-5 bg-slate-800 text-white rounded-xl sm:rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default KnowledgeBattles;
