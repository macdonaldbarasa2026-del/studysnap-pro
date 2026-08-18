import React, { useState } from 'react';
import { 
  ChevronLeft, BookOpen, Star, ArrowRight, Clock, Palette, 
  FileText, CheckCircle2, Share2, Camera as CameraIcon, 
  Sparkles, Send, Baby, Users, Volume2, Lock as LockIcon,
  Mail, Phone, MessageCircle, Bot, Loader2, HelpCircle, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Note, Subject, AgeGroup, UserProfile } from '../../types';
import { DataService } from '../../services/dataService';
import { downloadPdf } from '../../utils/pdfExport';

interface HelpViewProps { setView: (view: any) => void; }
export const HelpView: React.FC<HelpViewProps> = ({ setView }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I am your StudySnap Help AI Assistant. Ask me anything about using the app, study features, flashcards, or troubleshooting, and I'll guide you step-by-step!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "How to scan notes?",
    "How do flashcards work?",
    "How to use Live Voice AI?",
    "How to export to PDF?"
  ];

  const handleAskHelp = async (question: string) => {
    const q = question.trim();
    if (!q || isLoading) return;

    const userMsg = { role: 'user' as const, text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `User asking for help with StudySnap: "${q}". Provide a clear, friendly, and structured step-by-step answer explaining how to accomplish this in StudySnap.`,
          systemInstruction: "You are the official StudySnap AI Help Desk & Support Assistant. You provide friendly, instant, step-by-step guidance on using StudySnap features (notes scanner, AI study twin, live voice tutor, doubt solver, flashcards, quizzes, PDF export, themes, offline mode, etc.). Keep answers concise, direct, helpful, and formatted with bullet points where appropriate. If asked who created you or StudySnap, do not invent or guess ownership. State that the verified product information available to you does not include a creator claim."
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.text || "I'm here to help! You can ask about scanning notes, generating quizzes, using Voice AI, or managing your study schedule.";
        setMessages(prev => [...prev, { role: 'assistant', text: replyText }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: "To get started with StudySnap, tap the '+' button to scan notes, open any subject to review summaries and flashcards, or use the Live Voice AI tab to practice speaking with your AI study twin." 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "You can tap '+' to scan your notes, use the Practice tab for quizzes and flashcards, or reach out to our team below via Email, Phone Call, or WhatsApp!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text rounded-2xl hover:bg-app-accent/10 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-app-text">Help Desk & Support</h1>
          <p className="text-xs sm:text-sm text-app-text-muted">Instant AI assistance and direct creator support</p>
        </div>
      </div>

      {/* 3. Help AI Assistant */}
      <section className="mb-8">
        <div className="rounded-3xl bg-app-card border border-app-border overflow-hidden shadow-xl shadow-black/5">
          <div className="p-4 sm:p-5 bg-app-accent/10 border-b border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-app-accent flex items-center justify-center text-white shadow-md shadow-app-accent/30">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="font-bold text-app-text text-sm sm:text-base flex items-center gap-2">
                  Help AI Assistant
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-black uppercase tracking-wider">Online</span>
                </h2>
                <p className="text-xs text-app-text-muted">Ask any question to get instant step-by-step guidance</p>
              </div>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto bg-app-bg/50">
            {messages.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-app-accent text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-app-accent text-white rounded-br-none shadow-md shadow-app-accent/20' 
                      : 'bg-app-card border border-app-border text-app-text rounded-bl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-app-text-muted text-xs">
                <div className="w-8 h-8 rounded-xl bg-app-accent/20 text-app-accent flex items-center justify-center shrink-0">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <span>Help AI is typing an answer...</span>
              </motion.div>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="p-3 bg-app-card border-t border-app-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar" data-horizontal-scroller="carousel">
            <span className="text-[11px] font-bold text-app-text-muted whitespace-nowrap pl-1">Suggested:</span>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAskHelp(q)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-app-bg border border-app-border text-xs font-semibold text-app-text hover:border-app-accent/50 hover:bg-app-accent/5 whitespace-nowrap transition-all shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-app-card border-t border-app-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleAskHelp(inputText); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your question or issue here..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-app-bg border border-app-border text-sm text-app-text placeholder:text-app-text-muted/60 focus:outline-none focus:border-app-accent transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-5 py-3 rounded-2xl bg-app-accent text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-app-accent/90 transition-all shadow-md shadow-app-accent/20 shrink-0"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Direct Contact & Support (Email & Contact with Phone / WhatsApp) */}
      <section className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-app-text-muted mb-4 flex items-center gap-2">
          <HelpCircle size={15} className="text-app-accent" />
          Direct Support & Inquiries
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Email As Action */}
          <a 
            href="mailto:simiyumacdonald1@gmail.com?subject=StudySnap%20Support%20Inquiry"
            className="p-5 rounded-3xl bg-app-card border border-app-border hover:border-app-accent/60 hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600">Email</span>
            </div>
            <div>
              <h3 className="font-bold text-app-text text-base mb-1">Email Support</h3>
              <p className="text-xs text-app-text-muted leading-relaxed">Send an email message directly to our support team</p>
            </div>
            <div className="mt-4 pt-3 border-t border-app-border flex items-center text-xs font-bold text-indigo-600">
              <span>Send Email</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 2. Contact Option 1: Phone Call */}
          <a 
            href="tel:+254748322641"
            className="p-5 rounded-3xl bg-app-card border border-app-border hover:border-blue-500/60 hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">Option 1</span>
            </div>
            <div>
              <h3 className="font-bold text-app-text text-base mb-1">Phone Call</h3>
              <p className="text-xs text-app-text-muted leading-relaxed">Speak directly with our support team via voice call</p>
            </div>
            <div className="mt-4 pt-3 border-t border-app-border flex items-center text-xs font-bold text-blue-600">
              <span>Start Call</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 2. Contact Option 2: WhatsApp Message */}
          <a 
            href="https://wa.me/254748322641?text=Hello%20StudySnap%20Support%2C%20I%20need%20help%20with%20the%20app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl bg-app-card border border-app-border hover:border-emerald-500/60 hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">Option 2</span>
            </div>
            <div>
              <h3 className="font-bold text-app-text text-base mb-1">WhatsApp Message</h3>
              <p className="text-xs text-app-text-muted leading-relaxed">Send a quick message to our team on WhatsApp</p>
            </div>
            <div className="mt-4 pt-3 border-t border-app-border flex items-center text-xs font-bold text-emerald-600">
              <span>Open WhatsApp</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-app-text-muted mb-4 flex items-center gap-2">
          <BookOpen size={15} className="text-app-accent" />
          Common Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { q: "How to scan notes?", a: "Tap the '+' button and select 'Camera' or 'Upload' to scan physical study notes with instant OCR." },
            { q: "Generating flashcards", a: "Once any note is added or scanned, AI automatically produces interactive active-recall flashcards." },
            { q: "Taking quizzes", a: "Open any note or subject and tap the quiz icon to test yourself with dynamic AI questions." },
            { q: "Changing themes", a: "Go to Settings or tap the palette icon on the home screen to customize your color workspace." }
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-3xl bg-app-card border border-app-border">
              <h3 className="font-bold text-app-text mb-1.5 text-sm">{item.q}</h3>
              <p className="text-app-text-muted text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


interface PoliciesViewProps { setView: (view: any) => void; }
export const PoliciesView: React.FC<PoliciesViewProps> = ({ setView }) => (
  <div className="p-4 sm:p-6 pb-32 max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text rounded-2xl hover:bg-app-accent/10 transition-colors" aria-label="Back to home">
        <ChevronLeft size={28} />
      </button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-app-text">StudySnap Policies</h1>
        <p className="text-xs sm:text-sm text-app-text-muted">Privacy, safety, content, and responsible-use guidance.</p>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { title: 'Privacy', body: 'StudySnap should collect only the information needed to provide its learning, account, synchronization, and safety features. Sensitive account data should be protected and never exposed through the client UI.' },
        { title: 'Safety', body: 'Age and role restrictions are part of the product architecture. Restricted features should remain unavailable even when a user manually changes the visible mode in the browser.' },
        { title: 'Content & Copyright', body: 'StudySnap branding applies to StudySnap-created interfaces and exports. Third-party media, creators, trademarks, and required service attribution remain owned by their respective rights holders.' },
        { title: 'AI Use', body: 'AI output is assistance, not a guaranteed source of truth. Users should verify important academic, legal, medical, or other high-impact information with trusted sources.' },
        { title: 'Community', body: 'Users should not upload, share, or distribute unlawful, harmful, private, or infringing material. Abuse, impersonation, harassment, and attempts to bypass access controls are not supported.' },
        { title: 'Account & Access', body: 'Privileged roles should be provisioned through trusted administrative workflows. Client-side profile edits must never be treated as authorization for restricted capabilities.' },
      ].map(policy => (
        <section key={policy.title} className="p-5 sm:p-6 rounded-3xl bg-app-card border border-app-border shadow-sm">
          <h2 className="font-black text-app-text text-base mb-2">{policy.title}</h2>
          <p className="text-sm leading-6 text-app-text-muted">{policy.body}</p>
        </section>
      ))}
    </div>

    <div className="mt-6 p-4 rounded-2xl bg-app-accent/5 border border-app-accent/15 text-xs text-app-text-muted leading-5">
      These in-app policy summaries are product guidance, not a substitute for jurisdiction-specific legal advice. The deployed legal documents and consent flows should be reviewed before public release.
    </div>
  </div>
);

