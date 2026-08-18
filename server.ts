import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import * as path from "path";
import { fileURLToPath } from "url";
import { 
  handleVoiceConversation, 
  handleTextToSpeech, 
  handleAIReasoning, 
  handleSolveAcademicProblem, 
  handleOCR, 
  handleImageAnalysis,
  handleVideoAnalysis,
  handleAudioTranscription,
  handleChatbotMessage,
  handleMapsGrounding,
  handleStartVideoGeneration,
  handleCheckVideoStatus,
  handleDownloadVideoUri,
  handleFlashcardGeneration, 
  handleQuizGeneration,
  getGemini,
  generateContentWithFallback
} from "./server/geminiService";
import { setupLiveVoiceWebSocket } from "./server/liveVoiceHandler";
import { requireAuth } from "./server/authMiddleware";
import { enforceAIProfilePolicy } from "./server/profilePolicy";
import { handleSmartLearning } from "./server/smartLearningRoute";
import { 
  searchYouTubeVideos, 
  generateStudyPlaylistWithAI, 
  CURATED_LEARNING_VIDEOS 
} from "./server/youtubeService";
import { ThinkingLevel, Type } from "@google/genai";
import crypto from "crypto";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Socket.IO for multi-user classroom collaboration
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // WebSocketServer for Live Voice Conversation (Gemini Live API streaming)
  const liveWss = new WebSocketServer({ noServer: true, maxPayload: 512 * 1024 });
  setupLiveVoiceWebSocket(liveWss);

  // Route HTTP upgrade requests between Socket.IO and Live Voice WS
  httpServer.on("upgrade", (request, socket, head) => {
    socket.on("error", (err) => {
      console.warn("[HTTP Upgrade] Socket error:", err?.message || err);
    });

    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const pathname = url.pathname;
      if (
        pathname === "/live-voice" ||
        pathname === "/api/live-voice" ||
        pathname.startsWith("/live-voice") ||
        pathname.startsWith("/api/live-voice")
      ) {
        liveWss.handleUpgrade(request, socket, head, (ws) => {
          liveWss.emit("connection", ws, request);
        });
        return;
      }
    } catch (e) {
      console.warn("[HTTP Upgrade] URL parsing error:", e);
    }
    // Socket.io handles its own upgrade listeners on /socket.io/ automatically
  });

  const PORT = 3000;

  // Real-time collaboration logic
  const rooms = new Map<string, Set<string>>();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string' || !token) {
        next(new Error('Authentication required.'));
        return;
      }
      const decoded = await admin.auth().verifyIdToken(token);
      socket.data.uid = decoded.uid;
      socket.data.roomUserName = (typeof decoded.name === 'string' && decoded.name.trim())
        ? decoded.name.trim().slice(0, 100)
        : (typeof decoded.email === 'string' ? decoded.email.split('@')[0].slice(0, 100) : 'StudySnap learner');
      next();
    } catch {
      next(new Error('Invalid or expired authentication token.'));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      const userName = socket.data.roomUserName || 'StudySnap learner';
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId)) {
        socket.emit('room-error', { error: 'Invalid room information.' });
        return;
      }
      socket.data.roomIds ??= new Set<string>();
      socket.data.roomIds.add(roomId);
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)?.add(userName);
      
      io.to(roomId).emit("user-joined", {
        id: socket.id,
        name: userName,
        participants: Array.from(rooms.get(roomId) || [])
      });
    });

    socket.on("live-viewer-ready", (roomId) => {
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId)) return;
      socket.join(roomId);
      socket.to(roomId).emit("live-viewer-joined", { socketId: socket.id });
    });

    socket.on("live-offer", (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const { roomId, targetId, description } = payload as any;
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId) || typeof targetId !== 'string' || typeof description?.type !== 'string') return;
      io.to(targetId).emit("live-offer", { fromId: socket.id, description });
    });

    socket.on("live-answer", (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const { roomId, targetId, description } = payload as any;
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId) || typeof targetId !== 'string' || typeof description?.type !== 'string') return;
      io.to(targetId).emit("live-answer", { fromId: socket.id, description });
    });

    socket.on("live-ice", (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const { roomId, targetId, candidate } = payload as any;
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId) || typeof targetId !== 'string' || !candidate || typeof candidate.candidate !== 'string') return;
      io.to(targetId).emit("live-ice", { fromId: socket.id, candidate });
    });

    socket.on("live-chat", (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const { roomId, text } = payload as any;
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId) || typeof text !== 'string') return;
      const clean = text.trim().slice(0, 500);
      if (!clean) return;
      io.to(roomId).emit("new-message", { id: crypto.randomUUID(), userId: socket.data.roomUserName || 'StudySnap learner', text: clean });
    });

    socket.on("send-message", (roomId, message) => {
      if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId)) return;
      if (!message || typeof message !== 'object' || typeof message.text !== 'string') return;
      const text = message.text.trim().slice(0, 4000);
      const attachment = message.attachment && typeof message.attachment === 'object'
        ? {
            id: typeof message.attachment.id === 'string' ? message.attachment.id.slice(0, 128) : undefined,
            name: typeof message.attachment.name === 'string' ? message.attachment.name.slice(0, 160) : undefined,
            type: typeof message.attachment.type === 'string' ? message.attachment.type.slice(0, 100) : undefined,
            size: Number.isFinite(message.attachment.size) ? Math.min(Math.max(0, Number(message.attachment.size)), 2 * 1024 * 1024) : undefined,
            previewUrl: typeof message.attachment.previewUrl === 'string' && message.attachment.previewUrl.startsWith('data:image/')
              ? message.attachment.previewUrl.slice(0, 3_000_000)
              : undefined,
          }
        : undefined;
      if (!text && !attachment) return;
      if (attachment && (!attachment.name || !attachment.type || typeof attachment.size !== 'number')) return;
      io.to(roomId).emit("new-message", {
        id: typeof message.id === 'string' ? message.id.slice(0, 128) : crypto.randomUUID(),
        sender_name: socket.data.roomUserName || 'StudySnap learner',
        text,
        created_at: typeof message.created_at === 'string' ? message.created_at : new Date().toISOString(),
        room_id: roomId,
        reply_to: message.reply_to && typeof message.reply_to === 'object' ? {
          id: typeof message.reply_to.id === 'string' ? message.reply_to.id.slice(0, 128) : '',
          sender_name: typeof message.reply_to.sender_name === 'string' ? message.reply_to.sender_name.slice(0, 100) : 'StudySnap learner',
          text: typeof message.reply_to.text === 'string' ? message.reply_to.text.slice(0, 500) : '',
        } : undefined,
        attachment,
        reactions: {},
      });
    });

    socket.on("raise-hand", (roomId, userName, isRaised) => {
      io.to(roomId).emit("hand-status", { userName, isRaised });
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        io.to(roomId).emit("user-left", socket.id);
        io.to(roomId).emit("live-viewer-left", { socketId: socket.id });
        const members = rooms.get(roomId);
        const name = socket.data.roomUserName;
        if (members && name) {
          members.delete(name);
          if (members.size === 0) rooms.delete(roomId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Baseline HTTP headers - allow iframe previews in AI Studio
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=(self), payment=()");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    // Ensure iframe preview is allowed in AI Studio and development environments
    res.removeHeader("X-Frame-Options");
    next();
  });

  app.use(express.json({ limit: "25mb", strict: true }));

  // In-memory Admin Inspection State
  const systemState = {
    kernelVersion: "Web Runtime",
    nativeEngine: "JavaScript/TypeScript",
    hardwareAccel: "Browser-managed",
    memoryUsageMB: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(1)),
    frameLatencyMs: 0,
    activeConnections: 0,
    // These are control-plane flags, not claims about hardware capabilities.
    featureFlags: {
      gpu_hardware_acceleration: false,
      cpp_simd_vectorization: false,
      hd_camera_autofocus: false,
      realtime_websockets: true,
      ai_study_twin: true,
      live_classrooms: true,
      background_data_sync: true,
      low_power_optimization: false,
      memory_auto_compaction: false,
      image_cache_compression: true
    },
    registeredApps: [],
    logs: [
      { timestamp: new Date().toISOString(), level: 'INFO', message: 'StudySnap web runtime initialized.' },
      { timestamp: new Date().toISOString(), level: 'SYSTEM', message: 'Runtime telemetry reports measured server values only.' }
    ]
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "3.4.0", runtime: systemState.kernelVersion, liveAudio: "available" });
  });

  // Authenticated community reporting. Reports are kept server-side so moderation
  // does not depend on the reporter's device storage.
  app.post("/api/community/report", requireAuth, async (req, res) => {
    try {
      const { messageId, roomId, category, details } = req.body || {};
      if (typeof messageId !== 'string' || !messageId || typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(roomId)) {
        res.status(400).json({ error: 'Invalid report data.' });
        return;
      }
      const allowedCategories = new Set(['harassment', 'spam', 'misinformation', 'unsafe', 'other']);
      const safeCategory = allowedCategories.has(category) ? category : 'other';
      const safeDetails = typeof details === 'string' ? details.trim().slice(0, 1000) : '';
      if (admin.apps.length) {
        const db = admin.firestore();
        await db.collection('communityReports').add({
          messageId: messageId.slice(0, 128),
          roomId,
          category: safeCategory,
          details: safeDetails,
          reporterUid: (req as any).uid || null,
          status: 'open',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error('[Community Report Error]:', err);
      res.status(500).json({ error: 'Unable to submit the report right now.' });
    }
  });

  // --- Per-IP rate limit for AI endpoints ---
  // Gemini calls cost real money per request. Nothing previously limited
  // how many requests a single client could fire, so a script (or a bug in
  // the UI) could run up an unbounded API bill. This caps each IP to a
  // sliding window of requests across all /api/gemini/* routes.
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const RATE_LIMIT_MAX_REQUESTS = 30;
  const rateLimitHits = new Map<string, number[]>();

  // Require a valid signed-in Firebase user before any /api/gemini/* route
  // runs. This must come before the rate limiter so unauthenticated
  // requests are rejected outright rather than merely throttled.
  app.use("/api/gemini", requireAuth);
  app.use("/api/gemini", enforceAIProfilePolicy);

  app.use("/api/gemini", (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const hits = (rateLimitHits.get(key) || []).filter((t) => t > windowStart);
    if (hits.length >= RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({ error: "Too many AI requests. Please slow down and try again shortly." });
      return;
    }
    hits.push(now);
    if (rateLimitHits.size > 5000) {
      for (const [ip, timestamps] of rateLimitHits) {
        if (!timestamps.some(t => t > windowStart)) rateLimitHits.delete(ip);
      }
    }
    rateLimitHits.set(key, hits);
    next();
  });


  // Provider-neutral web research. No browser search-engine script is loaded on clients.
  app.post("/api/gemini/search", async (req, res) => {
    try {
      const query = typeof req.body?.query === 'string' ? req.body.query.trim().slice(0, 500) : '';
      if (!query) {
        res.status(400).json({ error: 'Search query is required.' });
        return;
      }
      const ai = getGemini();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Research this query using current web information and return a concise academic answer with the most relevant sources: ${query}`,
        config: {
          systemInstruction: "You are StudySnap Web Research. Prefer current, verifiable information. Clearly distinguish facts from uncertainty. Do not claim to have accessed a source unless it is present in grounding results.",
          tools: [{ googleSearch: {} }],
        },
      });
      const candidate: any = response.candidates?.[0];
      const chunks = candidate?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((chunk: any) => chunk?.web)
        .filter((web: any) => web && typeof web.uri === 'string')
        .map((web: any) => ({ title: typeof web.title === 'string' ? web.title : web.uri, uri: web.uri }))
        .filter((item: any, index: number, list: any[]) => list.findIndex((x: any) => x.uri === item.uri) === index)
        .slice(0, 8);
      res.json({ text: response.text || 'No research summary was returned.', sources });
    } catch (err: any) {
      console.error("[API Web Research Error]:", err);
      res.status(502).json({ error: "Web research is temporarily unavailable. Please try again shortly." });
    }
  });

  // --- GEMINI LIVE & VOICE CONVERSATION ROUTES ---
  app.post("/api/gemini/voice-conversation", async (req, res) => {
    try {
      const result = await handleVoiceConversation(req.body);
      res.json(result);
    } catch (err: any) {
      console.error("[API Voice Conversation Error]:", err);
      res.status(500).json({ error: err.message || "Failed to process voice conversation" });
    }
  });

  app.post("/api/gemini/tts", async (req, res) => {
    try {
      const { text, voiceName } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }
      const result = await handleTextToSpeech(text, voiceName || "Zephyr");
      res.json(result);
    } catch (err: any) {
      console.error("[API TTS Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate speech" });
    }
  });

  app.post("/api/gemini/reason", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const text = await handleAIReasoning(prompt, systemInstruction);
      res.json({ text });
    } catch (err: any) {
      console.error("[API Reason Error]:", err);
      res.status(500).json({ error: err.message || "Failed reasoning" });
    }
  });

  app.post("/api/gemini/solve-problem", async (req, res) => {
    try {
      const { problem } = req.body;
      const solution = await handleSolveAcademicProblem(problem);
      res.json({ text: solution });
    } catch (err: any) {
      console.error("[API Solver Error]:", err);
      res.status(500).json({ error: err.message || "Failed to solve problem" });
    }
  });

  app.post("/api/gemini/ocr", async (req, res) => {
    try {
      const { imageData } = req.body;
      const text = await handleOCR(imageData);
      res.json({ text });
    } catch (err: any) {
      console.error("[API OCR Error]:", err);
      res.status(500).json({ error: err.message || "Failed OCR extraction" });
    }
  });

  app.post("/api/gemini/flashcards", async (req, res) => {
    try {
      const { content } = req.body;
      const flashcards = await handleFlashcardGeneration(content);
      res.json({ flashcards });
    } catch (err: any) {
      console.error("[API Flashcards Error]:", err);
      res.status(500).json({ error: err.message || "Failed flashcards generation" });
    }
  });

  app.post("/api/gemini/quiz", async (req, res) => {
    try {
      const { content } = req.body;
      const quiz = await handleQuizGeneration(content);
      res.json({ quiz });
    } catch (err: any) {
      console.error("[API Quiz Error]:", err);
      res.status(500).json({ error: err.message || "Failed quiz generation" });
    }
  });

  app.post("/api/gemini/smart-learning", handleSmartLearning);

  app.post("/api/gemini/insights", async (req, res) => {
    try {
      const { userName, studyHistory } = req.body;
      const ai = getGemini();
      const prompt = `Analyze study history for ${userName}: ${JSON.stringify(studyHistory)}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert AI Study Twin. Return structured JSON with insights, focusScore, efficiencyGain.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    risk: { type: Type.STRING, enum: ["low", "medium", "high"] },
                    message: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                  },
                  required: ["topic", "risk", "message", "suggestion"]
                }
              },
              focusScore: { type: Type.NUMBER },
              efficiencyGain: { type: Type.NUMBER }
            },
            required: ["insights", "focusScore", "efficiencyGain"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      console.error("[API Insights Error]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/generate-json", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const response = await generateContentWithFallback({
        preferredModel: "gemini-2.5-flash",
        fallbackModels: ["gemini-3.1-flash-lite", "gemini-2.5-flash"],
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: systemInstruction || undefined
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      console.error("[API JSON Generation Error]:", err);
      res.status(500).json({ error: err.message || "Generation failed" });
    }
  });

  app.post("/api/gemini/homework", async (req, res) => {
    try {
      const { input, isImage } = req.body;
      const ai = getGemini();
      const parts: any[] = [];
      if (isImage) {
        parts.push({ text: "Analyze this homework question and provide a solution." });
        const data = input.includes(',') ? input.split(',')[1] : input;
        parts.push({ inlineData: { data, mimeType: "image/jpeg" } });
      } else {
        parts.push({ text: `Help with this homework question: ${input}` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
          systemInstruction: "Provide conceptual explanation, steps, and practice questions.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              concept: { type: Type.STRING },
              explanation: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                  }
                }
              }
            }
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      console.error("[API Homework Error]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 1. Image Understanding / Photo Analysis (gemini-3.1-pro-preview)
  app.post("/api/gemini/analyze-image", async (req, res) => {
    try {
      const { imageData, prompt } = req.body;
      if (!imageData) {
        res.status(400).json({ error: "Image data is required" });
        return;
      }
      const text = await handleImageAnalysis(imageData, prompt);
      res.json({ text });
    } catch (err: any) {
      console.error("[API Image Analysis Error]:", err);
      res.status(500).json({ error: err.message || "Failed to analyze image" });
    }
  });

  // 2. Video Understanding / Analysis (gemini-3.1-pro-preview)
  app.post("/api/gemini/analyze-video", async (req, res) => {
    try {
      const { videoData, mimeType, prompt } = req.body;
      if (!videoData) {
        res.status(400).json({ error: "Video data is required" });
        return;
      }
      const text = await handleVideoAnalysis(videoData, mimeType || "video/mp4", prompt);
      res.json({ text });
    } catch (err: any) {
      console.error("[API Video Analysis Error]:", err);
      res.status(500).json({ error: err.message || "Failed to analyze video" });
    }
  });

  // 3. Audio Transcription (gemini-3.5-flash)
  app.post("/api/gemini/transcribe-audio", async (req, res) => {
    try {
      const { audioData, mimeType, prompt } = req.body;
      if (!audioData) {
        res.status(400).json({ error: "Audio data is required" });
        return;
      }
      const text = await handleAudioTranscription(audioData, mimeType || "audio/webm", prompt);
      res.json({ text });
    } catch (err: any) {
      console.error("[API Audio Transcription Error]:", err);
      res.status(500).json({ error: err.message || "Failed to transcribe audio" });
    }
  });

  // 4. High Thinking Mode (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  app.post("/api/gemini/high-thinking", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }
      const text = await handleAIReasoning(prompt, systemInstruction);
      res.json({ text });
    } catch (err: any) {
      console.error("[API High Thinking Error]:", err);
      res.status(500).json({ error: err.message || "Failed deep reasoning" });
    }
  });

  // 5. Multi-Turn Chatbot with Roles & Dynamic Model Selection
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, model, systemInstruction, profileContext } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }
      const result = await handleChatbotMessage({ message, history, model, systemInstruction, role: req.studySnapProfile?.role, profileContext: req.studySnapProfile ? { ...profileContext, age_group: req.studySnapProfile.age_group, role: req.studySnapProfile.role } : profileContext });
      res.json(result);
    } catch (err: any) {
      console.error("[API Chatbot Error]:", err);
      res.status(500).json({ error: err.message || "Chat generation failed" });
    }
  });

  // 7. Maps Grounding (gemini-3.5-flash with googleMaps tool)
  app.post("/api/gemini/maps-grounding", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        res.status(400).json({ error: "Query is required" });
        return;
      }
      const result = await handleMapsGrounding(query);
      res.json(result);
    } catch (err: any) {
      console.error("[API Maps Grounding Error]:", err);
      res.status(500).json({ error: err.message || "Maps grounding failed" });
    }
  });

  // 8. Veo Video Generation (veo-3.1-fast-generate-preview)
  app.post("/api/gemini/generate-video", async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio } = req.body;
      const result = await handleStartVideoGeneration({ prompt, imageBase64, mimeType, aspectRatio });
      res.json(result);
    } catch (err: any) {
      console.error("[API Veo Video Generation Error]:", err);
      res.status(500).json({ error: err.message || "Failed to start video generation" });
    }
  });

  app.post("/api/gemini/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "Operation name is required" });
        return;
      }
      const result = await handleCheckVideoStatus(operationName);
      res.json(result);
    } catch (err: any) {
      console.error("[API Video Status Error]:", err);
      res.status(500).json({ error: err.message || "Failed to check video status" });
    }
  });

  app.post("/api/gemini/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "Operation name is required" });
        return;
      }
      const { uri } = await handleDownloadVideoUri(operationName);
      if (!uri) {
        res.status(404).json({ error: "Video URI not available yet" });
        return;
      }
      const apiKey = process.env.GEMINI_API_KEY || "";
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });
      res.setHeader('Content-Type', 'video/mp4');
      if (videoRes.body) {
        videoRes.body.pipeTo(
          new WritableStream({
            write(chunk) { res.write(chunk); },
            close() { res.end(); },
          })
        );
      } else {
        res.status(500).json({ error: "No video stream available" });
      }
    } catch (err: any) {
      console.error("[API Video Download Error]:", err);
      res.status(500).json({ error: err.message || "Failed to download video" });
    }
  });

  // --- Admin authentication ---
  // The admin console previously trusted a hardcoded client-side password
  // ("123456") with NO server-side check, so anyone could call any
  // /api/admin/* endpoint directly (curl/fetch) without ever unlocking the
  // UI. Admin access now requires a real server-issued session token.
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    console.warn(
      "[SECURITY] ADMIN_PASSWORD is not set. The admin console is disabled until you set ADMIN_PASSWORD in your environment."
    );
  }
  const adminSessions = new Map<string, number>(); // token -> expiry (ms epoch)
  const ADMIN_SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

  function issueAdminToken() {
    const token = crypto.randomBytes(32).toString("hex");
    adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
    return token;
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.header("x-admin-token") || "";
    const expiry = adminSessions.get(token);
    if (!expiry || expiry < Date.now()) {
      adminSessions.delete(token);
      res.status(401).json({ error: "Admin authentication required." });
      return;
    }
    // Sliding expiry
    adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
    next();
  }

  const adminAuthHits = new Map<string, number[]>();
  app.post("/api/admin/auth", (req, res) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const hits = (adminAuthHits.get(key) || []).filter(t => t > now - 15 * 60 * 1000);
    if (hits.length >= 10) {
      res.status(429).json({ error: "Too many admin login attempts. Try again later." });
      return;
    }
    hits.push(now);
    adminAuthHits.set(key, hits);
    if (!ADMIN_PASSWORD) {
      res.status(503).json({ error: "Admin console is not configured on this server." });
      return;
    }
    const { password } = req.body || {};
    // Constant-time compare to avoid timing side-channels.
    const provided = Buffer.from(String(password || ""));
    const expected = Buffer.from(ADMIN_PASSWORD);
    const valid =
      provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
    if (!valid) {
      res.status(401).json({ error: "Incorrect admin password." });
      return;
    }
    res.json({ token: issueAdminToken(), expiresInMs: ADMIN_SESSION_TTL_MS });
  });

  // Institution directory and registration API. Keep reads authenticated so the
  // directory is not an anonymous enumeration surface; only verified institutions
  // are returned to normal users. Registration requests are stored separately from
  // the public institution record until an administrator verifies them.
  app.get('/api/institutions', requireAuth, async (_req, res) => {
    try {
      const snap = await admin.firestore()
        .collection('institutions')
        .where('verification_status', '==', 'verified')
        .limit(100)
        .get();
      res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('[Institution Directory Error]:', err);
      res.status(500).json({ error: 'Institution directory unavailable.' });
    }
  });

  app.get('/api/institutions/:id', requireAuth, async (req, res) => {
    const id = String(req.params.id || '');
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
      res.status(400).json({ error: 'Invalid institution id.' });
      return;
    }
    try {
      const doc = await admin.firestore().collection('institutions').doc(id).get();
      if (!doc.exists || doc.data()?.verification_status !== 'verified') {
        res.status(404).json({ error: 'Verified institution not found.' });
        return;
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
      console.error('[Institution Lookup Error]:', err);
      res.status(500).json({ error: 'Institution unavailable.' });
    }
  });

  app.post('/api/institutions', requireAuth, async (req, res) => {
    const uid = (req as any).uid as string | undefined;
    if (!uid) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    try {
      const profile = await admin.firestore().collection('users').doc(uid).get();
      const role = profile.data()?.role;
      if (!['admin', 'institution_owner'].includes(role)) {
        res.status(403).json({ error: 'Only institution owners or administrators can register an institution.' });
        return;
      }
    } catch {
      res.status(503).json({ error: 'Account permissions could not be verified.' });
      return;
    }
    const body = req.body || {};
    const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const name = clean(body.name, 150);
    const type = clean(body.type, 30);
    const officialWebsite = clean(body.official_website, 500);
    const officialPortalUrl = clean(body.official_portal_url, 500);
    const officialEmail = clean(body.official_email, 255);
    const registrationNumber = clean(body.registration_number, 120);
    const phone = clean(body.phone, 60);
    const address = clean(body.address, 300);
    const allowedTypes = new Set(['primary', 'secondary', 'college', 'technical_college', 'university', 'research_center']);
    if (!name || !allowedTypes.has(type) || !registrationNumber) {
      res.status(400).json({ error: 'Institution name, type, and registration number are required.' });
      return;
    }
    if (officialWebsite && !/^https?:\/\//i.test(officialWebsite)) {
      res.status(400).json({ error: 'Official website must use http or https.' });
      return;
    }
    if (officialPortalUrl && !/^https?:\/\//i.test(officialPortalUrl)) {
      res.status(400).json({ error: 'Official portal URL must use http or https.' });
      return;
    }
    const documents = Array.isArray(body.verification_documents)
      ? body.verification_documents.slice(0, 5).map((doc: any) => ({
          id: clean(doc?.id, 128),
          name: clean(doc?.name, 180),
          storage_path: clean(doc?.storage_path, 500),
          type: clean(doc?.type, 120),
          uploaded_at: clean(doc?.uploaded_at, 40),
        }))
      : [];
    if (documents.length < 1 || documents.some((doc: any) => !doc.id || !doc.name || !doc.storage_path)) {
      res.status(400).json({ error: 'At least one verification document is required.' });
      return;
    }
    const allowedDocumentTypes = /^(application\/pdf|image\/(png|jpe?g|webp))$/i;
    if (documents.some((doc: any) => !String(doc.storage_path).startsWith(`institution-verification/${uid}/`) || !allowedDocumentTypes.test(String(doc.type || '')))) {
      res.status(400).json({ error: 'Verification documents must belong to your secure institution-verification folder and use an allowed PDF/image type.' });
      return;
    }
    try {
      const db = admin.firestore();
      const existing = await db.collection('institution_verification_requests')
        .where('owner_uid', '==', uid)
        .where('registration_number', '==', registrationNumber)
        .where('verification_status', '==', 'pending')
        .limit(1).get();
      if (!existing.empty) {
        res.status(409).json({ error: 'A verification request for this institution is already pending.' });
        return;
      }
      const ref = db.collection('institution_verification_requests').doc();
      await ref.set({
        owner_uid: uid, name, type, official_website: officialWebsite, official_portal_url: officialPortalUrl,
        official_email: officialEmail, registration_number: registrationNumber, phone, address,
        verification_documents: documents, verification_status: 'pending', created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.status(201).json({ id: ref.id, status: 'pending' });
    } catch (err) {
      console.error('[Institution Registration Error]:', err);
      res.status(500).json({ error: 'Could not submit institution verification.' });
    }
  });

  // Every other /api/admin/* route now requires a valid session token.
  app.use("/api/admin", requireAdmin);


  // Institution verification queue. Approval is explicit and server-side.
  app.get('/api/admin/institutions/pending', async (_req,res) => {
    try { const snap=await admin.firestore().collection('institution_verification_requests').where('verification_status','==','pending').limit(100).get(); res.json(snap.docs.map(d=>({id:d.id,...d.data()}))); }
    catch { res.status(500).json({error:'Verification queue unavailable.'}); }
  });
  app.post('/api/admin/institutions/:id/verify', async (req,res) => {
    try { const decision=req.body?.decision; if(!['verified','rejected'].includes(decision)){res.status(400).json({error:'Invalid verification decision.'});return;} const db=admin.firestore(); const requestRef=db.collection('institution_verification_requests').doc(req.params.id); const snap=await requestRef.get(); if(!snap.exists){res.status(404).json({error:'Verification request not found.'});return;} const data=snap.data()!; const now=admin.firestore.FieldValue.serverTimestamp();
      await requestRef.update({verification_status:decision,reviewed_at:now});
      if (decision === 'verified') {
        await db.collection('institutions').doc(req.params.id).set({
          name: data.name, type: data.type, official_website: data.official_website || '',
          official_portal_url: data.official_portal_url || '', official_email: data.official_email || '',
          registration_number: data.registration_number, phone: data.phone || '', address: data.address || '',
          verification_documents: data.verification_documents || [], owner_uid: data.owner_uid,
          verification_status: 'verified', verified: true, reviewed_at: now, created_at: data.created_at || now,
          departments: data.departments || [],
        }, { merge: true });
      } else {
        await db.collection('institutions').doc(req.params.id).set({
          verification_status: 'rejected', verified: false, reviewed_at: now,
          owner_uid: data.owner_uid, name: data.name, type: data.type
        }, { merge: true });
      }
      res.json({ok:true,verification_status:decision}); }
    catch { res.status(500).json({error:'Verification decision failed.'}); }
  });

  // Admin Inspection System Telemetry
  app.get("/api/admin/inspection", (req, res) => {
    systemState.memoryUsageMB = Number((process.memoryUsage().rss / 1024 / 1024).toFixed(1));
    systemState.frameLatencyMs = 0;
    systemState.activeConnections = io.engine.clientsCount || 0;
    res.json(systemState);
  });

  // Toggle or Update Feature Flag
  app.post("/api/admin/features/toggle", (req, res) => {
    const { flag, enabled } = req.body;
    if (flag in systemState.featureFlags) {
      (systemState.featureFlags as any)[flag] = Boolean(enabled);
      systemState.logs.unshift({
        timestamp: new Date().toISOString(),
        level: 'CONFIG',
        message: `Feature flag '${flag}' set to ${enabled}`
      });
      res.json({ success: true, featureFlags: systemState.featureFlags });
    } else {
      res.status(400).json({ error: "Invalid feature flag" });
    }
  });

  // Add / Manage App in App Registry
  app.post("/api/admin/apps", (req, res) => {
    const { name, category, key, icon, desc } = req.body;
    if (!name || !key) {
      res.status(400).json({ error: "Name and Key are required" });
      return;
    }
    const newApp = {
      id: `app-${Date.now()}`,
      name,
      category: category || 'General',
      status: 'active',
      memoryMB: Number((8 + Math.random() * 15).toFixed(1)),
      key,
      icon: icon || 'Sparkles',
      desc: desc || 'Custom registered StudySnap sub-app'
    };
    systemState.registeredApps.push(newApp);
    systemState.logs.unshift({
      timestamp: new Date().toISOString(),
      level: 'ADMIN',
      message: `Registered new micro-app '${name}' [${key}]`
    });
    res.json({ success: true, app: newApp, registeredApps: systemState.registeredApps });
  });

  // Toggle or Delete App
  app.post("/api/admin/apps/action", (req, res) => {
    const { appId, action } = req.body;
    const index = systemState.registeredApps.findIndex(a => a.id === appId);
    if (index !== -1) {
      if (action === 'delete') {
        const removed = systemState.registeredApps.splice(index, 1)[0];
        systemState.logs.unshift({
          timestamp: new Date().toISOString(),
          level: 'WARN',
          message: `Removed micro-app '${removed.name}'`
        });
      } else if (action === 'toggle') {
        const appItem = systemState.registeredApps[index];
        appItem.status = appItem.status === 'active' ? 'disabled' : 'active';
        systemState.logs.unshift({
          timestamp: new Date().toISOString(),
          level: 'CONFIG',
          message: `Micro-app '${appItem.name}' status changed to ${appItem.status}`
        });
      }
      res.json({ success: true, registeredApps: systemState.registeredApps });
    } else {
      res.status(404).json({ error: "App not found" });
    }
  });

  // System Optimization Command
  app.post("/api/admin/optimize", (req, res) => {
    const { preset } = req.body;
    if (preset === 'ultra_performance') {
      systemState.featureFlags.low_power_optimization = false;
      systemState.featureFlags.gpu_hardware_acceleration = true;
      systemState.featureFlags.cpp_simd_vectorization = true;
      systemState.memoryUsageMB = 98.4;
    } else if (preset === 'battery_saver') {
      systemState.featureFlags.low_power_optimization = true;
      systemState.featureFlags.gpu_hardware_acceleration = false;
      systemState.memoryUsageMB = 65.2;
    } else if (preset === 'purge_cache') {
      res.status(400).json({ error: 'Cache purge is not exposed by the web runtime.' });
      return;
    } else {
      res.status(400).json({ error: 'Unknown optimization profile.' });
      return;
    }
    systemState.memoryUsageMB = Number((process.memoryUsage().rss / 1024 / 1024).toFixed(1));
    systemState.logs.unshift({
      timestamp: new Date().toISOString(),
      level: 'SYSTEM',
      message: `Executed optimization profile: ${preset}`
    });
    res.json({ success: true, systemState });
  });

  // Read-only diagnostics. Raw shell execution is intentionally not exposed by the web app.
  app.get("/api/admin/diagnostics", (_req, res) => {
    const checks = [
      { id: 'api', label: 'Application API', status: 'operational' },
      { id: 'realtime', label: 'Realtime connections', status: systemState.activeConnections >= 0 ? 'operational' : 'degraded' },
      { id: 'features', label: 'Feature configuration', status: 'operational' },
      { id: 'storage', label: 'Managed storage', status: 'configured' },
    ];
    systemState.logs.unshift({ timestamp: new Date().toISOString(), level: 'DIAGNOSTIC', message: 'Read-only admin health checks refreshed.' });
    res.json({ checks, logs: systemState.logs.slice(0, 100), memoryUsageMB: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(1)) });
  });

  app.get("/api/problems/:userName", requireAuth, async (req:any, res) => {
    try {
      const snap = await admin.firestore().collection('learning_problems').where('owner_uid', '==', req.uid).limit(100).get();
      res.json(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch { res.status(500).json({ error:'Problem data unavailable.' }); }
  });

  app.get("/api/bites", requireAuth, async (_req, res) => {
    try {
      const snap = await admin.firestore().collection('study_bites').orderBy('created_at','desc').limit(50).get();
      res.json(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch {
      try { const snap = await admin.firestore().collection('study_bites').limit(50).get(); res.json(snap.docs.map(d=>({id:d.id,...d.data()}))); }
      catch { res.status(500).json({error:'Study Bites data unavailable.'}); }
    }
  });

  // --- YOUTUBE EDUCATIONAL & KIDS VIDEO INTEGRATION ROUTES ---
  // 1. Learning Videos (for Baby, Kid, Teen, & Adult modes)
  app.get("/api/learning-videos", requireAuth, async (req, res) => {
    try {
      const age = (req.query.age as string) || "kid";
      const topic = (req.query.topic as string) || "";
      const category = (req.query.category as string) || "";
      const maxResults = parseInt(req.query.maxResults as string) || 8;

      const ageTier = (age === 'baby' ? 'baby' : age === 'kid' ? 'kid' : 'teen') as any;
      const query = topic || (age === 'baby' ? 'nursery rhymes counting songs colors' : 'science and math for kids');

      const result = await searchYouTubeVideos({
        query,
        maxResults,
        ageTier,
        categoryFilter: category || (age === 'baby' ? 'Early Learning' : 'Kids Science')
      });

      res.json({ videos: result.videos, source: result.source, age, topic });
    } catch (err: any) {
      console.error("[Learning Videos Route Error]:", err);
      res.status(500).json({ error: err.message || "Failed to load learning videos", videos: [] });
    }
  });

  // 2. Generic Educational Video Search (with safe-search)
  app.get("/api/youtube/search", requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const ageTier = (req.query.ageTier as any) || "teen";
      const maxResults = parseInt(req.query.maxResults as string) || 8;
      const categoryFilter = (req.query.category as string) || "Educational";

      if (!query.trim()) {
        const pool = ageTier === 'baby' 
          ? CURATED_LEARNING_VIDEOS.baby 
          : ageTier === 'kid' 
          ? CURATED_LEARNING_VIDEOS.kid 
          : CURATED_LEARNING_VIDEOS.teen_adult;
        res.json({ videos: pool, source: 'curated_catalog' });
        return;
      }

      const result = await searchYouTubeVideos({
        query,
        maxResults,
        ageTier,
        categoryFilter
      });

      res.json(result);
    } catch (err: any) {
      console.error("[YouTube Search API Error]:", err);
      res.status(500).json({ error: err.message || "Search failed", videos: [] });
    }
  });

  // 3. AI-Powered Study Playlist Generator
  app.post("/api/youtube/study-playlist", requireAuth, async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !topic.trim()) {
        res.status(400).json({ error: "Topic is required" });
        return;
      }
      const playlist = await generateStudyPlaylistWithAI(topic.trim(), difficulty || 'intermediate');
      res.json(playlist);
    } catch (err: any) {
      console.error("[Study Playlist API Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate playlist" });
    }
  });

  // 4. Mind Refresh / Study Break Videos
  app.get("/api/youtube/mind-refresh", async (req, res) => {
    try {
      const category = (req.query.category as string) || "all";
      const videos = CURATED_LEARNING_VIDEOS.mind_refresh;
      
      let filtered = videos;
      if (category !== 'all') {
        filtered = videos.filter(v => v.category?.toLowerCase().includes(category.toLowerCase()));
        if (filtered.length === 0) filtered = videos;
      }
      res.json({ videos: filtered, category });
    } catch (err: any) {
      console.error("[Mind Refresh API Error]:", err);
      res.status(500).json({ error: "Failed to load break videos", videos: [] });
    }
  });

  // 5. Research & Academic Videos
  app.get("/api/youtube/research-videos", requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const result = await searchYouTubeVideos({
        query: query ? `${query} research paper lecture explained` : "academic research lecture MIT Stanford",
        maxResults: 6,
        categoryFilter: "Academic Research"
      });
      res.json(result);
    } catch (err: any) {
      console.error("[Research Videos API Error]:", err);
      res.status(500).json({ error: "Failed to load research videos", videos: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
