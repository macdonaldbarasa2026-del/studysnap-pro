import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, ChevronRight, Minimize2, Send, Sparkles, X } from 'lucide-react';
import type { UserProfile, View, Note, Subject } from '../types';
import { sendGeminiChatMessage } from '../services/gemini';

interface StudySnapAIQuickAssistProps {
  view: View;
  userProfile: UserProfile | null;
  selectedNote?: Note | null;
  selectedSubject?: Subject | null;
  onOpenFullAI: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const QUICK_PROMPTS: Partial<Record<View, string[]>> = {
  home: ['Plan my next study step', 'What should I review today?', 'Explain how StudySnap can help me'],
  subject: ['Make a study plan for this subject', 'What should I master first?', 'Create practice questions'],
  note: ['Explain this note more simply', 'Turn this note into flashcards', 'Find the key ideas and gaps'],
  flashcards: ['Quiz me on these cards', 'Explain the hardest card', 'Make a quick revision plan'],
  quiz: ['Explain my mistake', 'Give me a similar question', 'Help me improve this topic'],
  search: ['Help me search more precisely', 'What should I look for?', 'Turn this into a research question'],
  research: ['Build a deeper research plan', 'Compare the evidence', 'Find gaps in this research'],
  'research-hub': ['Create a multi-angle research plan', 'What evidence is missing?', 'Compare possible explanations'],
  videos: ['What should I watch first?', 'Turn this topic into a lesson', 'Give me questions for this video'],
  'file-studio': ['Summarize my document', 'Turn this into study notes', 'Make presentation talking points'],
  'studyroom': ['Organize our study session', 'Create a group quiz', 'Summarize the discussion'],
  'revision-engine': ['What should I revise next?', 'Make a 20-minute revision session', 'Explain my weakest area'],
  'exam-simulator': ['Coach me on this topic', 'Give me a harder practice question', 'Explain where I lost marks'],
  'doubt-solver': ['Explain this step-by-step', 'Give me a simpler example', 'Show me how to verify the answer'],
  'teacher-insights': ['Summarize learner trends', 'Suggest intervention ideas', 'Create a lesson adjustment plan'],
  'institution-portal': ['Summarize the most important actions', 'Find operational risks', 'Draft a clear next-step plan'],
  campus: ['Help me find the right study path', 'Summarize this course context', 'Create a research direction'],
};

function getFallbackPrompts(view: View): string[] {
  if (['scanner', 'auto-note-builder', 'handwriting-converter'].includes(view)) {
    return ['Turn this material into clear notes', 'Find the important concepts', 'Create study questions'];
  }
  return ['Explain this more clearly', 'Help me take the next step', 'Create a study plan'];
}

function contextLabel(view: View, note?: Note | null, subject?: Subject | null): string {
  if (note?.title) return `Working with “${note.title}”`;
  if (subject?.name) return `Working in ${subject.name}`;
  const labels: Partial<Record<View, string>> = {
    'research-hub': 'Research workspace',
    research: 'Research workspace',
    search: 'Search workspace',
    'file-studio': 'Document workspace',
    videos: 'Video learning workspace',
    quiz: 'Quiz workspace',
    flashcards: 'Flashcards workspace',
  };
  return labels[view] || 'Current StudySnap workspace';
}

export const StudySnapAIQuickAssist: React.FC<StudySnapAIQuickAssistProps> = ({
  view,
  userProfile,
  selectedNote,
  selectedSubject,
  onOpenFullAI,
  addToast,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const prompts = useMemo(
    () => QUICK_PROMPTS[view] ?? getFallbackPrompts(view),
    [view]
  );

  const context = useMemo(() => {
    const chunks = [contextLabel(view, selectedNote, selectedSubject)];
    if (selectedNote) {
      chunks.push(`Note content: ${selectedNote.content.slice(0, 5000)}`);
      if (selectedNote.summary) chunks.push(`Note summary: ${selectedNote.summary.slice(0, 2000)}`);
    }
    if (selectedSubject) chunks.push(`Subject: ${selectedSubject.name}`);
    return chunks.join('\n');
  }, [view, selectedNote, selectedSubject]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setInput('');
    setLoading(true);
    setOpen(true);
    try {
      const result = await sendGeminiChatMessage({
        message: trimmed,
        model: 'fast',
        role: 'contextual-study-assistant',
        userProfile,
        systemInstruction: [
          'You are StudySnap AI, the contextual assistant inside StudySnap.',
          'Use the current workspace context to answer directly and help the user complete the task.',
          'Do not invent information that is absent from the supplied context.',
          'Keep the answer concise by default; offer deeper detail when the user asks.',
          'For learning tasks, teach reasoning instead of only producing the final answer.',
          context,
        ].join('\n'),
      });
      setAnswer(result.text || 'I could not generate a useful answer right now.');
    } catch (error: any) {
      addToast(error?.message || 'StudySnap AI could not respond.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFullAI = view === 'studysnap-ai';
  const isQuietView = ['home', 'search', 'settings', 'login'].includes(view);
  // These views already expose a clear primary action, so a second floating
  // assistant only competes for thumb space on phones.
  if (isFullAI || isQuietView || !userProfile) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.97 }}
        className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] sm:bottom-6 z-[60] flex items-center gap-2 rounded-full bg-app-accent px-4 py-3 text-white shadow-xl shadow-black/10 border border-white/15"
        aria-expanded={open}
        aria-controls="studysnap-ai-quick-assist"
      >
        <Sparkles size={17} />
        <span className="hidden sm:inline text-xs font-black tracking-wide">Ask StudySnap AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id="studysnap-ai-quick-assist"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed z-[61] right-3 left-3 sm:left-auto bottom-[calc(9.25rem+env(safe-area-inset-bottom))] sm:bottom-20 sm:w-[380px] max-h-[min(70vh,620px)] overflow-hidden rounded-3xl border border-app-border bg-app-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-app-border">
              <div className="min-w-0 flex items-center gap-3">
                <div className="size-9 rounded-2xl bg-app-accent/10 text-app-accent flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-app-text truncate">StudySnap AI</p>
                  <p className="text-[11px] text-app-text-muted truncate">{contextLabel(view, selectedNote, selectedSubject)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={onOpenFullAI} className="p-2 rounded-xl hover:bg-app-bg text-app-text-muted" title="Open full StudySnap AI">
                  <Minimize2 size={16} />
                </button>
                <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-app-bg text-app-text-muted" title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(min(70vh,620px)-58px)]">
              {answer && (
                <div className="rounded-2xl bg-app-bg border border-app-border p-3 text-sm leading-6 text-app-text whitespace-pre-wrap">
                  {answer}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {prompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={loading}
                    onClick={() => ask(prompt)}
                    className="rounded-full border border-app-border bg-app-bg px-3 py-2 text-[11px] font-bold text-app-text hover:border-app-accent/40 disabled:opacity-50"
                  >
                    {prompt}
                    <ChevronRight size={12} className="inline ml-1" />
                  </button>
                ))}
              </div>

              <form onSubmit={e => { e.preventDefault(); void ask(input); }} className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-bg p-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about what you're doing…"
                  className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm text-app-text outline-none"
                  disabled={loading}
                />
                <button type="submit" disabled={!input.trim() || loading} className="size-10 rounded-xl bg-app-accent text-white flex items-center justify-center disabled:opacity-40" title="Ask StudySnap AI">
                  {loading ? <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                </button>
              </form>

              <button type="button" onClick={onOpenFullAI} className="w-full rounded-2xl border border-app-accent/20 bg-app-accent/5 px-4 py-3 text-left text-xs font-black text-app-accent hover:bg-app-accent/10">
                Open full StudySnap AI workspace
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