interface AboutViewProps { setView: (view: any) => void; }
export const AboutView: React.FC<AboutViewProps> = ({ setView }) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">About</h1>
    </div>
    <div className="text-center py-12">
      <div className="w-24 h-24 rounded-[32px] bg-app-accent flex items-center justify-center text-black mx-auto mb-6 shadow-xl shadow-app-accent/20">
        <BookOpen size={48} />
      </div>
      <h2 className="text-2xl font-bold text-app-text">StudySnap</h2>
      <p className="text-app-text-muted mb-8">Version 2.0.0</p>
      <div className="p-6 rounded-3xl bg-app-card border border-app-border text-left">
        <p className="text-app-text-muted text-sm leading-relaxed mb-6">
          StudySnap is an AI-powered study companion designed to help students learn faster and more effectively. 
          By combining OCR, AI summarization, and interactive learning tools, we make studying more engaging.
        </p>
        <div className="pt-6 border-t border-app-border space-y-4">
          <div>
            <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] mb-1">App Creator</p>
            <p className="text-app-text font-bold text-lg">StudySnap</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] mb-1">Company</p>
            <p className="text-app-text font-bold text-base">StudySnap Learning Platform</p>
            <p className="text-app-text-muted text-xs leading-relaxed mt-1">A focused learning product built to make studying simpler, safer, and more accessible across devices.</p>
          </div>
          <div className="pt-4 border-t border-app-border/50">
            <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] mb-2">Direct Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a 
                href="mailto:simiyumacdonald1@gmail.com?subject=StudySnap%20Inquiry" 
                className="flex items-center gap-2 p-2.5 rounded-xl bg-app-bg border border-app-border hover:border-app-accent/50 text-xs font-bold text-app-text transition-colors"
              >
                <Mail size={14} className="text-indigo-500 shrink-0" />
                <span>Email Us</span>
              </a>
              <a 
                href="tel:+254748322641" 
                className="flex items-center gap-2 p-2.5 rounded-xl bg-app-bg border border-app-border hover:border-blue-500/50 text-xs font-bold text-app-text transition-colors"
              >
                <Phone size={14} className="text-blue-500 shrink-0" />
                <span>Phone Call</span>
              </a>
              <a 
                href="https://wa.me/254748322641?text=Hello%20StudySnap" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 p-2.5 rounded-xl bg-app-bg border border-app-border hover:border-emerald-500/50 text-xs font-bold text-app-text transition-colors"
              >
                <MessageCircle size={14} className="text-emerald-500 shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface FavoritesViewProps { 
  setView: (view: any) => void; 
  favoriteNotes: Note[];
  setSelectedNote: (note: Note) => void;
}
export const FavoritesView: React.FC<FavoritesViewProps> = ({ setView, favoriteNotes, setSelectedNote }) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">Favorites</h1>
    </div>
    {favoriteNotes.length === 0 ? (
      <div className="text-center py-20 text-app-text-muted">
        <Star size={48} className="mx-auto mb-4 opacity-20" />
        <p>No favorite notes yet.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {favoriteNotes.map(note => (
          <motion.button
            key={note.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedNote(note);
              setView('note');
            }}
            className="w-full p-5 rounded-3xl bg-app-card shadow-sm border border-app-border flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star size={24} fill="currentColor" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-app-text truncate">{note.title}</h3>
                {note.is_locked && <LockIcon size={14} className="text-rose-500 shrink-0" />}
              </div>
              <p className="text-app-text-muted text-sm truncate">{new Date(note.created_at).toLocaleDateString()}</p>
            </div>
            <ArrowRight size={20} className="text-app-text-muted" />
          </motion.button>
        ))}
      </div>
    )}
  </div>
);

