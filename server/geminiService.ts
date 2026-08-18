import { GoogleGenAI, Modality, Type, ThinkingLevel, GenerateVideosOperation } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

/**
 * Resilient helper to generate content with automatic retries and model fallbacks
 * when Gemini API encounters temporary 503 high demand or 429 rate limit spikes.
 */
export async function generateContentWithFallback(params: {
  preferredModel?: string;
  fallbackModels?: string[];
  contents: any;
  config?: any;
  maxRetries?: number;
}): Promise<any> {
  const ai = getGemini();
  const preferred = params.preferredModel || "gemini-2.5-flash";
  const fallbacks = params.fallbackModels || ["gemini-3.1-flash-lite", "gemini-2.5-flash"];
  const candidateModels = [preferred, ...fallbacks.filter(m => m !== preferred)];
  const maxRetries = params.maxRetries ?? 2;

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || '');
        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("high demand") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("429") || 
                            errMsg.includes("RESOURCE_EXHAUSTED");
        
        console.warn(`[Gemini Request Retry] Model ${model} attempt ${attempt + 1}/${maxRetries} failed: ${errMsg.slice(0, 120)}`);
        
        if (isTransient && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(2, attempt) + Math.random() * 150));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini models are temporarily experiencing high demand.");
}

export interface VoiceConversationRequest {
  prompt?: string;
  userInput?: string;
  userAudioBase64?: string;
  mimeType?: string;
  history?: Array<any>;
  userName?: string;
  voiceName?: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Aoede' | string;
  topic?: string;
  currentTopic?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  studyMode?: 'free-chat' | 'socratic' | 'quiz-me' | 'explain-concept' | 'exam-prep';
  profileContext?: string;
}

export async function handleVoiceConversation(params: VoiceConversationRequest) {
  const ai = getGemini();
  const rawPrompt = params.prompt || params.userInput || "";
  const effectivePrompt = rawPrompt.trim() || (params.userAudioBase64 ? "Please listen to my voice and respond to my study question." : "Hello, I am ready to study with you.");
  
  const userName = params.userName || 'Student';
  const voiceName = (params.voiceName as any) || 'Zephyr';
  const topic = params.topic || params.currentTopic || 'General Academic Learning';
  const studyMode = params.studyMode || 'free-chat';

  let modeInstruction = "Be concise, pedagogical, warm, and highly engaging.";
  if (studyMode === 'socratic') {
    modeInstruction = "Guide the student through thoughtful Socratic questions rather than giving immediate answers directly. Make them think!";
  } else if (studyMode === 'quiz-me') {
    modeInstruction = "Quiz the student with one question at a time on the current topic. Evaluate their answer warmly and give constructive guidance.";
  } else if (studyMode === 'explain-concept') {
    modeInstruction = "Break down complex concepts with intuitive metaphors and simple analogies, highlighting practical examples.";
  } else if (studyMode === 'exam-prep') {
    modeInstruction = "Focus on high-yield exam insights, formula memorization tricks, and common pitfalls to avoid.";
  }

  const systemInstruction = `You are StudySnap Live AI, an enthusiastic, world-class real-time voice study companion speaking live with ${userName}.
Current Topic / Context: ${topic}.
Study Mode: ${studyMode}.
Pedagogical Rule: ${modeInstruction}

IMPORTANT VOICE SPOKEN RULES:
1. Speak naturally, warmly, and rhythmically like a top 1-on-1 human tutor.
2. Keep your replies concise and conversational (2-4 clear sentences per turn) so the audio is fast and conversational.
3. Avoid markdown tables, long bullet points, or complex code blocks in speech. Use plain spoken sentences.
4. If the student answers correctly, enthusiastically celebrate their progress before advancing!`;

  const profilePolicy = params.profileContext ? `\n\n${params.profileContext}` : '';
  const securedSystemInstruction = `${systemInstruction}${profilePolicy}`;

  // Format history safely for Chat API
  const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(params.history)) {
    for (const h of params.history.slice(-8)) {
      const text = (typeof h === 'string' ? h : h.text || h.content || h.parts?.[0]?.text || '').trim();
      if (text) {
        const role = h.role === 'ai' || h.role === 'model' ? 'model' : 'user';
        formattedHistory.push({
          role,
          parts: [{ text }]
        });
      }
    }
  }

  let explanationText = "Let's continue our study session!";

  try {
    if (params.userAudioBase64) {
      // Direct multimodal audio generateContent
      const audioData = params.userAudioBase64.includes(',') 
        ? params.userAudioBase64.split(',')[1] 
        : params.userAudioBase64;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { text: effectivePrompt },
            { inlineData: { data: audioData, mimeType: params.mimeType || "audio/webm" } }
          ]
        },
        config: { systemInstruction: securedSystemInstruction, temperature: 0.7 }
      });
      explanationText = response.text?.trim() || explanationText;
    } else {
      // Text chat turn
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: securedSystemInstruction,
          temperature: 0.7,
        },
        history: formattedHistory,
      });

      const textResponse = await chat.sendMessage({ message: effectivePrompt });
      explanationText = textResponse.text?.trim() || explanationText;
    }
  } catch (genErr: any) {
    console.error("[Gemini Chat/Generate Error]:", genErr);
    try {
      const fallbackRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: effectivePrompt,
        config: { systemInstruction }
      });
      explanationText = fallbackRes.text?.trim() || explanationText;
    } catch (fallbackErr) {
      console.error("[Gemini Fallback Error]:", fallbackErr);
      explanationText = `I understand your question about ${topic}. Let's dive right into that!`;
    }
  }

  // Synthesize audio with gemini-3.1-flash-tts-preview
  let base64Audio: string | null = null;
  try {
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: explanationText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
          },
        },
      },
    });

    base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (ttsErr) {
    console.warn("[Gemini TTS] TTS Generation warning:", ttsErr);
  }

  return {
    text: explanationText,
    audio: base64Audio,
    mimeType: "audio/wav",
    voiceName,
    timestamp: new Date().toISOString(),
  };
}

