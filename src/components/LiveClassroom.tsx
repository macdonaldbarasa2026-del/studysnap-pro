import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { 
  Users, 
  ChevronLeft, 
  Video, 
  Mic, 
  MicOff, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Send, 
  User, 
  Hand, 
  MoreVertical, 
  Zap, 
  CheckCircle2, 
  X,
  Plus,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { ToastType } from './Toast';

const socket: Socket = io();

interface LiveClassroomProps {
  userName: string;
  onBack: () => void;
  userProfile: UserProfile;
  initialIsCallActive?: boolean;
  addToast: (message: string, type?: ToastType) => void;
  roomId?: string;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isRaisingHand: boolean;
  isMuted: boolean;
  stream?: MediaStream;
  isAvatarFiltered?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

const RemoteVideo: React.FC<{ stream: MediaStream; name: string; isMuted: boolean; isRaisingHand: boolean; isHost: boolean }> = ({ stream, name, isMuted, isRaisingHand, isHost }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-slate-950/50 backdrop-blur-md rounded-lg text-[10px] font-bold">
        {name} {isHost && '(Host)'}
        {isMuted && <MicOff size={10} className="text-rose-500" />}
      </div>
      {isRaisingHand && (
        <div className="absolute top-3 right-3 p-1.5 bg-amber-500 rounded-lg shadow-lg animate-bounce">
          <Hand size={12} className="text-white" />
        </div>
      )}
    </div>
  );
};

export const LiveClassroom: React.FC<LiveClassroomProps> = ({ userName, onBack, userProfile, initialIsCallActive = false, addToast, roomId = 'general' }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pollAnswer, setPollAnswer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'polls'>('chat');
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAvatarFilterOn, setIsAvatarFilterOn] = useState(userProfile.avatar_filter_enabled);
  const [isHost, setIsHost] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(initialIsCallActive);

  useEffect(() => {
    socket.on("user-joined", (data: { id: string, name: string, participants: string[] }) => {
      setParticipants(data.participants.map(p => ({
        id: Math.random().toString(),
        name: p,
        isHost: false,
        isRaisingHand: false,
        isMuted: true,
        stream: undefined
      })));
    });

    socket.on("new-message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("hand-status", (data: { userName: string, isRaised: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.name === data.userName ? { ...p, isRaisingHand: data.isRaised } : p
      ));
    });

    return () => {
      socket.off("user-joined");
      socket.off("new-message");
      socket.off("hand-status");
    };
  }, []);

  const startCall = async () => {
    if (!userProfile.can_go_live) {
      addToast("You do not have permission to go live.", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMuted(false);
      setIsCallActive(true);
      setIsHost(true);
      
      socket.emit("join-room", roomId, userName);
      addToast("Joined the classroom!", "success");
    } catch (err) {
      console.error("Error accessing media devices:", err);
      addToast("Could not access camera/microphone. Please check your browser permissions.", "error");
    }
  };

  const joinCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMuted(false);
      setIsCallActive(true);
      setIsHost(false);

      socket.emit("join-room", roomId, userName);
      addToast("Joined the classroom!", "success");
    } catch (err) {
      console.error("Error accessing media devices:", err);
      addToast("Could not access camera/microphone. Please check your browser permissions.", "error");
    }
  };

  const endCall = () => {
    stopCamera();
    setParticipants([]);
    setIsCallActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleCamera = async () => {
    if (!userProfile.can_go_live) {
      addToast("You do not have permission to go live.", "error");
      return;
    }
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => track.enabled = false);
      }
      setIsCameraOn(false);
    } else {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => track.enabled = true);
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      }
      setIsCameraOn(true);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = isMuted);
    }
    setIsMuted(!isMuted);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("send-message", roomId, msg);
    setNewMessage('');
  };

  const toggleHand = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    socket.emit("raise-hand", roomId, userName, newState);
  };

  return (
    <div className="h-screen bg-app-bg flex flex-col text-app-text overflow-hidden font-sans">
      {/* Header */}
      <header className="p-6 bg-app-card border-b border-app-border flex items-center justify-between z-20 pt-[calc(1.5rem+var(--safe-top))] shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 hover:bg-app-bg rounded-2xl transition-all border border-transparent hover:border-app-border">
            <ChevronLeft size={24} className="text-app-text-muted" />
          </button>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight">Live Classroom</h1>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-app-text-muted mt-1">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-app-accent" />
                {participants.length + 1} Online
              </span>
              <span className="opacity-30">•</span>
              <span className="text-emerald-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-6 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20">
            <X size={18} />
            Leave
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video/Content Area */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto no-scrollbar">
          {/* Main Presenter View */}
          <div className="aspect-video bg-app-card rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-app-border group">
            {isCameraOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={true}
                className={`w-full h-full object-cover transition-all duration-700 ${isAvatarFilterOn ? 'filter sepia contrast-150 hue-rotate-180' : ''}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-app-accent/5 to-transparent">
                <div className="w-28 h-28 bg-app-accent rounded-[2.5rem] flex items-center justify-center text-5xl font-display font-black text-white shadow-2xl shadow-app-accent/30">
                  {userName[0]}
                </div>
              </div>
            )}
            <div className="absolute bottom-8 left-8 flex items-center gap-3 px-5 py-2.5 glass rounded-2xl border border-white/20 shadow-xl">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-sm font-black tracking-tight">{userName} (You) {isHost && '(Host)'}</span>
            </div>
          </div>

          {/* Participant Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {participants.map(p => (
              p.stream ? (
                <RemoteVideo 
                  key={p.id} 
                  stream={p.stream} 
                  name={p.name} 
                  isMuted={p.isMuted} 
                  isRaisingHand={p.isRaisingHand} 
                  isHost={p.isHost} 
                />
              ) : (
                <div key={p.id} className="aspect-video bg-app-card rounded-3xl relative overflow-hidden border border-app-border shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-app-bg rounded-2xl flex items-center justify-center text-xl font-black text-app-text-muted border border-app-border">
                      {p.name[0]}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 glass rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {p.name} {p.isHost && '(Host)'}
                    {p.isMuted && <MicOff size={12} className="text-rose-500" />}
                  </div>
                  {p.isRaisingHand && (
                    <div className="absolute top-4 right-4 p-2 bg-amber-500 rounded-xl shadow-lg animate-bounce">
                      <Hand size={14} className="text-white" />
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>

        {/* Sidebar (Chat/Notes/Polls) */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col hidden lg:flex">
          <div className="flex p-2 gap-1 border-b border-slate-800">
            {(['chat', 'notes', 'polls'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-500 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {activeTab === 'chat' && (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm italic">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === userName ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500">{msg.sender}</span>
                      <span className="text-[10px] text-slate-600">{msg.time}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
                      msg.sender === userName ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                  <h3 className="font-bold text-indigo-400 mb-2">Current Topic</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Quantum entanglement is a physical phenomenon that occurs when a pair or group of particles is generated, interact, or share spatial proximity...
                  </p>
                </div>
                <button onClick={() => { const blob = new Blob([`StudySnap Live Session\n\nTopic: Quantum entanglement\n\nReview superposition, measurement, and entanglement.`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'studysnap-session-notes.txt'; a.click(); URL.revokeObjectURL(url); }} className="w-full py-4 bg-indigo-600/20 text-indigo-400 rounded-2xl font-bold text-sm border border-indigo-500/30 flex items-center justify-center gap-2 hover:bg-indigo-600/30 transition-all">
                  <FileText size={18} /> Download Session Notes
                </button>
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-[10px] font-bold uppercase tracking-widest">Active Poll</span>
                  </div>
                  <h3 className="font-bold text-slate-200 mb-6">Do you understand the concept of superposition?</h3>
                  <div className="space-y-3">
                    <button onClick={() => setPollAnswer('yes')} className={`w-full p-4 ${pollAnswer === 'yes' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-700 hover:bg-slate-600 border-slate-600'} rounded-2xl text-left text-sm font-medium border transition-all flex items-center justify-between group`}>
                      Yes, perfectly
                      <div className="w-6 h-6 rounded-full border-2 border-slate-500 group-hover:border-indigo-500 transition-colors" />
                    </button>
                    <button onClick={() => setPollAnswer('confused')} className={`w-full p-4 ${pollAnswer === 'confused' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-700 hover:bg-slate-600 border-slate-600'} rounded-2xl text-left text-sm font-medium border transition-all flex items-center justify-between group`}>
                      Still a bit confused
                      <div className="w-6 h-6 rounded-full border-2 border-slate-500 group-hover:border-indigo-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'chat' && (
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="flex gap-2 p-2 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-indigo-500 transition-all">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Footer */}
      <footer className="p-8 bg-app-card border-t border-app-border flex items-center justify-center gap-4 z-20 pb-[calc(2rem+var(--safe-bottom))] shadow-2xl shadow-black/5">
        {!isCallActive ? (
          <div className="flex gap-6">
            <button 
              onClick={startCall}
              className="px-8 py-5 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-xs"
            >
              <Video size={24} />
              <span>Start Call</span>
            </button>
            <button 
              onClick={joinCall}
              className="px-8 py-5 bg-app-accent text-white rounded-[2rem] shadow-xl shadow-app-accent/20 hover:bg-app-accent/90 transition-all flex items-center gap-3 font-black uppercase tracking-widest text-xs"
            >
              <Users size={24} />
              <span>Join Call</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button 
              onClick={toggleMute}
              className={`p-5 rounded-[1.75rem] transition-all flex items-center gap-3 border ${
                isMuted ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-app-bg text-app-text border-app-border hover:bg-app-card'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            
            <button 
              onClick={toggleCamera}
              className={`p-5 rounded-[1.75rem] transition-all flex items-center gap-3 border ${
                isCameraOn ? 'bg-app-accent text-white shadow-lg shadow-app-accent/20 border-app-accent' : 'bg-app-bg text-app-text border-app-border hover:bg-app-card'
              }`}
            >
              <Video size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
            </button>

            <button 
              onClick={toggleHand}
              className={`p-5 rounded-[1.75rem] transition-all flex items-center gap-3 border ${
                isHandRaised ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-amber-500' : 'bg-app-bg text-app-text border-app-border hover:bg-app-card'
              }`}
            >
              <Hand size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
            </button>

            <button 
              onClick={() => setIsAvatarFilterOn(!isAvatarFilterOn)}
              className={`p-5 rounded-[1.75rem] transition-all flex items-center gap-3 border ${
                isAvatarFilterOn ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20 border-violet-500' : 'bg-app-bg text-app-text border-app-border hover:bg-app-card'
              }`}
            >
              <Sparkles size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{isAvatarFilterOn ? 'Avatar On' : 'Avatar Off'}</span>
            </button>

            <button 
              onClick={endCall}
              className="p-5 bg-rose-500 text-white rounded-[1.75rem] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center gap-3 border border-rose-500"
            >
              <X size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">End Call</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default LiveClassroom;