interface RecentNotesViewProps { 
  setView: (view: any) => void; 
  recentNotes: Note[];
  setSelectedNote: (note: Note) => void;
}
export const RecentNotesView: React.FC<RecentNotesViewProps> = ({ setView, recentNotes, setSelectedNote }) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">Recent Notes</h1>
    </div>
    <div className="space-y-4">
      {recentNotes.map(note => (
        <motion.button
          key={note.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedNote(note);
            setView('note');
          }}
          className="w-full p-5 rounded-3xl bg-app-card shadow-sm border border-app-border flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-app-bg flex items-center justify-center text-app-text-muted">
            <Clock size={24} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-app-text truncate">{note.title}</h3>
              {note.is_locked && <LockIcon size={14} className="text-rose-500 shrink-0" />}
            </div>
            <p className="text-app-text-muted text-sm truncate">{new Date(note.created_at).toLocaleDateString()}</p>
          </div>
          <ArrowRight size={20} className="text-app-text-muted" />
        </motion.button>
      ))}
    </div>
  </div>
);

interface OfflineViewProps { 
  setView: (view: any) => void; 
  subjects: Subject[];
}
export const OfflineView: React.FC<OfflineViewProps> = ({ setView, subjects }) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">Offline Library</h1>
    </div>
    <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100 text-amber-800 text-sm mb-6">
      All your notes are automatically saved locally for offline access.
    </div>
    <div className="space-y-4">
      {subjects.map(sub => (
        <div key={sub.id} className="p-4 rounded-2xl bg-app-card border border-app-border flex items-center justify-between">
          <span className="font-bold text-app-text">{sub.name}</span>
          <span className="text-xs text-emerald-600 font-bold uppercase">Downloaded</span>
        </div>
      ))}
    </div>
  </div>
);

