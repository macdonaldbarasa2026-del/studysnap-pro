import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  Sparkles, 
  Radio, 
  RotateCcw, 
  Settings2, 
  Brain, 
  BookOpen, 
  Zap, 
  Copy, 
  Check, 
  Bookmark, 
  Flame, 
  AudioWaveform as WaveformIcon,
  MessageSquare,
  Wifi,
  WifiOff,
  Cpu,
  ShieldCheck as ShieldCheckIcon
} from 'lucide-react';
import { ToastType } from './Toast';
import { processVoiceConversation, requestTextToSpeech } from '../services/gemini';
import { playAiVoice, stopAiVoice } from '../lib/speech';
import { auth } from '../lib/firebase';


interface VoiceTutorProps {
  userName: string;
  onBack: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

interface ConversationTurn {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  bookmarked?: boolean;
}

const VOICE_OPTIONS = [
  { id: 'Zephyr', name: 'Clear', style: 'Engaging & Vibrant', desc: 'Natural, friendly tutor pace' },
  { id: 'Puck', name: 'Bright', style: 'Playful & Bright', desc: 'High energy & motivational' },
  { id: 'Charon', name: 'Calm', style: 'Calm & Intellectual', desc: 'Deep, measured explanations' },
  { id: 'Kore', name: 'Warm', style: 'Warm & Clear', desc: 'Gentle, structured cadence' },
  { id: 'Fenrir', name: 'Direct', style: 'Bold & Direct', desc: 'Crisp, concise answers' },
  { id: 'Aoede', name: 'Expressive', style: 'Expressive & Melodic', desc: 'Enthusiastic & academic' },
];

const STUDY_TOPICS = [
  { id: 'General Academic', name: 'General AI Study Twin', icon: Brain },
  { id: 'Quantum Mechanics & STEM', name: 'STEM & Physics Lab', icon: Zap },
  { id: 'Cellular Biology & Genetics', name: 'Biology & Life Sciences', icon: BookOpen },
  { id: 'Calculus & Algebra Solver', name: 'Math & Calculus Coach', icon: Sparkles },
  { id: 'Socratic Active Recall', name: 'Socratic Method Drill', icon: Flame },
];

const PROMPT_SUGGESTIONS = [
  "Explain quantum entanglement like I'm 15",
  "Quiz me on cellular respiration key steps",
  "How does calculus derive velocity from position?",
  "Give me a memory mnemonic for cranial nerves",
  "Test my understanding of the French Revolution",
];

export const VoiceTutor: React.FC<VoiceTutorProps> = ({ userName, onBack, addToast }) => {
  // Live State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isAiSpeaking, setIsAiSpeakingState] = useState(false);
  const isAiSpeakingRef = useRef(false);
  const setIsAiSpeaking = (val: boolean) => {
    isAiSpeakingRef.current = val;
    setIsAiSpeakingState(val);
  };
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  
  // Customization
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [selectedTopic, setSelectedTopic] = useState(STUDY_TOPICS[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'transcript'>('live');
  const [echoProtection, setEchoProtection] = useState<'checking' | 'active' | 'limited'>('checking');
  const [micLevel, setMicLevel] = useState(0);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');

  // Text and Transcripts
  const [currentLiveText, setCurrentLiveText] = useState('');
  const [currentUserLiveText, setCurrentUserLiveText] = useState('');
  const currentLiveTextRef = useRef('');
  const currentUserLiveTextRef = useRef('');
  const [textInput, setTextInput] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<ConversationTurn[]>([]);
  const [history, setHistory] = useState<ConversationTurn[]>([
    {
      id: 'welcome-0',
      sender: 'ai',
      text: `Hello ${userName || 'there'}! I'm your StudySnap Live Tutor. Tap "Start Live Voice" and speak naturally—ask questions, brainstorm, or quiz me anytime!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    setHistory(prev => [...prev, {
       id: `user-text-${Date.now()}`,
       sender: 'user',
       text: trimmed,
       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    wsRef.current.send(JSON.stringify({ type: 'text', text: trimmed }));
    setTextInput('');
  };

  // Audio Context & Streaming Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const outputAudioRef = useRef<HTMLAudioElement | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const lastMicUiUpdateRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Speech Recognition Backup
  const speechRecognitionRef = useRef<any>(null);

  // Audio Output Buffer Queue for 24kHz raw PCM from Live API
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const nextPlayTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    let mounted = true;
    const refreshDevices = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const inputs = devices.filter((device) => device.kind === 'audioinput');
        setAudioInputDevices(inputs);
        if (!selectedInputDevice && inputs[0]?.deviceId) setSelectedInputDevice(inputs[0].deviceId);
      } catch (error) {
        console.warn('Could not enumerate audio devices:', error);
      }
    };
    refreshDevices();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history, currentLiveText]);

  // Initialize Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let dataArray: Uint8Array | null = null;
      if (analyserRef.current) {
        dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      const centerY = height / 2;
      const primaryColor = isAiSpeaking ? '#818cf8' : isUserSpeaking ? '#34d399' : isLiveActive ? '#6366f1' : '#64748b';

      // Background soft ambient glow
      if (isLiveActive) {
        const gradient = ctx.createRadialGradient(width / 2, centerY, 10, width / 2, centerY, width / 2);
        gradient.addColorStop(0, isAiSpeaking ? 'rgba(99, 102, 241, 0.25)' : isUserSpeaking ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.1)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw multi-layered sine waveforms
      const lines = isLiveActive ? 4 : 2;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        ctx.lineWidth = l === 0 ? 3 : 1.5;
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = l === 0 ? 0.9 : 0.4 / l;

        for (let x = 0; x < width; x += 4) {
          const normX = x / width;
          let amp = isLiveActive ? (isAiSpeaking ? 45 : isUserSpeaking ? 40 : 12) : 4;
          if (dataArray && dataArray.length > 0) {
            const freqIndex = Math.floor(normX * (dataArray.length / 4));
            const freqVal = (dataArray[freqIndex] || 0) / 255;
            amp += freqVal * 35;
          }

          const envelope = Math.sin(normX * Math.PI);
          const y = centerY + Math.sin(normX * 10 + phase + l * 0.8) * amp * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isAiSpeaking ? 0.12 : isUserSpeaking ? 0.09 : 0.03;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLiveActive, isAiSpeaking, isUserSpeaking]);

  // Convert raw 16-bit PCM base64 string from StudySnap Live service to Float32Array
  const decodePcmChunk = useCallback((base64Data: string) => {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }, []);

  // Queue and play 24kHz audio smoothly
  const playPcmAudioStream = useCallback((pcmFloat32: Float32Array) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const audioBuffer = ctx.createBuffer(1, pcmFloat32.length, 24000);
    audioBuffer.getChannelData(0).set(pcmFloat32);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackSpeed;

    // Route AI output through a master gain so we can gently duck speaker volume
    // when the user starts speaking. Browser AEC remains the primary echo defense.
    if (!outputGainRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = 1;
      gain.connect(ctx.destination);
      outputGainRef.current = gain;
    }
    source.connect(outputGainRef.current);

    const currentTime = ctx.currentTime;
    let startTime = Math.max(currentTime, nextPlayTimeRef.current);
    
    // Smooth jitter buffer logic to prevent popping/stuttering
    if (nextPlayTimeRef.current <= currentTime) {
      startTime = currentTime + 0.05; // 50ms buffer
    }

    source.start(startTime);
    scheduledSourcesRef.current.push(source);
    
    nextPlayTimeRef.current = startTime + audioBuffer.duration / playbackSpeed;

    setIsAiSpeaking(true);
    source.onended = () => {
      const index = scheduledSourcesRef.current.indexOf(source);
      if (index > -1) {
        scheduledSourcesRef.current.splice(index, 1);
      }
      if (ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
        setIsAiSpeaking(false);
      }
    };
  }, [playbackSpeed]);

  // Convert Float32 mic buffer to 16-bit PCM base64 string for StudySnap Live service
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    let binary = '';
    const bytes = new Uint8Array(output.buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopScheduledAudio = useCallback(() => {
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    scheduledSourcesRef.current = [];
    if (audioContextRef.current) nextPlayTimeRef.current = audioContextRef.current.currentTime;
  }, []);

  // Start Live Audio Stream with Gemini. The browser's built-in AEC/NS/AGC
  // stays in the capture path; a dedicated AudioWorklet then resamples to 16 kHz
  // and emits small PCM frames off the main thread.
  const startLiveSession = async () => {
    if (connectionStatus === 'connecting' || isLiveActive) return;
    let connectionTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Please sign in before starting Live Voice.');
      const token = await currentUser.getIdToken();

      setConnectionStatus('connecting');
      setEchoProtection('checking');
      addToast('Preparing Live Voice...', 'info');

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Live voice requires HTTPS for secure microphone/audio processing.');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support microphone capture.');
      }

      const audioConstraints: MediaTrackConstraints = {
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 16000 },
        sampleSize: { ideal: 16 },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(selectedInputDevice ? { deviceId: { exact: selectedInputDevice } } : {}),
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;
      const track = stream.getAudioTracks()[0];
      const settings = track?.getSettings?.();
      const echoEnabled = settings?.echoCancellation !== false;
      const noiseEnabled = settings?.noiseSuppression !== false;
      setEchoProtection(echoEnabled && noiseEnabled ? 'active' : 'limited');

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const outputGain = audioCtx.createGain();
      outputGain.gain.value = 1;
      outputGain.connect(audioCtx.destination);
      outputGainRef.current = outputGain;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNode.connect(analyser);

      // The worklet keeps microphone processing off the UI thread and posts 20ms
      // 16-bit PCM frames. StudySnap Live service expects 16 kHz mono PCM input.
      await audioCtx.audioWorklet.addModule('/voice-capture-processor.js');
      const captureNode = new AudioWorkletNode(audioCtx, 'voice-capture-processor');
      processorRef.current = captureNode;
      sourceNode.connect(captureNode);
      const silentMonitor = audioCtx.createGain();
      silentMonitor.gain.value = 0;
      captureNode.connect(silentMonitor);
      silentMonitor.connect(audioCtx.destination);
      captureNode.port.onmessage = (event: MessageEvent) => {
        const data = event.data;
        if (!data) return;
        if (typeof data.rms === 'number') {
          const level = Math.min(1, data.rms * 8);
          const now = performance.now();
          const speaking = level > 0.12 && !isMicMuted;
          if (now - lastMicUiUpdateRef.current > 60) {
            lastMicUiUpdateRef.current = now;
            setMicLevel(level);
            setIsUserSpeaking(speaking);
          }
          if (outputGainRef.current && audioCtx.state !== 'closed') {
            const target = speaking ? 0.28 : 1;
            outputGainRef.current.gain.setTargetAtTime(target, audioCtx.currentTime, 0.025);
          }
        }
        if (!(data.pcm instanceof ArrayBuffer)) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isMicMuted) return;
        const pcm = new Int16Array(data.pcm);
        const bytes = new Uint8Array(pcm.buffer);
        let binary = '';
        const step = 8192;
        for (let i = 0; i < bytes.length; i += step) {
          binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + step, bytes.length)));
        }
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          audio: btoa(binary),
          mimeType: 'audio/pcm;rate=16000',
        }));
      };

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live-voice`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      connectionTimer = setTimeout(() => {
        if (!isLiveActive && ws.readyState !== WebSocket.OPEN) return;
        if (!isLiveActive) {
          try { ws.close(1000, 'Live Voice connection timeout'); } catch {}
          addToast('Live Voice took too long to connect. Please try again.', 'error');
          setConnectionStatus('error');
        }
      }, 12000);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token,
          voice: selectedVoice,
          topic: selectedTopic,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_ready') {
            if (connectionTimer) clearTimeout(connectionTimer);
            setConnectionStatus('connected');
            setIsLiveActive(true);
            addToast('Live Voice is ready. You can speak naturally.', 'success');
          } else if (msg.type === 'audio' && msg.audio) {
            playPcmAudioStream(decodePcmChunk(msg.audio));
          } else if (msg.type === 'transcript' && msg.text) {
            const next = `${currentLiveTextRef.current} ${msg.text}`.trim();
            currentLiveTextRef.current = next;
            setCurrentLiveText(next);
          } else if (msg.type === 'user_transcript' && msg.text) {
            const nextUser = `${currentUserLiveTextRef.current} ${msg.text}`.trim();
            currentUserLiveTextRef.current = nextUser;
            setCurrentUserLiveText(nextUser);
          } else if (msg.type === 'turnComplete') {
            const userText = currentUserLiveTextRef.current.trim();
            const aiText = currentLiveTextRef.current.trim();
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (userText || aiText) {
              setHistory(prev => [
                ...prev,
                ...(userText ? [{ id: `user-${Date.now()}`, sender: 'user' as const, text: userText, timestamp: now }] : []),
                ...(aiText ? [{ id: `turn-${Date.now() + 1}`, sender: 'ai' as const, text: aiText, timestamp: now }] : []),
              ]);
            }
            currentUserLiveTextRef.current = '';
            currentLiveTextRef.current = '';
            setCurrentUserLiveText('');
            setCurrentLiveText('');
          } else if (msg.type === 'interrupted') {
            // Live voice detection supports barge-in. Immediately clear queued output so the
            // user never hears the old response continue over their speech.
            stopScheduledAudio();
            const interruptedUserText = currentUserLiveTextRef.current.trim();
            if (interruptedUserText) {
              setHistory(prev => [...prev, {
                id: `user-${Date.now()}`,
                sender: 'user',
                text: interruptedUserText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
              currentUserLiveTextRef.current = '';
              setCurrentUserLiveText('');
            }
            setIsAiSpeaking(false);
          } else if (msg.type === 'tool_call' && msg.functionCalls) {
            const responses = msg.functionCalls.map((call: any) => {
              if (call.name === 'control_app') {
                const args = call.args;
                // Dispatch global event for App.tsx to handle
                window.dispatchEvent(new CustomEvent('voice_command', {
                  detail: args
                }));
                return {
                  id: call.id,
                  name: call.name,
                  response: { result: `Success. Executed action: ${args.action} on view: ${args.view}` }
                };
              }
              return {
                id: call.id,
                name: call.name,
                response: { error: 'Unknown tool' }
              };
            });
            wsRef.current?.send(JSON.stringify({
              type: 'tool_response',
              functionResponses: responses
            }));
          } else if (msg.type === 'live_unavailable') {
            setConnectionStatus('error');
            addToast(msg.message || 'Live Voice is temporarily unavailable. Please try again.', 'warning');
            try { ws.close(1011, 'Live session unavailable'); } catch {}
          } else if (msg.type === 'session_closed') {
            setConnectionStatus('error');
            addToast('Live Voice ended unexpectedly. You can reconnect.', 'warning');
            try { ws.close(1000, 'Session closed'); } catch {}
          }
        } catch (e) {
          console.warn('Live WS packet parsing error:', e);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('error');
        addToast('Live voice connection failed. Check the server and network.', 'error');
      };
      ws.onclose = () => {
        if (connectionTimer) clearTimeout(connectionTimer);
        setIsLiveActive(false);
        setIsAiSpeaking(false);
        setIsUserSpeaking(false);
        setMicLevel(0);
        stopScheduledAudio();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        processorRef.current?.disconnect?.();
        processorRef.current = null;
        setConnectionStatus(prev => prev === 'error' ? 'error' : 'idle');
      };
    } catch (err: any) {
      if (connectionTimer) clearTimeout(connectionTimer);
      console.error('Failed to start Live Audio:', err);
      setConnectionStatus('error');
      setEchoProtection('limited');
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      processorRef.current?.disconnect?.();
      processorRef.current = null;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
      outputGainRef.current = null;
      addToast(err?.message || 'Microphone access is required for Live conversation.', 'error');
    }
  };

  // Stop Live Audio Session
  const stopLiveSession = () => {
    setIsLiveActive(false);
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
    setMicLevel(0);
    setConnectionStatus('idle');
    currentUserLiveTextRef.current = '';
    currentLiveTextRef.current = '';
    setCurrentUserLiveText('');
    setCurrentLiveText('');

    stopScheduledAudio();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      if (processorRef.current.cancel) {
        processorRef.current.cancel().catch(() => {});
      } else if (processorRef.current.disconnect) {
        processorRef.current.disconnect();
      }
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      outputGainRef.current = null;
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    addToast('Live session ended.', 'info');
  };

  // Push-to-Talk or REST query handler (Supports fallback & suggestion chips)
  const handleDirectVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => [...prev, userTurn]);
    setIsProcessingTurn(true);
    setIsAiSpeaking(true);

    try {
      // Build brief context history for the conversational endpoint
      const recentHistory = historyRef.current.slice(-4).map(h => ({
        role: h.sender === 'user' ? 'user' : 'model',
        text: h.text
      }));

      const res = await processVoiceConversation({
        userInput: queryText,
        history: recentHistory,
        voiceName: selectedVoice,
        userName: userName || 'Student',
        currentTopic: selectedTopic
      });

      const aiTurn: ConversationTurn = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.text || "Here is what I found for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [...prev, aiTurn]);

      if (res.audio) {
        try {
          const audioBlob = b64toBlob(res.audio, res.mimeType || 'audio/wav');
          const audioUrl = URL.createObjectURL(audioBlob);
          if (outputAudioRef.current) {
            const player = outputAudioRef.current;
            const cleanupUrl = () => {
              URL.revokeObjectURL(audioUrl);
              player.removeEventListener('ended', cleanupUrl);
              player.removeEventListener('error', cleanupUrl);
            };
            player.addEventListener('ended', cleanupUrl, { once: true });
            player.addEventListener('error', cleanupUrl, { once: true });
            player.src = audioUrl;
            player.playbackRate = playbackSpeed;
            player.play().catch(() => {
              cleanupUrl();
              playAiVoice(aiTurn.text, selectedVoice, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false));
            });
          } else {
            playAiVoice(aiTurn.text, selectedVoice, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false));
          }
        } catch (e) {
          playAiVoice(aiTurn.text, selectedVoice, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false));
        }
      } else {
        playAiVoice(aiTurn.text, selectedVoice, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false));
      }
    } catch (err: any) {
      console.error('Voice conversation error:', err);
      addToast('Failed to generate voice response.', 'error');
      setIsAiSpeaking(false);
    } finally {
      setIsProcessingTurn(false);
    }
  };

  // Helper for converting Base64 to audio Blob
  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  // Copy turn text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item));
    addToast('Bookmark updated', 'info');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScheduledAudio();
      wsRef.current?.close();
      processorRef.current?.disconnect?.();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      outputGainRef.current = null;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopScheduledAudio]);

  return (
    <div className="voice-tutor reference-shell text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-10">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-white/70 bg-white/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 flex items-center justify-center transition-all border border-indigo-100"
            title="Back to home"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                StudySnap Live Tutor
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">Talk naturally, learn in real time</p>
          </div>
        </div>

        {/* Right action tabs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700" title="Microphone access is requested only when you start a session.">
            <ShieldCheckIcon /> Private session
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-indigo-100 text-[11px] sm:text-xs font-bold">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'live' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-700'}`}
            >
              <Radio size={14} className={isLiveActive ? 'animate-pulse text-emerald-400' : ''} />
              Live Stage
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'transcript' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-700'}`}
            >
              <MessageSquare size={14} />
              Transcript ({history.length})
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-indigo-100 text-slate-600 hover:text-indigo-700'}`}
            title="Voice & Topic Settings"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>

      {/* Settings Modal Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-3 top-20 sm:inset-x-6 sm:top-24 z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-indigo-100 bg-white/98 backdrop-blur-2xl px-4 sm:px-6 py-5 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Voice Selection */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 block flex items-center gap-1.5">
                  <Volume2 size={14} className="text-indigo-400" />
                  Voice Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_OPTIONS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      disabled={isLiveActive || connectionStatus === 'connecting'}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs ${selectedVoice === v.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-indigo-50/60 border-indigo-100 text-slate-600 hover:bg-white'}`}
                    >
                      <div className="font-bold text-slate-700">{v.name}</div>
                      <div className="text-[10px] text-indigo-300/80 truncate">{v.style}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Topic Domain */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 block flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-400" />
                  Study Focus Domain
                </label>
                <div className="space-y-1.5">
                  {STUDY_TOPICS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      disabled={isLiveActive || connectionStatus === 'connecting'}
                      className={`w-full p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2.5 ${selectedTopic === t.id ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' : 'bg-indigo-50/60 border-indigo-100 text-slate-600 hover:bg-white'}`}
                    >
                      <t.icon size={14} className={selectedTopic === t.id ? 'text-emerald-400' : 'text-slate-500'} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Microphone device */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 block flex items-center gap-1.5">
                  <Mic size={14} className="text-sky-500" />
                  Microphone
                </label>
                <div className="reference-card p-4">
                  <select
                    value={selectedInputDevice}
                    onChange={(e) => setSelectedInputDevice(e.target.value)}
                    className="w-full rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={isLiveActive}
                  >
                    {audioInputDevices.length === 0 && <option value="">Default microphone</option>}
                    {audioInputDevices.map((device, index) => (
                      <option key={device.deviceId || `mic-${index}`} value={device.deviceId}>
                        {device.label || `Microphone ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Echo cancellation, noise suppression and automatic gain control are requested from the browser.</p>
                </div>
              </div>

              {/* Playback Speed & Session Management */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 block flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" />
                  Pacing & History
                </label>
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-600 mb-2 flex justify-between">
                      <span>Audio Playback Speed</span>
                      <span className="text-indigo-400 font-mono">{playbackSpeed}x</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 1.25, 1.5, 1.75].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${playbackSpeed === speed ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-slate-600 hover:bg-indigo-100'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setHistory([
                        {
                          id: `welcome-${Date.now()}`,
                          sender: 'ai',
                          text: `History cleared. Ready for your next inquiry, ${userName}!`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                      addToast('Transcript cleared', 'info');
                    }}
                    className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={13} />
                    Reset Conversation History
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Stage */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-6 flex flex-col items-center">
        
        <section className="w-full max-w-2xl mb-4 rounded-3xl border border-indigo-100 bg-white/85 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-black text-indigo-500">Live learning workspace</p>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">Talk through a concept, then turn it into a study action.</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">Voice, text and transcript stay together so you can ask, interrupt, clarify and review without changing screens.</p>
            </div>
            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center"><WaveformIcon size={20}/></div>
          </div>
        </section>

        {/* Status Chip */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-white border border-indigo-100 text-xs font-medium text-slate-600 mb-4 shadow-sm">
          {connectionStatus === 'connected' ? (
            <>
              <Wifi size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Streaming 24kHz Duplex</span>
            </>
          ) : connectionStatus === 'connecting' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-indigo-400 font-bold">Connecting WebSocket...</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-slate-500" />
              <span>Topic: <strong className="text-indigo-300">{selectedTopic}</strong></span>
            </>
          )}
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Voice: <strong className="text-slate-700">{selectedVoice}</strong></span>
        </div>

        {/* Professional audio quality strip */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {[
            { label: 'Echo protection', value: echoProtection === 'active' ? 'Active' : echoProtection === 'limited' ? 'Limited' : 'Checking', icon: <Radio size={14} />, tone: echoProtection === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Noise reduction', value: 'Browser AEC/NS', icon: <WaveformIcon size={14} />, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Mic level', value: `${Math.round(micLevel * 100)}%`, icon: <Mic size={14} />, tone: 'text-sky-600 bg-sky-50 border-sky-100' },
            { label: 'Conversation', value: isLiveActive ? 'Listening' : 'Ready', icon: <Sparkles size={14} />, tone: 'text-violet-600 bg-violet-50 border-violet-100' },
          ].map(item => (
            <div key={item.label} className={`rounded-2xl border px-3 py-2.5 bg-white/80 ${item.tone.split(' ').filter(Boolean).slice(-1)[0] || 'border-indigo-100'}`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${item.tone.split(' ')[0]}`}>{item.icon}{item.label}</div>
              <div className="mt-1 text-xs font-bold text-slate-700 truncate">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Waveform Visualizer & Central Avatar */}
        <div className="relative w-full max-w-md h-44 sm:h-52 flex flex-col items-center justify-center my-2">
          {/* Canvas Waveform */}
          <canvas 
            ref={canvasRef} 
            width={480} 
            height={240} 
            className="w-full h-full rounded-3xl"
          />

          {/* Central Pulsing Orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ 
                scale: isAiSpeaking ? [1, 1.18, 1.05, 1.25, 1] : isUserSpeaking ? [1, 1.12, 1] : isLiveActive ? [1, 1.04, 1] : 1,
                opacity: isLiveActive ? 1 : 0.8
              }}
              transition={{ repeat: Infinity, duration: isAiSpeaking ? 1.4 : isUserSpeaking ? 0.9 : 3, ease: "easeInOut" }}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-500 ${
                isAiSpeaking 
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 border-indigo-300 shadow-indigo-500/50' 
                  : isUserSpeaking 
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 shadow-emerald-500/50'
                  : isLiveActive 
                  ? 'bg-gradient-to-tr from-slate-800 to-indigo-900 border-indigo-500/60 shadow-indigo-950'
                  : 'bg-white border-indigo-200 shadow-sm'
              }`}
            >
              {isProcessingTurn ? (
                <Brain size={44} className="text-white animate-spin-slow" />
              ) : isAiSpeaking ? (
                <Volume2 size={44} className="text-white animate-pulse" />
              ) : isUserSpeaking ? (
                <Mic size={44} className="text-white" />
              ) : (
                <WaveformIcon size={44} className={isLiveActive ? 'text-indigo-400' : 'text-slate-600'} />
              )}
            </motion.div>
          </div>
        </div>

        {/* Live Subtitles / Latest AI Turn */}
        <div className="w-full max-w-xl my-3">
          <AnimatePresence mode="wait">
            {isAiSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-5 rounded-2xl bg-white/90 border border-indigo-100 text-center shadow-lg backdrop-blur-md"
              >
                <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                  <Sparkles size={13} />
                  AI Study Twin Speaking ({selectedVoice})
                </div>
                <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
                  {currentLiveText || history[history.length - 1]?.text || "Speaking..."}
                </p>
              </motion.div>
            ) : isUserSpeaking ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-5 rounded-2xl bg-white/90 border border-emerald-100 text-center shadow-lg backdrop-blur-md"
              >
                <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                  <Mic size={13} />
                  Listening to you...
                </div>
                <p className="text-base sm:text-lg text-emerald-800 font-medium italic">
                  {currentUserLiveText ? `“${currentUserLiveText}”` : "Speak freely, I'm listening..."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-2xl bg-white/80 border border-indigo-100 text-center"
              >
                <p className="text-sm text-slate-500 font-medium">
                  {isLiveActive 
                    ? "✨ Microphone active. Start speaking anytime—I will reply live."
                    : "Tap 'Start Live Voice' below to begin continuous real-time dialogue."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="w-full max-w-xl my-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
            Quick Spoken Prompts
          </div>
          <div className="flex flex-wrap gap-2 pb-2">
            {PROMPT_SUGGESTIONS.slice(0, showAllPrompts ? PROMPT_SUGGESTIONS.length : 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleDirectVoiceQuery(prompt)}
                disabled={isProcessingTurn || isLiveActive}
                className="px-3 py-2 rounded-xl bg-white hover:bg-white border border-indigo-100 hover:border-indigo-500/40 text-xs text-slate-600 hover:text-indigo-700 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                💬 {prompt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAllPrompts(v => !v)}
              className="px-3 py-2 rounded-xl border border-dashed border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
            >
              {showAllPrompts ? 'Show fewer' : `+${PROMPT_SUGGESTIONS.length - 3} more`}
            </button>
          </div>
        </div>

        {/* Primary Controls Dock */}
        <div className="w-full max-w-md bg-white/90 border border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 mt-2">
          {/* Mute Mic toggle */}
          <button
            onClick={() => {
              setIsMicMuted(!isMicMuted);
              addToast(isMicMuted ? 'Microphone unmuted' : 'Microphone muted', 'info');
            }}
            disabled={!isLiveActive}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isMicMuted 
                ? 'bg-amber-500/20 border border-amber-500 text-amber-400' 
                : isLiveActive 
                ? 'bg-white border border-indigo-100 text-slate-700 hover:bg-indigo-50' 
                : 'bg-slate-100 border border-indigo-100 text-slate-500 cursor-not-allowed'
            }`}
            title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Master Live Connection Button */}
          <button
            onClick={isLiveActive ? stopLiveSession : startLiveSession}
            className={`flex-1 h-14 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
              isLiveActive 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/30' 
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/40'
            }`}
          >
            {isLiveActive ? (
              <>
                <Radio size={20} className="animate-pulse" />
                <span>End Live Session</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Start Live Voice</span>
              </>
            )}
          </button>

          {/* Quick Interrupt / Stop Talking */}
          <button
            onClick={() => {
              stopScheduledAudio();
              outputAudioRef.current?.pause();
              setIsAiSpeaking(false);
              addToast('AI speech stopped. You can speak now.', 'info');
            }}
            disabled={!isAiSpeaking}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isAiSpeaking 
                ? 'bg-indigo-50 border border-indigo-300 text-indigo-600 hover:bg-indigo-100' 
                : 'bg-slate-100 border border-indigo-100 text-slate-500 cursor-not-allowed'
            }`}
            title="Interrupt AI speaking"
          >
            <VolumeX size={22} />
          </button>
        </div>

        {/* Text Input Area */}
        {isLiveActive && (
          <form onSubmit={handleSendText} className="w-full max-w-2xl mt-4 flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Or type your message here..."
              className="flex-1 bg-white border border-indigo-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700 shadow-sm transition-all"
            />
            <button 
              type="submit"
              disabled={!textInput.trim() || connectionStatus !== 'connected'}
              className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-sm"
            >
              Send
            </button>
          </form>
        )}

        {/* Scrollable Live Transcript Drawer */}
        {activeTab === 'transcript' && (
          <div className="w-full max-w-2xl mt-6 bg-white/90 border border-indigo-100 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[55dvh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Live Dialogue Transcript</span>
              <span className="text-xs text-slate-500">{history.length} turns recorded</span>
            </div>

            {history.map((turn) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  turn.sender === 'user'
                    ? 'bg-white border-indigo-100 ml-8'
                    : 'bg-indigo-950/40 border-indigo-500/30 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold">
                  <span className={turn.sender === 'user' ? 'text-emerald-400' : 'text-indigo-400'}>
                    {turn.sender === 'user' ? `You (${userName || 'Student'})` : `StudySnap Tutor (${selectedVoice})`}
                  </span>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>{turn.timestamp}</span>
                    {turn.sender === 'ai' && (
                      <button
                        onClick={() => playAiVoice(turn.text, selectedVoice, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false))}
                        className="hover:text-indigo-400 p-0.5"
                        title="Replay Voice"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleCopy(turn.id, turn.text)}
                      className="hover:text-slate-600"
                      title="Copy text"
                    >
                      {copiedId === turn.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <button 
                      onClick={() => toggleBookmark(turn.id)}
                      className="hover:text-amber-400"
                      title="Bookmark takeaway"
                    >
                      <Bookmark size={13} className={turn.bookmarked ? 'fill-amber-400 text-amber-400' : ''} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">{turn.text}</p>
              </motion.div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}

      </main>

      {/* Hidden Audio Player for REST Speech Playback */}
      <audio 
        ref={outputAudioRef} 
        onEnded={() => setIsAiSpeaking(false)} 
        className="hidden"
      />
    </div>
  );
};

export default VoiceTutor;
