import React, { useState, useRef, useEffect } from 'react';
import { safeExternalUrl } from '../lib/safe_url';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Bot, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  MicOff, 
  Brain, 
  Search, 
  MapPin, 
  Film, 
  Send, 
  Upload, 
  Play, 
  Square, 
  Loader2, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  ArrowLeft,
  ChevronRight,
  Layers,
  Zap,
  Globe,
  Radio,
  FileAudio,
  FileVideo,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { 
  analyzeImageWithGemini, 
  analyzeVideoWithGemini, 
  transcribeAudioWithGemini, 
  getHighThinkingReasoning, 
  sendGeminiChatMessage, 
  performWebSearch,
  
  mapsGroundingWithGemini, 
  startVeoVideoGeneration, 
  checkVeoVideoStatus 
} from '../services/gemini';
import { ToastType } from './Toast';
import type { UserProfile } from '../types';

interface GeminiMultimodalStudioProps {
  onBack?: () => void;
  addToast: (message: string, type?: ToastType) => void;
  userProfile: UserProfile | null;
}

type TabType = 'chat' | 'image' | 'video' | 'transcribe' | 'thinking' | 'grounding' | 'veo';

export const GeminiMultimodalStudio: React.FC<GeminiMultimodalStudioProps> = ({ onBack, addToast, userProfile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  // --- 1. Multi-turn Chatbot State ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string; modelUsed?: string }>>([
    { role: 'model', text: 'Hello! I am your AI academic tutor. How can I help you master your subjects today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<'deep' | 'fast'>('fast');
  const [selectedRole, setSelectedRole] = useState<'general' | 'socratic' | 'stem' | 'exam-coach'>('general');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleSendChat = async () => {
    if (!inputMessage.trim() || isChatLoading) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    
    const newHistory = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await sendGeminiChatMessage({
        message: userText,
        history: newHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        model: selectedModel,
        role: selectedRole,
        userProfile
      });
      setChatMessages(prev => [...prev, { role: 'model', text: res.text, modelUsed: res.modelUsed }]);
    } catch (err: any) {
      addToast(err.message || "Failed to get AI response", "error");
      setChatMessages(prev => [...prev, { role: 'model', text: "I encountered an issue processing your request. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- 2. Image Analysis State (Advanced Study Model) ---
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('Analyze this academic illustration/homework. Break down the formulas, diagram structure, and core concepts.');
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setImageResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunImageAnalysis = async () => {
    if (!imagePreview) {
      addToast("Please upload an image first", "error");
      return;
    }
    setIsImageAnalyzing(true);
    try {
      const result = await analyzeImageWithGemini(imagePreview, imagePrompt);
      setImageResult(result);
      addToast("Image analysis completed with StudySnap AI!", "success");
    } catch (err: any) {
      addToast(err.message || "Image analysis failed", "error");
    } finally {
      setIsImageAnalyzing(false);
    }
  };

  // --- 3. Video Analysis State (Advanced Study Model) ---
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('Extract all key concepts, time-stamped breakdown, summary, and revision questions from this lecture video.');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoPreview(event.target?.result as string);
        setVideoResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunVideoAnalysis = async () => {
    if (!videoPreview) {
      addToast("Please upload a video first", "error");
      return;
    }
    setIsVideoAnalyzing(true);
    try {
      const result = await analyzeVideoWithGemini(videoPreview, "video/mp4", videoPrompt);
      setVideoResult(result);
      addToast("Video analysis completed with StudySnap AI!", "success");
    } catch (err: any) {
      addToast(err.message || "Video analysis failed", "error");
    } finally {
      setIsVideoAnalyzing(false);
    }
  };

  // --- 4. Audio Transcription State (Fast Study Model) ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        // Convert blob to base64 and transcribe
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const text = await transcribeAudioWithGemini(base64Audio, 'audio/webm');
            setTranscriptionResult(text);
            addToast("Audio transcription completed.", "success");
          } catch (err: any) {
            addToast(err.message || "Transcription failed", "error");
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      addToast("Recording started. Speak into your microphone...", "info");
    } catch (err: any) {
      addToast("Microphone access denied: " + err.message, "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // --- 5. High Thinking Deep Reasoning State (Advanced Study Model ThinkingLevel.HIGH) ---
  const [thinkingPrompt, setThinkingPrompt] = useState('Solve step-by-step: Prove that the square root of 2 is irrational and explain the mathematical implications in real analysis.');
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleRunThinking = async () => {
    if (!thinkingPrompt.trim()) return;
    setIsThinking(true);
    try {
      const result = await getHighThinkingReasoning(thinkingPrompt, "You are a master mathematician and analytical logician. Provide an exhaustive, rigorous, step-by-step proof with all reasoning paths.");
      setThinkingResult(result);
      addToast("Deep reasoning completed.", "success");
    } catch (err: any) {
      addToast(err.message || "Reasoning failed", "error");
    } finally {
      setIsThinking(false);
    }
  };

  // --- 6. Grounding State (Search & Maps with Fast Study Model) ---
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [groundingQuery, setGroundingQuery] = useState('What are the latest discoveries from the James Webb Space Telescope in 2025/2026?');
  const [groundingResult, setGroundingResult] = useState<{ text: string; sources: Array<{ title: string; url: string }> } | null>(null);
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);

  const handleRunGrounding = async () => {
    if (!groundingQuery.trim()) return;
    setIsGroundingLoading(true);
    try {
      if (groundingMode === 'search') {
        const res = await performWebSearch(groundingQuery);
        setGroundingResult(res);
        addToast("Web search context loaded.", "success");
      } else {
        const res = await mapsGroundingWithGemini(groundingQuery);
        setGroundingResult(res);
        addToast("Location context loaded.", "success");
      }
    } catch (err: any) {
      addToast(err.message || "Grounding failed", "error");
    } finally {
      setIsGroundingLoading(false);
    }
  };

  // --- 7. Veo Video Generation State (veo-3.1-fast-generate-preview) ---
  const [veoPrompt, setVeoPrompt] = useState('Animate the trajectory of a rocket breaking into Earth orbit with glowing plasma trails');
  const [veoImage, setVeoImage] = useState<string | null>(null);
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoOperationName, setVeoOperationName] = useState<string | null>(null);
  const [veoStatus, setVeoStatus] = useState<string | null>(null);
  const [isVeoGenerating, setIsVeoGenerating] = useState(false);

  const handleVeoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVeoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartVeo = async () => {
    setIsVeoGenerating(true);
    setVeoStatus("Initiating Veo video synthesis...");
    try {
      const res = await startVeoVideoGeneration({
        prompt: veoPrompt,
        imageBase64: veoImage || undefined,
        aspectRatio: veoAspectRatio
      });
      setVeoOperationName(res.operationName);
      setVeoStatus("Veo operation queued. Polling render status...");
      addToast("Veo video generation initiated!", "info");

      // Poll status every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await checkVeoVideoStatus(res.operationName);
          if (statusRes.done) {
            clearInterval(pollInterval);
            setIsVeoGenerating(false);
            setVeoStatus("Video rendering complete!");
            addToast("Veo video generation finished successfully!", "success");
          } else {
            setVeoStatus("Rendering video frames with Veo AI... Please wait.");
          }
        } catch (pollErr) {
          console.warn("Poll check error:", pollErr);
        }
      }, 5000);

    } catch (err: any) {
      setIsVeoGenerating(false);
      setVeoStatus("Video generation error: " + err.message);
      addToast(err.message || "Veo generation failed", "error");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-app-card border border-app-border text-app-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs">
                StudySnap AI
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live SDK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-app-text mt-1">
              AI Intelligence & Multi-Modal Lab
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-2 mb-6">
        {[
          { id: 'chat' as const, label: 'StudySnap AI Chat', icon: Bot, badge: 'Multi-turn' },
          { id: 'image' as const, label: 'Analyze Images', icon: ImageIcon, badge: 'Pro 3.1' },
          { id: 'video' as const, label: 'Analyze Video', icon: Video, badge: 'Pro 3.1' },
          { id: 'transcribe' as const, label: 'Transcribe Audio', icon: Mic, badge: 'Flash 3.7' },
          { id: 'thinking' as const, label: 'High Thinking', icon: Brain, badge: 'Level HIGH' },
          { id: 'grounding' as const, label: 'Search & Maps Grounding', icon: Globe, badge: 'Grounding' },
          { id: 'veo' as const, label: 'Veo Video Generator', icon: Film, badge: 'Veo 3.1' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-bold text-xs sm:text-sm min-h-11 transition-all border ${
                isActive 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-app-card text-app-text border-app-border hover:border-indigo-300'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-app-text-muted'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-app-card border border-app-border rounded-3xl p-5 sm:p-8 shadow-sm">
        {/* --- TAB 1: STUDYSNAP AI CHAT --- */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Model & Role Selector Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-app-bg border border-app-border">
              <div>
                <label className="text-xs font-bold text-app-text-muted mb-1.5 block">
                  Response profile:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'deep' as const, name: 'Deep', desc: 'Advanced reasoning' },
                    { id: 'fast' as const, name: 'Fast', desc: 'Quick responses' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        selectedModel === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'bg-app-card border-app-border text-app-text hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{m.name}</div>
                      <div className="text-[10px] text-app-text-muted truncate">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-app-text-muted mb-1.5 block">
                  Tutor Role & System Instruction:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'general' as const, name: 'Academic Tutor', emoji: '🎓' },
                    { id: 'socratic' as const, name: 'Socratic Guide', emoji: '🏛️' },
                    { id: 'stem' as const, name: 'STEM Specialist', emoji: '🔬' },
                    { id: 'exam-coach' as const, name: 'Exam Prep Coach', emoji: '⚡' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                        selectedRole === r.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'bg-app-card border-app-border text-app-text hover:border-slate-300'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="text-xs truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Chat Thread */}
            <div 
              ref={chatScrollRef}
              className="h-[420px] overflow-y-auto space-y-4 p-4 rounded-2xl bg-app-bg border border-app-border"
            >
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-app-card border border-app-border text-app-text rounded-tl-none shadow-sm'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 mb-1.5">
                        <Bot size={12} />
                        <span>Tutor Response</span>
                        {msg.modelUsed && (
                          <span className="text-app-text-muted font-mono">({msg.modelUsed})</span>
                        )}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl bg-app-card border border-app-border flex items-center gap-2 text-indigo-500 text-xs font-bold">
                    <Loader2 size={14} className="animate-spin" />
                    <span>StudySnap AI is generating a detailed explanation...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask any academic question or study concept..."
                className="flex-1 px-4 py-3 bg-app-bg border border-app-border rounded-2xl text-sm text-app-text focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChat}
                disabled={isChatLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: ANALYZE IMAGES (Advanced Study Model) --- */}
        {activeTab === 'image' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">Image Understanding & OCR</h3>
                  <p className="text-xs text-app-text-muted">StudySnap AI • visual reasoning</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-xl">
                Advanced Study Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-app-border rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[260px] bg-app-bg">
                  {imagePreview ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={imagePreview} alt="Upload preview" className="max-h-60 rounded-2xl object-contain shadow-sm" />
                      <button 
                        onClick={() => { setImagePreview(null); setImageResult(null); }}
                        className="mt-3 text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remove and select another photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-app-text mb-1">Upload Homework or Diagram</p>
                      <p className="text-xs text-app-text-muted mb-4">PNG, JPG, WebP supported</p>
                      <label className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                        Select Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-app-text-muted mb-1.5 block">Analysis Prompt</label>
                  <textarea 
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-app-bg border border-app-border rounded-2xl text-xs text-app-text focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleRunImageAnalysis}
                  disabled={!imagePreview || isImageAnalyzing}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isImageAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {isImageAnalyzing ? 'Analyzing with StudySnap AI...' : 'Analyze Image with StudySnap AI'}
                </button>
              </div>

              {/* Result Area */}
              <div className="bg-app-bg border border-app-border rounded-3xl p-5 flex flex-col h-full min-h-[350px]">
                <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
                  <span className="font-bold text-xs text-app-text">Visual Breakdown & Equations</span>
                  {imageResult && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(imageResult); addToast("Copied to clipboard!", "success"); }}
                      className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto text-xs sm:text-sm text-app-text leading-relaxed whitespace-pre-wrap">
                  {imageResult ? (
                    imageResult
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-app-text-muted p-6">
                      <ImageIcon size={32} className="mb-2 opacity-40" />
                      <p>Upload an image on the left and tap "Analyze Image" to see deep OCR & mathematical breakdown.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ANALYZE VIDEO (Advanced Study Model) --- */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <Video size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">Lecture Video Understanding</h3>
                  <p className="text-xs text-app-text-muted">StudySnap AI • video analysis</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-xl">
                Advanced Study Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-app-border rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[260px] bg-app-bg">
                  {videoPreview ? (
                    <div className="w-full flex flex-col items-center">
                      <video src={videoPreview} controls className="max-h-56 rounded-2xl w-full" />
                      <button 
                        onClick={() => { setVideoPreview(null); setVideoResult(null); }}
                        className="mt-3 text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remove video
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <FileVideo size={24} />
                      </div>
                      <p className="text-sm font-bold text-app-text mb-1">Upload Lecture Video Clip</p>
                      <p className="text-xs text-app-text-muted mb-4">MP4, WebM format</p>
                      <label className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors shadow-sm">
                        Select Video File
                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-app-text-muted mb-1.5 block">Video Extraction Instructions</label>
                  <textarea 
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-app-bg border border-app-border rounded-2xl text-xs text-app-text focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleRunVideoAnalysis}
                  disabled={!videoPreview || isVideoAnalyzing}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isVideoAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                  {isVideoAnalyzing ? 'Analyzing video with StudySnap AI...' : 'Analyze Video with StudySnap AI'}
                </button>
              </div>

              {/* Video Result */}
              <div className="bg-app-bg border border-app-border rounded-3xl p-5 flex flex-col h-full min-h-[350px]">
                <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
                  <span className="font-bold text-xs text-app-text">Key Concepts & Timestamps</span>
                  {videoResult && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(videoResult); addToast("Copied to clipboard!", "success"); }}
                      className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto text-xs sm:text-sm text-app-text leading-relaxed whitespace-pre-wrap">
                  {videoResult ? (
                    videoResult
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-app-text-muted p-6">
                      <Video size={32} className="mb-2 opacity-40" />
                      <p>Upload a video clip and tap "Analyze Video" to generate a comprehensive lecture breakdown.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: AUDIO TRANSCRIPTION (Fast Study Model) --- */}
        {activeTab === 'transcribe' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-600 text-white">
                  <Mic size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">Microphone Audio Transcription</h3>
                  <p className="text-xs text-app-text-muted">StudySnap AI • audio transcription</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-600 text-white rounded-xl">
                Fast Study Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recorder Side */}
              <div className="space-y-4 flex flex-col justify-center items-center p-8 bg-app-bg border border-app-border rounded-3xl min-h-[300px] text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 animate-pulse scale-110' 
                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                }`}>
                  <Mic size={40} />
                </div>

                <div>
                  <h4 className="font-bold text-app-text text-base">
                    {isRecording ? 'Listening and Recording...' : 'Tap Microphone to Speak'}
                  </h4>
                  <p className="text-xs text-app-text-muted mt-1 max-w-xs">
                    Speak your lecture question, study notes, or math problem. Audio will be securely processed by StudySnap AI for instant transcription.
                  </p>
                </div>

                <div className="flex gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      <Mic size={16} />
                      Start Voice Input
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-sm"
                    >
                      <Square size={16} />
                      Stop & Transcribe
                    </button>
                  )}
                </div>

                {audioBlobUrl && (
                  <div className="w-full mt-4">
                    <audio src={audioBlobUrl} controls className="w-full h-9 rounded-xl" />
                  </div>
                )}
              </div>

              {/* Result Area */}
              <div className="bg-app-bg border border-app-border rounded-3xl p-5 flex flex-col h-full min-h-[300px]">
                <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
                  <span className="font-bold text-xs text-app-text">Transcribed Text Output</span>
                  {transcriptionResult && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(transcriptionResult); addToast("Copied to clipboard!", "success"); }}
                      className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto text-xs sm:text-sm text-app-text leading-relaxed whitespace-pre-wrap">
                  {isTranscribing ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-amber-500 p-6">
                      <Loader2 size={24} className="animate-spin mb-2" />
                      <p className="font-bold">StudySnap AI is transcribing your speech...</p>
                    </div>
                  ) : transcriptionResult ? (
                    transcriptionResult
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-app-text-muted p-6">
                      <FileAudio size={32} className="mb-2 opacity-40" />
                      <p>Start recording on the left to transcribe your spoken voice into academic text.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: HIGH THINKING (Advanced Study Model with ThinkingLevel.HIGH) --- */}
        {activeTab === 'thinking' && (
          <div className="space-y-6">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600 text-white">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">High Thinking Deep Reasoning Mode</h3>
                  <p className="text-xs text-app-text-muted">Model: Advanced Study Model with thinkingLevel: HIGH</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-purple-600 text-white rounded-xl">
                ThinkingLevel.HIGH
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-app-text-muted mb-1.5 block">
                  Enter Complex Academic Problem or Theorem:
                </label>
                <textarea 
                  value={thinkingPrompt}
                  onChange={(e) => setThinkingPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Derive Einstein's Field Equations, prove mathematical theorems, or solve complex STEM equations..."
                  className="w-full p-4 bg-app-bg border border-app-border rounded-2xl text-sm text-app-text focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-app-text-muted font-bold">
                  <Zap size={14} className="text-purple-500" />
                  <span>Maximum reasoning depth activated (no maxOutputTokens constraint)</span>
                </div>
                <button
                  onClick={handleRunThinking}
                  disabled={isThinking || !thinkingPrompt.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                  {isThinking ? 'Engaging Deep Thinking...' : 'Execute High Thinking'}
                </button>
              </div>

              {/* Output */}
              <div className="bg-app-bg border border-app-border rounded-3xl p-6 min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-app-border mb-4">
                  <span className="font-bold text-xs text-app-text flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-500" />
                    Formal Proof & Mathematical Derivation
                  </span>
                  {thinkingResult && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(thinkingResult); addToast("Copied to clipboard!", "success"); }}
                      className="text-xs font-bold text-purple-500 flex items-center gap-1 hover:underline"
                    >
                      <Copy size={13} />
                      Copy Proof
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto text-sm text-app-text leading-relaxed whitespace-pre-wrap font-sans">
                  {isThinking ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-purple-500 p-8">
                      <Brain size={32} className="animate-pulse mb-3" />
                      <p className="font-bold">StudySnap AI is working through the problem step by step...</p>
                      <p className="text-xs text-app-text-muted mt-1">Exploring alternative hypothesis paths and verifying algebraic steps.</p>
                    </div>
                  ) : thinkingResult ? (
                    thinkingResult
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-app-text-muted p-8">
                      <Brain size={36} className="mb-2 opacity-40" />
                      <p>Enter your complex STEM question above and click "Execute High Thinking".</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: SEARCH & MAPS GROUNDING (Fast Study Model) --- */}
        {activeTab === 'grounding' && (
          <div className="space-y-6">
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">Web Search & Location Context</h3>
                  <p className="text-xs text-app-text-muted">Model: Fast Study Model with real-time grounding tools</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-sky-600 text-white rounded-xl">
                Fast Study Model
              </span>
            </div>

            <div className="flex gap-2 p-1 bg-app-bg rounded-2xl border border-app-border max-w-sm">
              <button
                onClick={() => {
                  setGroundingMode('search');
                  setGroundingQuery('What are the latest discoveries in CRISPR gene editing in 2025/2026?');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  groundingMode === 'search'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-app-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search size={14} />
                Web Search
              </button>
              <button
                onClick={() => {
                  setGroundingMode('maps');
                  setGroundingQuery('Find the best quiet study libraries and university research labs near Oxford and Cambridge');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  groundingMode === 'maps'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-app-text hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin size={14} />
                Location Search
              </button>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={groundingQuery}
                onChange={(e) => setGroundingQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunGrounding()}
                placeholder={groundingMode === 'search' ? 'Search web fact-checked info...' : 'Search campus locations, libraries, spots...'}
                className="flex-1 px-4 py-3 bg-app-bg border border-app-border rounded-2xl text-sm text-app-text focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleRunGrounding}
                disabled={isGroundingLoading || !groundingQuery.trim()}
                className="px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGroundingLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Fetch Grounded Info</span>
              </button>
            </div>

            {/* Grounded Response */}
            <div className="bg-app-bg border border-app-border rounded-3xl p-6 min-h-[280px]">
              <div className="flex items-center justify-between pb-3 border-b border-app-border mb-4">
                <span className="font-bold text-xs text-app-text">Grounded Factual Summary</span>
                {groundingResult && (
                  <button 
                    onClick={() => { navigator.clipboard.writeText(groundingResult.text); addToast("Copied to clipboard!", "success"); }}
                    className="text-xs font-bold text-sky-500 flex items-center gap-1 hover:underline"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                )}
              </div>

              {isGroundingLoading ? (
                <div className="h-44 flex flex-col items-center justify-center text-center text-sky-500">
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <p className="font-bold text-sm">Querying Google {groundingMode === 'search' ? 'Search' : 'Maps'} grounding index...</p>
                </div>
              ) : groundingResult ? (
                <div className="space-y-4">
                  <div className="text-sm text-app-text leading-relaxed whitespace-pre-wrap">
                    {groundingResult.text}
                  </div>

                  {groundingResult.sources && groundingResult.sources.length > 0 && (
                    <div className="pt-4 border-t border-app-border">
                      <div className="text-xs font-bold text-app-text-muted mb-2">Verified Grounding Sources:</div>
                      <div className="flex flex-wrap gap-2">
                        {groundingResult.sources.map((s, idx) => {
                          const url = safeExternalUrl(s.url);
                          return url ? (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-app-card border border-app-border text-xs font-bold text-sky-600 hover:border-sky-400 transition-colors"
                          >
                            <ExternalLink size={12} />
                            <span className="max-w-[200px] truncate">{s.title}</span>
                          </a>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center text-app-text-muted">
                  <Globe size={32} className="mb-2 opacity-40" />
                  <p>Execute a query above to retrieve live grounded results directly from Google.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 7: VEO IMAGE-TO-VIDEO ANIMATOR (veo-3.1-fast-generate-preview) --- */}
        {activeTab === 'veo' && (
          <div className="space-y-6">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-600 text-white">
                  <Film size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text text-sm">StudySnap Video Studio</h3>
                  <p className="text-xs text-app-text-muted">Model: veo-3.1-fast-generate-preview</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-rose-600 text-white rounded-xl">
                veo-3.1-fast-generate-preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-app-border rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] bg-app-bg">
                  {veoImage ? (
                    <div className="relative w-full flex flex-col items-center">
                      <img src={veoImage} alt="Veo input preview" className="max-h-48 rounded-2xl object-contain shadow-sm" />
                      <button 
                        onClick={() => setVeoImage(null)}
                        className="mt-2 text-xs font-bold text-rose-500 hover:underline"
                      >
                        Remove image (generate from text prompt only)
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-2">
                        <FileImage size={22} />
                      </div>
                      <p className="text-xs font-bold text-app-text mb-1">Optional: Upload Image to Animate</p>
                      <p className="text-[11px] text-app-text-muted mb-3">Animate diagrams, science concepts, or photos</p>
                      <label className="px-4 py-2 bg-rose-600 text-white rounded-2xl text-xs font-bold cursor-pointer hover:bg-rose-700 transition-colors shadow-sm">
                        Select Photo
                        <input type="file" accept="image/*" onChange={handleVeoImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-app-text-muted mb-1.5 block">Animation Prompt</label>
                  <textarea 
                    value={veoPrompt}
                    onChange={(e) => setVeoPrompt(e.target.value)}
                    rows={2}
                    placeholder="Describe how the scene should move and animate..."
                    className="w-full p-3 bg-app-bg border border-app-border rounded-2xl text-xs text-app-text focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-app-text-muted">Aspect Ratio:</span>
                  <div className="flex gap-2">
                    {(['16:9', '9:16'] as const).map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setVeoAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          veoAspectRatio === ratio
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-app-card text-app-text border-app-border'
                        }`}
                      >
                        {ratio === '16:9' ? '16:9 Landscape' : '9:16 Portrait'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartVeo}
                  disabled={isVeoGenerating || !veoPrompt.trim()}
                  className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {isVeoGenerating ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
                  {isVeoGenerating ? 'Generating Video with Veo...' : 'Generate Video with Veo'}
                </button>
              </div>

              {/* Status & Preview Area */}
              <div className="bg-app-bg border border-app-border rounded-3xl p-5 flex flex-col justify-center items-center text-center min-h-[320px]">
                {isVeoGenerating ? (
                  <div className="space-y-3">
                    <Loader2 size={36} className="text-rose-500 animate-spin mx-auto" />
                    <h4 className="font-bold text-sm text-app-text">Creating your StudySnap video</h4>
                    <p className="text-xs text-app-text-muted max-w-xs">{veoStatus}</p>
                    {veoOperationName && (
                      <span className="font-mono text-[10px] text-app-text-muted bg-app-card px-2.5 py-1 rounded-lg border border-app-border block truncate max-w-xs mx-auto">
                        Op: {veoOperationName}
                      </span>
                    )}
                  </div>
                ) : veoOperationName ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle size={24} />
                    </div>
                    <h4 className="font-bold text-sm text-app-text">{veoStatus || 'Generation Active'}</h4>
                    <p className="text-xs text-app-text-muted max-w-xs">
                      Veo rendering operation is tracked securely on server.
                    </p>
                  </div>
                ) : (
                  <div className="text-app-text-muted space-y-2">
                    <Film size={36} className="mx-auto opacity-40" />
                    <p className="text-xs">Configure your prompt & aspect ratio, then click Generate Video.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