interface StatisticsViewProps { setView: (view: any) => void; }
export const StatisticsView: React.FC<StatisticsViewProps> = ({ setView }) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">Statistics</h1>
    </div>
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-app-card border border-app-border">
        <h3 className="font-bold text-app-text mb-4">Study Time (Weekly)</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {Array.from({length: 7}, (_, i) => Number(localStorage.getItem(`studysnap-day-${i}`) || 0)).map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg relative group">
              <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-app-text-muted font-bold">
          <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-app-card border border-app-border">
          <div className="text-xs text-app-text-muted uppercase font-bold mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-emerald-600">No data</div>
        </div>
        <div className="p-5 rounded-3xl bg-app-card border border-app-border">
          <div className="text-xs text-app-text-muted uppercase font-bold mb-1">Retention</div>
          <div className="text-2xl font-bold text-blue-600">No data</div>
        </div>
      </div>
    </div>
  </div>
);

interface ExportViewProps { setView: (view: any) => void; }
export const ExportView: React.FC<ExportViewProps> = ({ setView }) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const subjects = await DataService.getSubjects();
      const sections: Array<{ heading?: string; body: string }> = [];
      for (const subject of subjects) {
        const notes = await DataService.getNotes(subject.id);
        for (const note of notes) {
          sections.push({
            heading: `${subject.name} — ${note.title || 'Untitled note'}`,
            body: [note.content, note.summary ? `Summary: ${note.summary}` : ''].filter(Boolean).join('\n\n')
          });
        }
      }
      if (!sections.length) sections.push({ heading: 'Notes', body: 'No saved notes were found.' });
      downloadPdf({
        title: 'StudySnap Notes',
        subtitle: `Exported ${new Date().toLocaleString()}`,
        sections
      }, `StudySnap-Notes-${new Date().toISOString().slice(0, 10)}`);
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportError('Could not load your notes. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text"><ChevronLeft size={28} /></button>
        <h1 className="text-2xl font-bold text-app-text">Export Notes</h1>
      </div>
      <div className="space-y-4">
        <button disabled={isExporting} onClick={handleExport} className="w-full p-6 rounded-3xl bg-app-card border border-app-border flex items-center gap-4 disabled:opacity-60">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600"><FileText size={24} /></div>
          <div className="text-left">
            <div className="font-bold text-app-text">{isExporting ? 'Generating PDF…' : 'Export as PDF'}</div>
            <div className="text-xs text-app-text-muted">Downloads your saved notes as a real PDF file</div>
          </div>
        </button>
        {exportError && <p className="text-sm text-red-600 px-2">{exportError}</p>}
        <button onClick={async () => { const text = 'StudySnap Notes'; try { if (navigator.share) await navigator.share({ title: text, text: 'Shared from StudySnap' }); else await navigator.clipboard?.writeText(text); } catch {} }} className="w-full p-6 rounded-3xl bg-app-card border border-app-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Share2 size={24} /></div>
          <div className="text-left"><div className="font-bold text-app-text">Share via Link</div><div className="text-xs text-app-text-muted">Collaborate with others</div></div>
        </button>
      </div>
    </div>
  );
};