export async function handleTextToSpeech(text: string, voiceName: string = 'Zephyr') {
  const ai = getGemini();
  const ttsResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: (voiceName as any) || 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  return { audio: base64Audio, voiceName };
}

// 1. High Thinking Mode (model: gemini-3.1-pro-preview, thinkingLevel: ThinkingLevel.HIGH, no maxOutputTokens)
export async function handleAIReasoning(prompt: string, systemInstruction?: string) {
  const ai = getGemini();
  const finalSystemInstruction = systemInstruction || "You are an elite academic tutor with deep analytical reasoning. Do not invent product ownership or user qualifications.";
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: finalSystemInstruction,
    },
  });
  return response.text;
}

// 2. Image Understanding & Analysis (model: gemini-3.1-pro-preview)
export async function handleImageAnalysis(imageData: string, prompt?: string) {
  const ai = getGemini();
  const data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
  const mimeType = imageData.includes('image/png') ? 'image/png' : 'image/jpeg';
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { text: prompt || "Analyze this image thoroughly. Extract all text, equations, diagrams, key concepts, and provide a clear, structured explanation with practical examples." },
        { inlineData: { data, mimeType } }
      ]
    },
    config: {
      systemInstruction: "You are a world-class visual academic analyzer. Provide comprehensive breakdowns of formulas, diagrams, text, and concepts."
    }
  });
  return response.text;
}

// 3. Video Understanding & Analysis (model: gemini-3.1-pro-preview)
export async function handleVideoAnalysis(videoData: string, mimeType: string = "video/mp4", prompt?: string) {
  const ai = getGemini();
  const data = videoData.includes(',') ? videoData.split(',')[1] : videoData;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { text: prompt || "Analyze this video for key academic information. Provide: 1. Executive Summary, 2. Key Concepts & Timestamps, 3. Important Takeaways, 4. Actionable Study Questions." },
        { inlineData: { data, mimeType } }
      ]
    },
    config: {
      systemInstruction: "You are an expert academic video analyst. Extract deep insights, timestamps, concepts, and structure notes clearly."
    }
  });
  return response.text;
}

// 4. Audio Transcription (model: gemini-3.5-flash)
export async function handleAudioTranscription(audioData: string, mimeType: string = "audio/webm", prompt?: string) {
  const ai = getGemini();
  const data = audioData.includes(',') ? audioData.split(',')[1] : audioData;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { text: prompt || "Transcribe the following spoken audio accurately into text. Format with punctuation, paragraph breaks, and timestamps if multiple speakers or pauses occur." },
        { inlineData: { data, mimeType } }
      ]
    },
    config: {
      systemInstruction: "You are a high-accuracy academic transcription engine. Return faithful, clean transcription with proper formatting."
    }
  });
  return response.text;
}

