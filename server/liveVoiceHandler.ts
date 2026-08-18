import { WebSocket, WebSocketServer } from 'ws';
import { getGemini } from './geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import admin from 'firebase-admin';

const ALLOWED_VOICES = new Set(['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede']);
const MAX_TOPIC_LENGTH = 200;
const MAX_TEXT_LENGTH = 4000;
const MAX_TOOL_RESPONSE_BYTES = 32_000;
const AUDIO_WINDOW_MS = 10_000;
const MAX_AUDIO_BYTES_PER_WINDOW = 2_500_000;

export function setupLiveVoiceWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (clientWs: WebSocket, request?: any) => {
    const requestOrigin = typeof request?.headers?.origin === 'string' ? request.headers.origin : '';
    const allowedOrigin = process.env.CLIENT_ORIGIN || '';
    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
      try { clientWs.close(1008, 'Origin not allowed'); } catch {}
      return;
    }
    let session: any = null;
    let isConnected = true;
    let authenticated = false;
    let authTimer: ReturnType<typeof setTimeout> | undefined;
    let audioWindowStarted = Date.now();
    let audioBytesInWindow = 0;

    const closeUnauthenticated = () => {
      if (authTimer) clearTimeout(authTimer);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'auth_required', message: 'Authentication required for Live Voice.' }));
        clientWs.close(1008, 'Authentication required');
      }
    };

    clientWs.on('close', () => {
      isConnected = false;
      if (authTimer) clearTimeout(authTimer);
      if (session) {
        try { session.close(); } catch { /* ignore */ }
      }
    });

    clientWs.on('error', (err) => {
      console.warn('[Live Voice WS] Socket error:', err?.message || err);
    });

    authTimer = setTimeout(() => {
      if (!authenticated) closeUnauthenticated();
    }, 8000);

    const startSession = async (voiceName: string, topic: string, userName: string) => {
      try {
        const ai = getGemini();
        session = await ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: { disabled: false, prefixPaddingMs: 30, silenceDurationMs: 180 },
            },
            systemInstruction: `You are StudySnap Live AI, an encouraging real-time study companion speaking live with ${userName}.
Current study topic: ${topic}.
Do not invent claims about StudySnap's ownership, creator, company identity, or your own origins. If asked and the information is not provided by the application, say you do not have verified information.
You may use the control_app tool only to navigate to the allowed views provided by the application.
Provide concise, clear spoken explanations and yield immediately when the learner interrupts.`,
            tools: [{ functionDeclarations: [{
              name: 'control_app',
              description: 'Navigate to a StudySnap view.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  action: { type: 'STRING', description: 'The action to perform.' },
                  view: { type: 'STRING', description: 'The target StudySnap view identifier.' }
                },
                required: ['action', 'view']
              }
            }] }],
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;
              if (message.toolCall) clientWs.send(JSON.stringify({ type: 'tool_call', functionCalls: message.toolCall.functionCalls }));
              const content = message.serverContent;
              if (content?.inputTranscription?.text) clientWs.send(JSON.stringify({ type: 'user_transcript', text: content.inputTranscription.text }));
              if (content?.outputTranscription?.text) clientWs.send(JSON.stringify({ type: 'transcript', text: content.outputTranscription.text, sender: 'ai' }));
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts) for (const part of parts) {
                if (part.inlineData?.data) clientWs.send(JSON.stringify({ type: 'audio', audio: part.inlineData.data, mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000' }));
                if (part.text) clientWs.send(JSON.stringify({ type: 'transcript', text: part.text, sender: 'ai' }));
              }
              if (message.serverContent?.interrupted) clientWs.send(JSON.stringify({ type: 'interrupted' }));
              if (message.serverContent?.turnComplete) clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            },
            onerror: (err: any) => {
              console.warn('[Live Voice WS] Live session callback error:', err?.message || err);
              if (isConnected && clientWs.readyState === WebSocket.OPEN) clientWs.send(JSON.stringify({ type: 'live_unavailable', message: 'Live voice encountered an issue. Please reconnect.' }));
            },
            onclose: () => {
              if (isConnected && clientWs.readyState === WebSocket.OPEN) clientWs.send(JSON.stringify({ type: 'session_closed', message: 'Live voice session completed.' }));
            }
          },
        });

        if (clientWs.readyState === WebSocket.OPEN) clientWs.send(JSON.stringify({ type: 'session_ready', model: 'studysnap-live', voice: voiceName, status: 'connected' }));
      } catch (err: any) {
        console.warn('[Live Voice WS] Live API connect error:', err?.message || err);
        if (clientWs.readyState === WebSocket.OPEN) clientWs.send(JSON.stringify({ type: 'live_unavailable', message: 'Live voice is temporarily unavailable.' }));
      }
    };

    clientWs.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (!authenticated) {
          if (data.type !== 'auth' || typeof data.token !== 'string' || data.token.length < 20) {
            closeUnauthenticated();
            return;
          }
          const decoded = await admin.auth().verifyIdToken(data.token);
          authenticated = true;
          if (authTimer) clearTimeout(authTimer);
          const voiceName = typeof data.voice === 'string' && ALLOWED_VOICES.has(data.voice) ? data.voice : 'Zephyr';
          const topic = typeof data.topic === 'string' ? data.topic.trim().slice(0, MAX_TOPIC_LENGTH) || 'General Academic Studies' : 'General Academic Studies';
          const userName = typeof decoded.name === 'string' && decoded.name.trim()
            ? decoded.name.trim().slice(0, 100)
            : (typeof decoded.email === 'string' ? decoded.email.split('@')[0].slice(0, 100) : 'StudySnap learner');
          await startSession(voiceName, topic, userName);
          return;
        }

        if (!session) return;
        if (data.type === 'audio' && typeof data.audio === 'string') {
          const now = Date.now();
          if (now - audioWindowStarted >= AUDIO_WINDOW_MS) {
            audioWindowStarted = now;
            audioBytesInWindow = 0;
          }
          const audioBytes = Math.ceil(data.audio.length * 0.75);
          if (data.audio.length > 256000 || audioBytesInWindow + audioBytes > MAX_AUDIO_BYTES_PER_WINDOW) {
            return;
          }
          audioBytesInWindow += audioBytes;
          session.sendRealtimeInput({ audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' } });
        } else if (data.type === 'text' && typeof data.text === 'string') {
          const text = data.text.trim().slice(0, MAX_TEXT_LENGTH);
          if (text) session.sendRealtimeInput({ text });
        } else if (data.type === 'tool_response' && Array.isArray(data.functionResponses)) {
          const encoded = JSON.stringify(data.functionResponses);
          if (encoded.length > MAX_TOOL_RESPONSE_BYTES) return;
          session.send({ toolResponse: { functionResponses: data.functionResponses } });
        }
      } catch (e) {
        console.warn('[Live Voice WS] Error handling client packet:', e);
        if (!authenticated) closeUnauthenticated();
      }
    });
  });
}
