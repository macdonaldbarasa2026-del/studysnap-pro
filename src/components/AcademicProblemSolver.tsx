import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Brain, 
  Zap, 
  Target, 
  ArrowLeft, 
  ChevronRight, 
  BookOpen, 
  Gamepad2, 
  FileText, 
  Layers,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { UserProfile, LearningProblem } from '../types';
import { solveAcademicProblem } from '../services/gemini';
import { playAiVoice, stopAiVoice } from '../lib/speech';
import Markdown from 'react-markdown';

interface AcademicProblemSolverProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const AcademicProblemSolver: React.FC<AcademicProblemSolverProps> = ({ userProfile, onBack }) => {
  const [problems, setProblems] = useState<LearningProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<LearningProblem | null>(null);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isSpeakingSolution, setIsSpeakingSolution] = useState(false);

  useEffect(() => {
    return () => {
      stopAiVoice();
    };
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`/api/problems/${encodeURIComponent(userProfile.user_name)}`);
        if (!res.ok) throw new Error('Problem service unavailable');
        const data = await res.json();
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [userProfile.user_name]);

  const handleAiSolve = async () => {
    if (!selectedProblem) return;
    setIsSolving(true);
    setAiSolution(null);
    stopAiVoice();
    setIsSpeakingSolution(false);
    const solution = await solveAcademicProblem(`Explain the concept of ${selectedProblem.topic} and provide a step-by-step guide to mastering it.`);
    setAiSolution(solution);
    setIsSolving(false);

    if (solution) {
      setIsSpeakingSolution(true);
      playAiVoice(
        solution,
        'Zephyr',
        () => setIsSpeakingSolution(true),
        () => setIsSpeakingSolution(false)
      );
    }
  };

  const handleToggleSpeak = () => {
    if (!aiSolution) return;
    if (isSpeakingSolution) {
      stopAiVoice();
      setIsSpeakingSolution(false);
    } else {
      setIsSpeakingSolution(true);
      playAiVoice(
        aiSolution,
        'Zephyr',
        () => setIsSpeakingSolution(true),
        () => setIsSpeakingSolution(false)
      );
    }
  };

  const getProblemIcon = (type: string) => {
    switch (type) {
      case 'weak_understanding': return <Brain className="text-amber-500" size={24} />;
      case 'slow_reaction': return <Zap className="text-emerald-500" size={24} />;
      case 'poor_performance': return <Target className="text-rose-500" size={24} />;
      default: return <AlertCircle className="text-indigo-500" size={24} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSupportTools = (problem: LearningProblem) => {
    const tools = [
      { id: 'notes', label: 'Recommended Notes', icon: <BookOpen size={18} />, color: 'bg-blue-500' },
      { id: 'quiz', label: 'Targeted Quiz', icon: <Target size={18} />, color: 'bg-indigo-500' },
      { id: 'game', label: 'Mind Training', icon: <Gamepad2 size={18} />, color: 'bg-emerald-500' },
      { id: 'flashcards', label: 'Flashcards', icon: <Layers size={18} />, color: 'bg-purple-500' }
    ];

    if (problem.problem_type === 'slow_reaction') {
      return tools.filter(t => ['game', 'quiz'].includes(t.id));
    }
    if (problem.problem_type === 'weak_understanding') {
      return tools.filter(t => ['notes', 'flashcards', 'quiz'].includes(t.id));
    }
    return tools;
  };

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-app-text">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-black text-app-text">Academic Problem Solver</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-4">
          <div className="p-6 rounded-[32px] bg-indigo-600 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={24} />
                <h2 className="text-xl font-bold">Automatic Detection</h2>
              </div>
              <p className="text-indigo-100 mb-6">
                Our AI analyzes your quiz mistakes, game speed, and study patterns to find exactly where you need help.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">{problems.length} issues detected</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <h3 className="text-xl font-black text-app-text mt-8 mb-4">Detected Problems</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-3xl bg-app-card animate-pulse" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 rounded-[40px] bg-app-card border border-app-border text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-app-text">All Clear!</h4>
              <p className="text-app-text-muted">No learning difficulties detected. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map(problem => (
                <motion.div
                  key={problem.id}
                  layoutId={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className={`p-6 rounded-[32px] bg-app-card border border-app-border cursor-pointer transition-all hover:shadow-md ${selectedProblem?.id === problem.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-app-bg">
                        {getProblemIcon(problem.problem_type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-app-text">{problem.topic}</h4>
                        <p className="text-sm text-app-text-muted">
                          {problem.problem_type.replace('_', ' ').charAt(0).toUpperCase() + problem.problem_type.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(problem.severity)}`}>
                      {problem.severity}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-[32px] bg-app-card border border-app-border">
            <h3 className="text-lg font-black text-app-text mb-4">Support Actions</h3>
            <AnimatePresence mode="wait">
              {selectedProblem ? (
                <motion.div
                  key={selectedProblem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-app-text-muted mb-4">
                    We've activated these tools to help you with <span className="font-bold text-app-text">{selectedProblem.topic}</span>:
                  </p>
                  {getSupportTools(selectedProblem).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (tool.id === 'quiz') window.dispatchEvent(new CustomEvent('studysnap:start-quiz', { detail: selectedProblem }));
                        else if (tool.id === 'flashcards') window.dispatchEvent(new CustomEvent('studysnap:start-flashcards', { detail: selectedProblem }));
                        else if (tool.id === 'notes') handleAiSolve();
                      }}
                      className="w-full p-4 rounded-2xl bg-app-bg border border-app-border flex items-center justify-between group hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tool.color} text-white`}>
                          {tool.icon}
                        </div>
                        <span className="font-bold text-app-text text-sm">{tool.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-app-text-muted group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}

                  <button
                    onClick={handleAiSolve}
                    disabled={isSolving}
                    className="w-full p-4 mt-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {isSolving ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isSolving ? 'AI Reasoning...' : 'AI Deep Solve'}
                  </button>

                  {aiSolution && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                          <Brain size={18} />
                          AI Reasoning Output
                        </h4>
                        <button
                          onClick={handleToggleSpeak}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isSpeakingSolution
                              ? 'bg-indigo-600 text-white animate-pulse shadow-indigo-300'
                              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {isSpeakingSolution ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {isSpeakingSolution ? 'Stop Voice' : 'Hear Voice'}
                        </button>
                      </div>
                      <div className="prose prose-sm text-indigo-800 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <Markdown>{aiSolution}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-app-text-muted mb-3" size={32} />
                  <p className="text-sm text-app-text-muted">Select a problem to see recommended support tools.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 rounded-[32px] bg-app-card border border-app-border">
            <h3 className="text-lg font-black text-app-text mb-4">Activity Suggestions</h3>
            <div className="space-y-3">
              {[
                { label: 'Practice Quiz Session', icon: <Target size={18} />, color: 'text-indigo-500' },
                { label: 'Group Study Room', icon: <BookOpen size={18} />, color: 'text-emerald-500' },
                { label: 'Mind Game Logic', icon: <Zap size={18} />, color: 'text-amber-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-app-bg transition-colors cursor-pointer">
                  <div className={item.color}>{item.icon}</div>
                  <span className="text-sm font-bold text-app-text">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicProblemSolver;
