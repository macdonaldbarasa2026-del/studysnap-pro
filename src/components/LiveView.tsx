import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Mic, MicOff, CameraOff, X, Wifi, Users, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { auth } from '../lib/firebase';

interface LiveViewProps { userName: string; isBroadcaster: boolean; roomId: string; onBack: () => void; }
type ChatMessage = { id: string; userId: string; text: string };

const socketUrl = () => (import.meta.env.VITE_SOCKET_URL || window.location.origin).replace(/\/$/, '');

export const LiveView: React.FC<LiveViewProps> = ({ userName, isBroadcaster, roomId, onBack }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const canBroadcast = useMemo(() => isBroadcaster && typeof RTCPeerConnection !== 'undefined', [isBroadcaster]);

  useEffect(() => {
    let cancelled = false;
    const cleanupPeer = (peer: RTCPeerConnection) => {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.close();
    };

    const setup = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('You must be signed in to enter live video.');
        const token = await currentUser.getIdToken();
        const socket = io(socketUrl(), { auth: { token }, transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', async () => {
          if (cancelled) return;
          socket.emit('join-room', roomId);
          if (!canBroadcast) socket.emit('live-viewer-ready', roomId);
          setStatus('live');
          if (canBroadcast) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 24, max: 30 } },
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
              });
              if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
              localStreamRef.current = stream;
              if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Camera/microphone permission was denied.');
              setStatus('error');
            }
          }
        });
        socket.on('connect_error', (e) => { setError(e.message || 'Could not connect to the live room.'); setStatus('error'); });
        socket.on('room-error', (payload) => { setError(payload?.error || 'Live room is unavailable.'); setStatus('error'); });
        socket.on('live-viewer-joined', async ({ socketId }: { socketId: string }) => {
          if (!canBroadcast || !localStreamRef.current) return;
          const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          peersRef.current.set(socketId, peer);
          localStreamRef.current.getTracks().forEach(track => peer.addTrack(track, localStreamRef.current!));
          peer.onicecandidate = (event) => { if (event.candidate) socket.emit('live-ice', { roomId, targetId: socketId, candidate: event.candidate }); };
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit('live-offer', { roomId, targetId: socketId, description: peer.localDescription });
          setViewerCount(v => v + 1);
        });
        socket.on('live-offer', async ({ fromId, description }: { fromId: string; description: RTCSessionDescriptionInit }) => {
          if (canBroadcast) return;
          const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          peersRef.current.set(fromId, peer);
          peer.ontrack = ({ streams }) => { if (remoteVideoRef.current && streams[0]) remoteVideoRef.current.srcObject = streams[0]; };
          peer.onicecandidate = (event) => { if (event.candidate) socket.emit('live-ice', { roomId, targetId: fromId, candidate: event.candidate }); };
          await peer.setRemoteDescription(description);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit('live-answer', { roomId, targetId: fromId, description: peer.localDescription });
        });
        socket.on('live-answer', async ({ fromId, description }: { fromId: string; description: RTCSessionDescriptionInit }) => {
          const peer = peersRef.current.get(fromId);
          if (peer) await peer.setRemoteDescription(description);
        });
        socket.on('live-ice', async ({ fromId, candidate }: { fromId: string; candidate: RTCIceCandidateInit }) => {
          const peer = peersRef.current.get(fromId);
          if (peer && candidate) { try { await peer.addIceCandidate(candidate); } catch {} }
        });
        socket.on('live-viewer-left', ({ socketId }: { socketId: string }) => {
          const peer = peersRef.current.get(socketId); if (peer) cleanupPeer(peer); peersRef.current.delete(socketId); setViewerCount(v => Math.max(0, v - 1));
        });
        socket.on('new-message', (message: ChatMessage) => setMessages(prev => [...prev.slice(-99), { id: message.id, userId: message.userId, text: message.text }]));
      } catch (e) {
        if (!cancelled) { setError(e instanceof Error ? e.message : 'Live video could not start.'); setStatus('error'); }
      }
    };
    setup();
    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      peersRef.current.forEach(cleanupPeer); peersRef.current.clear();
      socketRef.current?.disconnect(); socketRef.current = null;
    };
  }, [roomId, canBroadcast]);

  const sendMessage = () => {
    const text = newMessage.trim().slice(0, 500);
    if (!text || !socketRef.current) return;
    socketRef.current.emit('live-chat', { roomId, text });
    setNewMessage('');
  };
  const toggleMute = () => { const track = localStreamRef.current?.getAudioTracks()[0]; if (!track) return; track.enabled = !track.enabled; setIsMuted(!track.enabled); };
  const toggleVideo = () => { const track = localStreamRef.current?.getVideoTracks()[0]; if (!track) return; track.enabled = !track.enabled; setIsVideoOff(!track.enabled); };

  return (
    <div className="fixed inset-0 z-[80] bg-black text-white flex flex-col overflow-hidden safe-area-top safe-area-bottom">
      <header className="shrink-0 min-h-14 px-3 sm:px-5 flex items-center justify-between gap-3 bg-black/75 backdrop-blur-md">
        <div className="min-w-0"><p className="font-black truncate">StudySnap Live</p><p className="text-[11px] text-white/60 truncate">{roomId} · {status === 'live' ? 'Live now' : status === 'connecting' ? 'Connecting…' : 'Unavailable'}</p></div>
        <div className="flex items-center gap-2 shrink-0"><span className="hidden sm:flex items-center gap-1 text-xs text-white/70"><Users size={14}/>{isBroadcaster ? viewerCount : 'Live'}</span><button onClick={onBack} aria-label="Close live video" className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center"><X size={20}/></button></div>
      </header>
      <main className="flex-1 min-h-0 grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] overflow-hidden">
        <section className="relative min-h-0 bg-neutral-950 flex items-center justify-center">
          {isBroadcaster ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-contain sm:object-cover"/> : <video ref={remoteVideoRef} autoPlay playsInline controls={false} className="w-full h-full object-contain bg-black"/>}
          {!isBroadcaster && status === 'connecting' && <div className="absolute inset-0 flex items-center justify-center text-center p-6"><div><Wifi className="mx-auto mb-3 animate-pulse"/><p className="font-bold">Connecting to live video…</p></div></div>}
          {error && <div role="alert" className="absolute inset-x-3 sm:inset-x-6 top-3 rounded-2xl bg-red-950/80 border border-red-300/20 p-3 text-sm">{error}</div>}
          {canBroadcast && <div className="absolute left-3 bottom-3 flex gap-2"><button onClick={toggleMute} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'} className="w-12 h-12 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center">{isMuted ? <MicOff/> : <Mic/>}</button><button onClick={toggleVideo} aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'} className="w-12 h-12 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center">{isVideoOff ? <CameraOff/> : <Camera/>}</button></div>}
          <button onClick={() => setChatOpen(v => !v)} className="absolute right-3 bottom-3 lg:hidden min-h-11 px-4 rounded-full bg-black/60 backdrop-blur text-sm font-bold">{chatOpen ? 'Hide chat' : 'Show chat'}</button>
        </section>
        <aside className={`${chatOpen ? 'flex' : 'hidden'} lg:flex min-h-0 flex-col bg-app-card text-app-text border-l border-app-border`}>
          <div className="shrink-0 px-4 py-3 border-b border-app-border"><p className="font-black">Live chat</p><p className="text-[11px] text-app-text-muted">Questions and discussion while the lesson runs.</p></div>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">{messages.length ? messages.map(m => <div key={m.id} className="rounded-2xl bg-app-bg border border-app-border p-3"><p className="text-[10px] font-black text-app-accent">{m.userId}</p><p className="text-sm mt-1 break-words">{m.text}</p></div>) : <div className="h-full flex items-center justify-center text-center p-6"><div><p className="font-bold">No messages yet</p><p className="text-xs text-app-text-muted mt-1">Be the first to ask a study question.</p></div></div>}</div>
          <div className="shrink-0 p-3 border-t border-app-border safe-area-bottom"><div className="flex gap-2"><input value={newMessage} onChange={e => setNewMessage(e.target.value.slice(0, 500))} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask a question…" className="flex-1 min-w-0 min-h-11 rounded-xl bg-app-bg border border-app-border px-3 text-sm outline-none focus:border-app-accent"/><button onClick={sendMessage} disabled={!newMessage.trim()} aria-label="Send live message" className="w-11 h-11 rounded-xl bg-app-accent text-white flex items-center justify-center disabled:opacity-40"><Send size={18}/></button></div></div>
        </aside>
      </main>
    </div>
  );
};