// 5. Multi-Turn Chatbot with Roles & Dynamic Model Selection
export async function handleChatbotMessage(params: {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts?: Array<{ text: string }>; text?: string; content?: string }>;
  model?: 'deep' | 'fast' | string;
  systemInstruction?: string;
  role?: string;
  profileContext?: string;
}) {
  const ai = getGemini();
  const selectedModel = params.model === 'deep'
    ? (process.env.STUDYSNAP_REASONING_MODEL || 'gemini-2.5-flash')
    : (process.env.STUDYSNAP_FAST_MODEL || 'gemini-2.5-flash');
  
  let sysInstruction = params.systemInstruction || "You are an empathetic, world-class academic AI tutor for StudySnap.";
  if (params.role === 'socratic') {
    sysInstruction = "You are a Socratic Professor. Guide students to uncover answers through questioning rather than direct lecturing.";
  } else if (params.role === 'stem') {
    sysInstruction = "You are a STEM & Mathematics Specialist. Provide rigorous proofs, step-by-step calculations, and intuitive physical interpretations.";
  } else if (params.role === 'exam-coach') {
    sysInstruction = "You are a High-Yield Exam Prep Coach. Highlight key test-taking strategies, formulas, memorization mnemonics, and pitfall warnings.";
  }

  const profilePolicy = params.profileContext ? `\n\n${params.profileContext}` : "";
  sysInstruction += profilePolicy;

  const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(params.history)) {
    for (const h of params.history) {
      const text = (typeof h === 'string' ? h : h.text || h.content || h.parts?.[0]?.text || '').trim();
      if (text) {
        const role = (h.role as string) === 'ai' || (h.role as string) === 'model' ? 'model' : 'user';
        formattedHistory.push({
          role,
          parts: [{ text }]
        });
      }
    }
  }

  const chat = ai.chats.create({
    model: selectedModel,
    config: {
      systemInstruction: sysInstruction,
      temperature: 0.7,
    },
    history: formattedHistory,
  });

  const response = await chat.sendMessage({ message: params.message });
  return {
    text: response.text || "No response generated.",
    modelUsed: selectedModel,
  };
}

// 7. Maps Grounding (model: gemini-3.5-flash with googleMaps tool)
export async function handleMapsGrounding(query: string) {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      systemInstruction: "You are an academic campus and study spot location assistant with Google Maps grounding. Provide location details, addresses, and maps references."
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources = chunks?.map((c: any) => ({
    title: c.web?.title || c.maps?.title || "Google Maps Location",
    url: c.web?.uri || c.maps?.uri || "#"
  })) || [];

  return {
    text: response.text || "No map results found.",
    sources
  };
}

// 8. Veo Video Generation (model: veo-3.1-fast-generate-preview or veo-3.1-lite-generate-preview)
export async function handleStartVideoGeneration(params: {
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio?: '16:9' | '9:16';
}) {
  const ai = getGemini();
  const prompt = params.prompt || "Animate this academic illustration smoothly with cinematic visual explanation";
  const aspectRatio = params.aspectRatio || '16:9';

  let config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio
  };

  let operation;
  if (params.imageBase64) {
    const data = params.imageBase64.includes(',') ? params.imageBase64.split(',')[1] : params.imageBase64;
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: {
        imageBytes: data,
        mimeType: params.mimeType || 'image/jpeg'
      },
      config
    });
  } else {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config
    });
  }

  return { operationName: operation.name };
}

export async function handleCheckVideoStatus(operationName: string) {
  const ai = getGemini();
  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });
  return {
    done: updated.done,
    error: updated.error || null,
    hasVideo: !!updated.response?.generatedVideos?.[0]?.video?.uri
  };
}

export async function handleDownloadVideoUri(operationName: string) {
  const ai = getGemini();
  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });
  const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
  return { uri, done: updated.done };
}

export async function handleSolveAcademicProblem(problem: string) {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: problem,
    config: {
      systemInstruction: "You are a world-class academic tutor. Solve the problem step-by-step with clear mathematical reasoning and explanations.",
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
}

export async function handleOCR(imageData: string) {
  return handleImageAnalysis(imageData, "Extract all text from this study note image, structure formulas, math equations, and bullet points clearly.");
}

export async function handleFlashcardGeneration(content: string) {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate 5 high-yield flashcards (Question/Answer) from this content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function handleQuizGeneration(content: string) {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a 5-question multiple choice quiz from this content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