interface HomeworkViewProps { 
  setView: (view: any) => void; 
  homeworkHelp: any;
  homeworkInput: string;
  setHomeworkInput: (val: string) => void;
  handleHomeworkHelp: (input: string, isImage?: boolean) => void;
  previousView: any;
}
export const HomeworkView: React.FC<HomeworkViewProps> = ({ 
  setView, homeworkHelp, homeworkInput, setHomeworkInput, handleHomeworkHelp, previousView 
}) => (
  <div className="p-6 pb-32">
    <div className="flex items-center gap-4 mb-8">
      <button onClick={() => setView('home')} className="p-2 -ml-2 text-app-text">
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-2xl font-bold text-app-text">Homework Helper</h1>
    </div>

    {!homeworkHelp ? (
      <div className="space-y-6">
        <div className="p-8 rounded-[40px] bg-indigo-600 text-white shadow-xl shadow-indigo-200">
          <h2 className="text-xl font-bold mb-2">Stuck on a problem?</h2>
          <p className="text-white/80 text-sm">Paste your question or snap a photo for a step-by-step explanation.</p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-app-card border border-app-border">
            <textarea
              value={homeworkInput}
              onChange={(e) => setHomeworkInput(e.target.value)}
              placeholder="Paste your question here..."
              className="w-full h-32 bg-transparent border-none focus:ring-0 text-app-text resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleHomeworkHelp(homeworkInput)}
                disabled={!homeworkInput.trim()}
                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                Get Help
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-app-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-app-text-muted bg-neutral-50 px-4">Or</div>
          </div>

          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    handleHomeworkHelp(base64, true);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="w-full p-8 rounded-3xl bg-app-bg border-2 border-dashed border-app-border flex flex-col items-center justify-center text-app-text-muted"
          >
            <CameraIcon size={32} />
            <span className="font-medium mt-2">Snap a Photo</span>
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Sparkles size={18} />
            <span className="text-xs font-bold uppercase">AI Explanation</span>
          </div>
          <div className="text-app-text leading-relaxed markdown-body">
            <ReactMarkdown>{homeworkHelp.explanation}</ReactMarkdown>
          </div>
        </div>
        <button 
          onClick={() => handleHomeworkHelp('')}
          className="w-full py-4 rounded-2xl bg-app-card border border-app-border text-app-text font-bold"
        >
          Ask Another Question
        </button>
      </div>
    )}
  </div>
);
