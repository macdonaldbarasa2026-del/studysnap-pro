import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ChevronLeft, 
  Zap, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Lightbulb,
  Activity,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { getStudyInsights } from '../services/gemini';
import { playAiVoice, stopAiVoice } from '../lib/speech';

interface AIStudyTwinProps {
  userName: string;
  onBack: () => void;
}

interface Prediction {
  id: string;
  topic: string;
  risk: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

export const AIStudyTwin: React.FC<AIStudyTwinProps> = ({ userName, onBack }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [efficiencyGain, setEfficiencyGain] = useState<number | null>(null);
  const [isTwinSpeaking, setIsTwinSpeaking] = useState(false);
  const [optimizationApplied, setOptimizationApplied] = useState(() => localStorage.getItem('studysnap-twin-optimized') === 'true');

  useEffect(() => {
    const fetchInsights = async () => {
      const activities = JSON.parse(localStorage.getItem('studysnap-activities') || '[]');
      const history = activities.slice(-50).map((a:any) => ({ topic: a.metadata?.topic || a.type, duration: a.duration || 0, mistakes: a.accuracy == null ? 0 : Math.max(0, 100 - Number(a.accuracy)) }));
      const data = history.length ? await getStudyInsights(userName, history) : null;
      if (data) {
        setPredictions(data.insights.map((ins: any, idx: number) => ({
          id: idx.toString(),
          ...ins
        })));
        setFocusScore(data.focusScore);
        setEfficiencyGain(data.efficiencyGain);
      }
      setIsAnalyzing(false);
    };

    fetchInsights();

    return () => {
      stopAiVoice();
    };
  }, [userName]);

  const applyOptimization = () => { localStorage.setItem('studysnap-twin-optimized', 'true'); localStorage.setItem('studysnap-twin-plan', JSON.stringify(predictions.map(p => p.suggestion))); setOptimizationApplied(true); };

  const handleToggleVoiceBriefing = () => {
    if (isTwinSpeaking) {
      stopAiVoice();
      setIsTwinSpeaking(false);
      return;
    }

    const briefingSummary = `Hello ${userName}. I have analyzed your recent study sessions. Your current efficiency insight is ${efficiencyGain ?? 'not available'} percent with a focus score of ${focusScore ?? 'not available'} out of 100. Key areas to focus on: ${predictions.map(p => `${p.topic}, ${p.message}`).join('. ')}. My top advice is to use visual mnemonics and review your mistakes before sleeping. Let's make today productive!`;

    setIsTwinSpeaking(true);
    playAiVoice(
      briefingSummary,
      'Aoede',
      () => setIsTwinSpeaking(true),
      () => setIsTwinSpeaking(false)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Study Twin</h1>
            <p className="text-xs text-slate-500">Your digital learning behavior model</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
          <Activity size={14} className="animate-pulse" />
          Live Syncing
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {isAnalyzing ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200"
            >
              <Brain size={48} />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Learning DNA</h2>
            <p className="text-slate-500">Processing study patterns, mistake history, and focus trends...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Hello, {userName}'s Twin</h2>
                <p className="text-indigo-100 text-lg mb-8 max-w-md">
                  I've analyzed your last 10 study sessions. I'm ready to help you avoid mistakes before they happen.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-2xl font-bold">+{efficiencyGain}%</p>
                  </div>
                  <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Focus Score</p>
                    <p className="text-2xl font-bold">{focusScore}/100</p>
                  </div>
                  <button
                    onClick={handleToggleVoiceBriefing}
                    className={`px-6 py-3.5 rounded-2xl border font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg ${
                      isTwinSpeaking
                        ? 'bg-amber-400 text-slate-900 border-amber-300 animate-pulse shadow-amber-400/30'
                        : 'bg-white text-indigo-600 border-white hover:bg-indigo-50 shadow-black/10'
                    }`}
                  >
                    {isTwinSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    {isTwinSpeaking ? 'Stop Twin Voice' : 'Listen to Twin Voice'}
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <Brain className="absolute -right-8 -bottom-8 text-white/10" size={240} />
            </motion.div>

            {/* Predictions Section */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Target size={16} />
                Mistake Predictions
              </h2>
              <div className="space-y-4">
                {predictions.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex gap-6 items-start group hover:border-indigo-200 transition-all"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      p.risk === 'high' ? 'bg-rose-50 text-rose-600' : 
                      p.risk === 'medium' ? 'bg-amber-50 text-amber-600' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {p.risk === 'high' ? <AlertTriangle size={28} /> : <TrendingUp size={28} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{p.topic}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          p.risk === 'high' ? 'bg-rose-100 text-rose-600' : 
                          p.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {p.risk} Risk
                        </span>
                      </div>
                      <p className="text-slate-500 mb-4">{p.message}</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <Lightbulb className="text-amber-500 flex-shrink-0" size={18} />
                        <p className="text-sm text-slate-600 font-medium">{p.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Learning Behavior Insights */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-indigo-600" />
                  Peak Performance Time
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Morning (8AM - 11AM)</span>
                    <span className="font-bold text-emerald-600">{focusScore == null ? 'No data' : `${focusScore}% Focus`}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${focusScore == null ? 0 : focusScore}%` }} />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Evening (7PM - 10PM)</span>
                    <span className="font-bold text-amber-600">64% Accuracy</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[64%]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  Twin's Strategy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-2xl text-indigo-700">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold">Use Visual Mnemonics for Bio</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold">Switch to Pomodoro 50/10</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl text-amber-700">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold">Review Mistakes Before Sleep</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Button */}
            <button onClick={applyOptimization} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
              {optimizationApplied ? 'Optimization Applied ✓' : "Apply Twin's Optimization"}
              <Zap size={20} className="fill-current" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIStudyTwin;
