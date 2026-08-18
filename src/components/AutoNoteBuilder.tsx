import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, 
  ChevronLeft, 
  Sparkles, 
  Type, 
  Layout, 
  List, 
  Heading, 
  CheckCircle2, 
  Zap, 
  Save, 
  Copy, 
  Download, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authedFetch } from "../lib/authedFetch";

interface AutoNoteBuilderProps {
  onBack: () => void;
  onSave: (note: { title: string; content: string; summary: string }) => void;
}

export const AutoNoteBuilder: React.FC<AutoNoteBuilderProps> = ({ onBack, onSave }) => {
  const [inputContent, setInputContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<{ title: string; content: string; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputContent.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Convert the following raw content into structured, exam-ready notes. 
        Include a clear title, a brief summary, and well-organized content with headings and bullet points.
        Format the response as JSON with keys: title, summary, content.
        
        Raw Content: ${inputContent}`;
      
      const response = await authedFetch('/api/gemini/generate-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) throw new Error('API failed');
      const result = await response.json();
      if (result.title && result.content && result.summary) {
        setGeneratedNote(result);
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError("Failed to generate notes. Please check your internet connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Auto Note Builder</h1>
            <p className="text-xs text-slate-500">AI-powered structured note generation</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type size={16} />
                  Raw Content
                </h2>
                <span className="text-[10px] font-bold text-slate-400">{inputContent.length} characters</span>
              </div>
              <textarea 
                placeholder="Paste your raw text, lecture transcripts, or scanned content here..."
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                className="flex-1 w-full bg-slate-50 rounded-2xl p-6 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium leading-relaxed"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !inputContent.trim()}
                className="mt-6 w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-100"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Building Notes...
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    Generate Structured Notes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {generatedNote ? (
                <motion.div 
                  key="output"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Generated Result
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => generatedNote && navigator.clipboard?.writeText(generatedNote.content)} aria-label="Copy generated note" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                        <Copy size={18} />
                      </button>
                      <button onClick={() => { if (!generatedNote) return; const blob = new Blob([generatedNote.content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'study-note.txt'; a.click(); URL.revokeObjectURL(url); }} aria-label="Download generated note" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">{generatedNote.title}</h1>
                    
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 mb-8">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Summary</h3>
                      <p className="text-indigo-900 font-medium leading-relaxed">{generatedNote.summary}</p>
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                        {generatedNote.content}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSave(generatedNote)}
                    className="mt-8 w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                  >
                    <Save size={24} />
                    Save to My Notes
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                    <Layout size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to Structure</h3>
                  <p className="text-slate-400 max-w-xs">
                    Paste your content on the left and I'll transform it into clean, exam-ready notes.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm"
              >
                <AlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AutoNoteBuilder;
