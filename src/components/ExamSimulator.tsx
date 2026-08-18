import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  AlertTriangle, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Shield,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  Send,
  Trophy,
  History,
  Clock
} from 'lucide-react';
import { Subject, Note } from '../types';
import { authedFetch } from "../lib/authedFetch";

interface ExamSimulatorProps {
  userName: string;
  subjects: Subject[];
  notes: Note[];
  onBack: () => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({ 
  userName, 
  subjects, 
  notes, 
  onBack 
}) => {
  const [status, setStatus] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [duration, setDuration] = useState(30); // minutes
  const [isStrictMode, setIsStrictMode] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'playing' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    if (timeLeft === 0 && status === 'playing') {
      finishExam();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, isPaused, timeLeft]);

  const startExam = async () => {
    if (!selectedSubject) return;
    setIsLoading(true);
    
    try {
      const subjectNotes = notes.filter(n => n.subject_id === selectedSubject.id);
      const notesContent = subjectNotes.map(n => n.content).join('\n\n');

      const prompt = `Generate 10 multiple-choice questions for an exam on the subject: ${selectedSubject.name}.
      ${notesContent ? `Base the questions on these study notes:\n${notesContent}` : 'Generate general academic questions for this subject.'}
      
      Return the response as a JSON array of objects with this structure:
      {
        "id": "unique-id",
        "text": "Question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_idx": 0-3,
        "explanation": "Brief explanation of the correct answer"
      }`;

      const response = await authedFetch('/api/gemini/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) throw new Error('API failed');
      const generatedQuestions = await response.json();
      setQuestions(generatedQuestions);
      setTimeLeft(duration * 60);
      setStatus('playing');
      setCurrentIdx(0);
      setAnswers({});
    } catch (error) {
      console.error('Exam generation error:', error);
      // Fallback to basic questions if AI fails
      const fallbackQuestions: Question[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `q-${i}`,
        text: `Question ${i + 1} about ${selectedSubject.name}: What is a key concept in this field?`,
        options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
        correct_idx: 0,
        explanation: 'This is a fallback question.'
      }));
      setQuestions(fallbackQuestions);
      setTimeLeft(duration * 60);
      setStatus('playing');
    } finally {
      setIsLoading(false);
    }
  };

  const finishExam = () => {
    setStatus('finished');
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_idx) correct++;
    });
    return (correct / questions.length) * 100;
  };

  if (status === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exam Pressure Simulator</h1>
            <p className="text-slate-500">Prepare yourself for the real exam environment.</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Subject</label>
              <div className="grid grid-cols-2 gap-4">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedSubject?.id === s.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 hover:border-indigo-100'}`}
                  >
                    <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: s.color }} />
                    <span className="font-bold">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Exam Duration: {duration} min</label>
              <input 
                type="range" 
                min="5" 
                max="120" 
                step="5"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>5 MIN</span>
                <span>60 MIN</span>
                <span>120 MIN</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Shield className="text-indigo-600" size={24} />
                <div>
                  <h4 className="font-bold text-slate-900">Strict Mode</h4>
                  <p className="text-xs text-slate-500">Simulates real exam constraints.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStrictMode(!isStrictMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isStrictMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isStrictMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <button
              disabled={!selectedSubject || isLoading}
              onClick={startExam}
              className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={24} className="fill-current" />
              )}
              {isLoading ? 'Generating Exam...' : 'Start Simulator'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
              <AlertTriangle className="text-amber-600 mb-3" size={24} />
              <h4 className="font-bold text-amber-900">Why use the simulator?</h4>
              <p className="text-amber-700 text-sm leading-relaxed">
                Practicing under time pressure helps reduce exam anxiety and improves your ability to recall information quickly.
              </p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
              <History className="text-indigo-600 mb-3" size={24} />
              <h4 className="font-bold text-indigo-900">Recent Performance</h4>
              <p className="text-indigo-700 text-sm leading-relaxed">
                Complete an exam simulation to see your real score and timing here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 max-w-lg w-full"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Exam Completed!</h2>
          <p className="text-slate-500 mb-8">Here is your performance summary for {selectedSubject?.name}.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Score</p>
              <p className="text-3xl font-bold text-indigo-600">{score}%</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Time Left</p>
              <p className="text-3xl font-bold text-slate-900">{formatTime(timeLeft)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setStatus('setup')}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Back to Setup
            </button>
            <button 
              onClick={onBack}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Exit Simulator
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Exam Header */}
      <header className="p-6 bg-slate-900 border-b border-white/10 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-indigo-400'}`}>
            <Clock size={20} className="inline mr-2 mb-1" />
            {formatTime(timeLeft)}
          </div>
          <div className="hidden md:block">
            <h2 className="font-bold text-sm">{selectedSubject?.name} Exam</h2>
            <p className="text-xs text-slate-400">Question {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button 
            onClick={finishExam}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Submit
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-12">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Question {currentIdx + 1}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                {currentQuestion.text}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                  className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${answers[currentQuestion.id] === idx ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${answers[currentQuestion.id] === idx ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-white/20'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium">{option}</span>
                  </div>
                  {answers[currentQuestion.id] === idx && (
                    <CheckCircle2 size={24} className="text-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl font-bold disabled:opacity-20 transition-colors"
          >
            <ChevronLeftIcon size={20} />
            Previous
          </button>
          
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentIdx ? 'bg-indigo-500' : answers[questions[i].id] !== undefined ? 'bg-white/40' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
              } else {
                finishExam();
              }
            }}
            className="flex items-center gap-2 px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
          >
            {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </main>

      {/* Strict Mode Overlay */}
      {isStrictMode && isPaused && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <Shield size={64} className="text-indigo-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Strict Mode Active</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              In strict mode, the timer continues even if you pause. This simulates the pressure of a real exam where time never stops.
            </p>
            <button 
              onClick={() => setIsPaused(false)}
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSimulator;
