import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Sparkles, ArrowRight, X, Plus, Zap, Brain, Globe, Music, Microscope } from 'lucide-react';
import { Subject, Note } from '../types';
import { ToastType } from './Toast';
import { authedFetch } from "../lib/authedFetch";

interface KnowledgeAlchemyProps {
  subjects: Subject[];
  onBack: () => void;
  onSaveHybrid: (note: Note) => void;
  addToast: (message: string, type?: ToastType) => void;
}

export const KnowledgeAlchemy: React.FC<KnowledgeAlchemyProps> = ({ subjects, onBack, onSaveHybrid, addToast }) => {
  const [selected, setSelected] = useState<Subject[]>([]);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSelect = (s: Subject) => {
    if (selected.find(item => item.id === s.id)) {
      setSelected(selected.filter(item => item.id !== s.id));
    } else if (selected.length < 2) {
      setSelected([...selected, s]);
    }
  };

  const transmute = async () => {
    if (selected.length !== 2) return;
    setIsTransmuting(true);
    
    try {
      const prompt = `Act as a Knowledge Alchemist. I have two subjects: ${selected[0].name} and ${selected[1].name}. 
      Create a "Hybrid Knowledge Note" that explores the deep intersection of these two fields. 
      Provide:
      1. A catchy hybrid title.
      2. A "Core Synthesis" (one paragraph).
      3. Three "Transmuted Insights" (bullet points).
      4. A "Future Prediction" of how this intersection will evolve.
      Return as JSON.`;

      const response = await authedFetch('/api/gemini/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      setResult(data);
      addToast("Transmutation successful!", "success");
    } catch (error) {
      console.error("Alchemy failed:", error);
      addToast("Alchemy failed. Please try again.", "error");
    } finally {
      setIsTransmuting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-app-bg text-app-text p-6 sm:p-10 overflow-y-auto no-scrollbar relative pt-[calc(2rem+var(--safe-top))] pb-[calc(4rem+var(--safe-bottom))] font-sans">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-app-accent rounded-full blur-[100px] sm:blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500 rounded-full blur-[100px] sm:blur-[150px] animate-pulse delay-1000" />
      </div>

      <AnimatePresence>
        {isTransmuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                  borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-600 blur-2xl opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Beaker className="text-white animate-bounce sm:size-16" size={48} />
              </div>
              
              {/* Floating particles during transmutation */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: (Math.random() - 0.5) * 300,
                    y: (Math.random() - 0.5) * 300,
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                />
              ))}
            </div>
            
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-8 sm:mt-12 text-xl sm:text-2xl font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white"
            >
              Transmuting Knowledge
            </motion.h2>
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-3 sm:mt-4">
              Merging {selected[0]?.name} + {selected[1]?.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative z-10 flex justify-between items-start mb-12 sm:mb-16">
        <div className="max-w-[80%]">
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight uppercase italic flex items-center gap-4 sm:gap-6">
            <Beaker className="text-app-accent shrink-0 sm:size-12" size={32} />
            Knowledge Alchemy
          </h1>
          <p className="text-app-text-muted text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-2 sm:mt-3">
            Transmute subjects into hybrid insights
          </p>
        </div>
        <button onClick={onBack} className="p-3 sm:p-4 rounded-2xl glass hover:bg-app-accent hover:text-white transition-all border border-app-border">
          <X size={24} className="sm:size-8" />
        </button>
      </header>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Selection Area */}
        <div className="space-y-8 sm:space-y-10">
          <div className="p-8 sm:p-10 glass rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-black/5">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-app-accent mb-6 sm:mb-8 flex items-center gap-3">
              <Sparkles className="sm:size-5" size={16} />
              Select Two Subjects
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {subjects.map(s => {
                const isSelected = selected.find(item => item.id === s.id);
                return (
                  <motion.button
                    key={s.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(s)}
                    className={`p-6 sm:p-8 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                      isSelected ? 'border-app-accent bg-app-accent/10' : 'border-app-border bg-app-bg hover:border-app-accent/30'
                    }`}
                  >
                    <div className="font-display font-black text-base sm:text-xl mb-1 sm:mb-2 truncate">{s.name}</div>
                    <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-40">Subject</div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-app-accent shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 py-8 sm:py-16 relative">
            <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed flex items-center justify-center transition-all duration-500 ${selected[0] ? 'border-app-accent bg-app-accent/10 shadow-xl shadow-app-accent/10' : 'border-app-border'}`}>
              {selected[0] ? <Brain className="text-app-accent sm:size-10" size={32} /> : <Plus className="text-app-text-muted sm:size-8" size={24} />}
            </div>
            <div className="h-px w-10 sm:w-16 bg-app-border relative">
              <div className="absolute inset-0 bg-app-accent blur-sm opacity-30" />
            </div>
            <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed flex items-center justify-center transition-all duration-500 ${selected[1] ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/10' : 'border-app-border'}`}>
              {selected[1] ? <Globe className="text-emerald-500 sm:size-10" size={32} /> : <Plus className="text-app-text-muted sm:size-8" size={24} />}
            </div>
          </div>

          <motion.button
            disabled={selected.length !== 2 || isTransmuting}
            onClick={transmute}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] font-display font-black text-xl sm:text-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 sm:gap-6 ${
              selected.length === 2 ? 'bg-app-accent text-white hover:bg-app-accent/90 shadow-2xl shadow-app-accent/30' : 'bg-app-card text-app-text-muted border border-app-border cursor-not-allowed'
            }`}
          >
            {isTransmuting ? (
              <>
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                Transmuting...
              </>
            ) : (
              <>
                Transmute Knowledge
                <Zap size={24} className="sm:size-8" />
              </>
            )}
          </motion.button>
        </div>

        {/* Result Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="p-8 sm:p-12 glass rounded-[3rem] sm:rounded-[4rem] relative overflow-hidden shadow-2xl shadow-black/10"
              >
                <div className="absolute top-0 right-0 p-8 sm:p-12">
                  <Sparkles className="text-app-accent animate-pulse sm:size-16" size={48} />
                </div>

                <div className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] text-app-accent mb-4 sm:mb-6">Transmutation Successful</div>
                <h2 className="text-3xl sm:text-5xl font-display font-black italic tracking-tight mb-8 sm:mb-12 leading-tight">{result.hybridTitle}</h2>
                
                <div className="space-y-8 sm:space-y-12">
                  <div>
                    <h3 className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-app-text-muted mb-3 sm:mb-4">Core Synthesis</h3>
                    <p className="text-lg sm:text-2xl text-app-text leading-relaxed italic font-medium">"{result.coreSynthesis}"</p>
                  </div>

                  <div>
                    <h3 className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-app-text-muted mb-4 sm:mb-6">Transmuted Insights</h3>
                    <ul className="space-y-4 sm:space-y-6">
                      {result.transmutedInsights.map((insight: string, i: number) => (
                        <li key={i} className="flex gap-4 sm:gap-6 items-start group">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-app-accent-soft border border-app-accent/20 flex items-center justify-center text-app-accent text-[10px] sm:text-[12px] font-black mt-1 shrink-0 group-hover:bg-app-accent group-hover:text-white transition-all duration-500">
                            {i + 1}
                          </div>
                          <span className="text-base sm:text-xl text-app-text-muted group-hover:text-app-text transition-colors duration-500 leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 sm:p-8 bg-app-accent-soft border border-app-accent/10 rounded-[2rem] sm:rounded-[2.5rem]">
                    <h3 className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] text-app-accent mb-2 sm:mb-3">Future Prediction</h3>
                    <p className="text-sm sm:text-lg text-app-accent/80 leading-relaxed font-medium">{result.futurePrediction}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const note: Note = {
                      id: Date.now().toString(),
                      subject_id: selected[0].id,
                      title: result.hybridTitle,
                      content: result.coreSynthesis + '\n\n' + result.transmutedInsights.join('\n'),
                      summary: result.coreSynthesis,
                      created_at: new Date().toISOString(),
                      is_favorite: true
                    };
                    onSaveHybrid(note);
                    onBack();
                  }}
                  className="mt-12 sm:mt-16 w-full p-6 sm:p-8 bg-app-text text-app-bg rounded-[2rem] sm:rounded-[2.5rem] font-display font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 text-base sm:text-xl shadow-xl shadow-black/10"
                >
                  Save to Grimoire <ArrowRight size={24} className="sm:size-6" />
                </button>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 sm:p-16 border-2 border-dashed border-app-border rounded-[3rem] sm:rounded-[4rem] bg-app-card/30">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-[2.5rem] sm:rounded-[3rem] bg-app-bg flex items-center justify-center mb-6 sm:mb-8 shadow-inner">
                  <Beaker className="text-app-text-muted/20 sm:size-14" size={40} />
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-black text-app-text-muted mb-2 sm:mb-4">Awaiting Transmutation</h3>
                <p className="text-app-text-muted/40 text-sm sm:text-lg max-w-sm font-medium">Select two subjects and initiate the alchemy process to reveal hidden connections.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
