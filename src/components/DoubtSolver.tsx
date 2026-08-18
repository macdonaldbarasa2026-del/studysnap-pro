import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  ChevronLeft, 
  Sparkles, 
  ThumbsUp, 
  MessageCircle, 
  Award,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  Volume2,
  VolumeX,
  Mic,
  Mail,
  Phone
} from 'lucide-react';
import { playAiVoice, stopAiVoice } from '../lib/speech';
import { authedFetch } from "../lib/authedFetch";

interface DoubtSolverProps {
  userName: string;
  onBack: () => void;
}

interface Doubt {
  id: string;
  user_name: string;
  question: string;
  subject: string;
  status: 'open' | 'solved';
  replies: Reply[];
  created_at: string;
}

interface Reply {
  id: string;
  user_name: string;
  text: string;
  is_ai: boolean;
  upvotes: number;
  created_at: string;
  reply_to_id?: string;
  reply_to_name?: string;
}

export const DoubtSolver: React.FC<DoubtSolverProps> = ({ userName, onBack }) => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newReply, setNewReply] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingReplyId, setSpeakingReplyId] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const [likedDoubts, setLikedDoubts] = useState<Record<string, boolean>>({});
  const [awardedReplies, setAwardedReplies] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDoubts([]);
    return () => {
      stopAiVoice();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleToggleDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not available on this device. You can still type your doubt below.");
      return;
    }

    if (isDictating) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsDictating(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setNewQuestion(prev => (prev ? `${prev.trim()} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition startup error:", err);
      setIsDictating(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedDoubt?.replies]);

  const handleSpeakText = (id: string, text: string) => {
    if (speakingReplyId === id) {
      stopAiVoice();
      setSpeakingReplyId(null);
      return;
    }

    setSpeakingReplyId(id);
    playAiVoice(
      text,
      'Zephyr',
      () => setSpeakingReplyId(id),
      () => setSpeakingReplyId(null)
    );
  };

  const handleAskAI = async (question: string) => {
    setIsProcessing(true);
    try {
      const res = await authedFetch('/api/gemini/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A student asks: "${question}". Provide a crystal-clear, step-by-step academic answer explaining the reasoning concisely.`,
          systemInstruction: "You are a warm, encouraging world-class academic tutor for StudySnap. Provide clear, concise, and accurate answers to student doubts. If asked who created you or StudySnap, do not invent or guess ownership. State that the verified product information available to you does not include a creator claim."
        })
      });

      let answerText = "To solve this, let's break it down into core principles.";
      if (res.ok) {
        const data = await res.json();
        answerText = data.text || answerText;
      }

      const aiReply: Reply = {
        id: `ai-reply-${Date.now()}`,
        user_name: 'AI Tutor',
        text: answerText,
        is_ai: true,
        upvotes: 0,
        created_at: new Date().toISOString()
      };

      // Voice output: Speak AI answer aloud automatically
      handleSpeakText(aiReply.id, answerText);

      return aiReply;
    } catch (error) {
      console.error('AI Doubt Solver error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const newDoubt: Doubt = {
      id: Math.random().toString(36).substr(2, 9),
      user_name: userName,
      question: newQuestion,
      subject: 'General',
      status: 'open',
      replies: [],
      created_at: new Date().toISOString()
    };

    setDoubts([newDoubt, ...doubts]);
    setNewQuestion('');
    setIsAsking(false);
    setSelectedDoubt(newDoubt);

    // Automatically get AI response
    const aiReply = await handleAskAI(newQuestion);
    if (aiReply) {
      setDoubts(prev => prev.map(d => 
        d.id === newDoubt.id ? { ...d, replies: [...d.replies, aiReply] } : d
      ));
      setSelectedDoubt(prev => prev?.id === newDoubt.id ? { ...prev, replies: [...prev.replies, aiReply] } : prev);
    }
  };

  const submitReply = () => {
    if (!newReply.trim() || !selectedDoubt) return;

    const reply: Reply = {
      id: Math.random().toString(36).substr(2, 9),
      user_name: userName,
      text: newReply,
      is_ai: false,
      upvotes: 0,
      created_at: new Date().toISOString(),
      ...(replyingTo ? { reply_to_id: replyingTo.id, reply_to_name: replyingTo.name } : {})
    };

    const updatedDoubt = { ...selectedDoubt, replies: [...selectedDoubt.replies, reply] };
    setDoubts(doubts.map(d => d.id === selectedDoubt.id ? updatedDoubt : d));
    setSelectedDoubt(updatedDoubt);
    setNewReply('');
    setReplyingTo(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {error && <div role="status" className="mx-4 mt-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-semibold flex items-center justify-between gap-3"><span>{error}</span><button onClick={() => setError(null)} className="min-w-11 min-h-11 rounded-xl hover:bg-amber-100" aria-label="Dismiss message">×</button></div>}
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Real-Time Doubt Solver</h1>
            <p className="text-xs text-slate-500">Get help from AI and peers instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
            <Users size={14} />
            1,240 Online
          </div>
          <button 
            onClick={() => setIsAsking(true)}
            className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Doubts List */}
        <div className={`w-full md:w-96 bg-white border-r border-slate-100 flex flex-col ${selectedDoubt ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search doubts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {doubts.filter(d => d.question.toLowerCase().includes(searchQuery.toLowerCase())).map(doubt => (
              <button
                key={doubt.id}
                onClick={() => setSelectedDoubt(doubt)}
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${selectedDoubt?.id === doubt.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
                    {doubt.subject}
                  </span>
                  {doubt.status === 'solved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-2 text-sm mb-2">{doubt.question}</h3>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {doubt.user_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={10} />
                    {doubt.replies.length} Replies
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedDoubt ? 'hidden md:flex items-center justify-center text-center' : 'flex'}`}>
          {selectedDoubt ? (
            <>
              <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDoubt(null)} className="md:hidden p-2 hover:bg-slate-50 rounded-full">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="font-bold text-slate-900">{selectedDoubt.question}</h2>
                    <p className="text-xs text-slate-500">Asked by {selectedDoubt.user_name} • {new Date(selectedDoubt.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectedDoubt && setLikedDoubts(prev => ({ ...prev, [selectedDoubt.id]: !prev[selectedDoubt.id] }))}
                    aria-label={selectedDoubt && likedDoubts[selectedDoubt.id] ? 'Unlike doubt' : 'Like doubt'}
                    aria-pressed={selectedDoubt ? !!likedDoubts[selectedDoubt.id] : false}
                    className={`p-2 transition-colors ${selectedDoubt && likedDoubts[selectedDoubt.id] ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                  >
                    <ThumbsUp size={20} />
                  </button>
                  <button onClick={() => selectedDoubt && setAwardedReplies(prev => ({ ...prev, [selectedDoubt.id]: !prev[selectedDoubt.id] }))} aria-label="Award doubt" className={`p-2 transition-colors ${selectedDoubt && awardedReplies[selectedDoubt.id] ? 'text-amber-500' : 'text-slate-400 hover:text-rose-600'}`}>
                    <Award size={20} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedDoubt.replies.map((reply, i) => (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex gap-4 ${reply.is_ai ? 'flex-row' : 'flex-row'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${reply.is_ai ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {reply.is_ai ? <Bot size={24} /> : <User size={24} />}
                    </div>
                    <div className={`flex-1 p-5 rounded-3xl shadow-sm border ${reply.is_ai ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">{reply.user_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(reply.created_at).toLocaleTimeString()}</span>
                      </div>
                      {reply.reply_to_name && (
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Replying to {reply.reply_to_name}</p>
                      )}
                      <p className="text-slate-700 leading-relaxed">{reply.text}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setLikedReplies(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))} className={`flex items-center gap-1 text-xs font-bold transition-colors ${likedReplies[reply.id] ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
                            <ThumbsUp size={14} />
                            {reply.upvotes + (likedReplies[reply.id] ? 1 : 0)}
                          </button>
                          <button onClick={() => { setReplyingTo({ id: reply.id, name: reply.user_name }); replyInputRef.current?.focus(); }} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                            Reply
                          </button>
                        </div>
                        {reply.is_ai && (
                          <button
                            onClick={() => handleSpeakText(reply.id, reply.text)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              speakingReplyId === reply.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 animate-pulse'
                                : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {speakingReplyId === reply.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            {speakingReplyId === reply.id ? 'Stop Voice' : 'Hear Voice'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Bot size={24} />
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                {replyingTo && (
                  <div className="flex items-center justify-between mb-3 px-4 py-2 bg-indigo-50 rounded-xl">
                    <span className="text-xs font-bold text-indigo-600">Replying to {replyingTo.name}</span>
                    <button onClick={() => setReplyingTo(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-4">
                  <input 
                    ref={replyInputRef}
                    type="text" 
                    placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Type your reply..."}
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && submitReply()}
                    className="flex-1 px-6 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={submitReply}
                    className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-sm p-12">
              <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Doubt</h2>
              <p className="text-slate-500 mb-8">Choose a question from the list or ask your own to get started.</p>
              
              <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 text-left">
                <h4 className="font-bold text-indigo-900 mb-1 text-sm">Need direct support?</h4>
                <p className="text-indigo-700/70 text-xs mb-3">StudySnap AI provides educational assistance; product ownership is not inferred from AI responses.</p>
                <div className="space-y-2">
                  <a 
                    href="mailto:simiyumacdonald1@gmail.com?subject=StudySnap%20Support%20Request" 
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-100 text-xs font-bold text-indigo-900 hover:border-indigo-300 transition-colors shadow-sm"
                  >
                    <Mail size={14} className="text-indigo-600" />
                    <span>Email Support</span>
                  </a>
                  <a 
                    href="tel:+254748322641" 
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-100 text-xs font-bold text-indigo-900 hover:border-indigo-300 transition-colors shadow-sm"
                  >
                    <Phone size={14} className="text-blue-600" />
                    <span>Phone Call</span>
                  </a>
                  <a 
                    href="https://wa.me/254748322641?text=Hello%20StudySnap%20Support" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-100 text-xs font-bold text-indigo-900 hover:border-indigo-300 transition-colors shadow-sm"
                  >
                    <MessageCircle size={14} className="text-emerald-600" />
                    <span>WhatsApp Message</span>
                  </a>
                </div>
              </div>

              <button 
                onClick={() => setIsAsking(true)}
                className="mt-8 w-full px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100"
              >
                Ask a Question
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {isAsking && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={24} />
                  Ask your Doubt
                </h2>
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    isDictating
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-200'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title={isDictating ? "Stop recording voice" : "Dictate with voice"}
                >
                  <Mic size={15} />
                  {isDictating ? 'Listening...' : 'Voice Input'}
                </button>
              </div>
              <div className="relative mb-6">
                <textarea 
                  placeholder="What are you struggling with? Be specific or tap Voice Input above..."
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className="w-full h-48 p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 resize-none text-slate-800 text-sm leading-relaxed"
                />
                {isDictating && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Transcribing voice...
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAsking(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitQuestion}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  Submit Question
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoubtSolver;
