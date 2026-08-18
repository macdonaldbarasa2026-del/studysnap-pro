import { ResearchResult } from "../types";
import { auth } from "../lib/firebase";
import type { UserProfile } from "../types";
import { buildAIProfileContext } from "../lib/aiProfile";

// Helper for making server API requests
async function postApi(endpoint: string, data: any) {
  try {
    // The server now requires a valid Firebase ID token on every
    // /api/gemini/* call (previously these were only rate-limited by IP,
    // with no check on who was calling). Guest/anonymous sign-in still
    // works since it produces a real Firebase user and token.
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You need to be signed in to use AI features.");
    }
    const token = await user.getIdToken();
    const res = await fetch(`/api/gemini/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error for /api/gemini/${endpoint}:`, error);
    throw error;
  }
}

export const getAIReasoning = async (prompt: string, systemInstruction?: string) => {
  try {
    const data = await postApi("reason", { prompt, systemInstruction });
    return data.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Reason Error:", error);
    return "I'm sorry, I'm having trouble reasoning right now.";
  }
};

export const getStudyInsights = async (userName: string, studyHistory: any[]) => {
  try {
    return await postApi("insights", { userName, studyHistory });
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};

export const solveAcademicProblem = async (problem: string) => {
  try {
    const data = await postApi("solve-problem", { problem });
    return data.text || "I'm sorry, I couldn't solve that problem.";
  } catch (error) {
    console.error("Gemini Solver Error:", error);
    return "I'm sorry, I couldn't solve that problem.";
  }
};

export const performOCR = async (imageData: string) => {
  try {
    const data = await postApi("ocr", { imageData });
    return data.text || "Failed to extract text.";
  } catch (error) {
    console.error("OCR Error:", error);
    return "Failed to extract text.";
  }
};

export const generateSummary = async (content: string) => {
  try {
    const data = await postApi("reason", { 
      prompt: `Summarize the following content into key bullet points: ${content}`,
      systemInstruction: "You are an expert summarizer. Return concise, high-value bullet points."
    });
    return data.text;
  } catch (error) {
    console.error("Summary Error:", error);
    return "Failed to generate summary.";
  }
};

export const generateFlashcards = async (content: string) => {
  try {
    const data = await postApi("flashcards", { content });
    return data.flashcards || [];
  } catch (error) {
    console.error("Flashcard Error:", error);
    return [];
  }
};

export const generateQuiz = async (content: string) => {
  try {
    const data = await postApi("quiz", { content });
    return data.quiz || [];
  } catch (error) {
    console.error("Quiz Error:", error);
    return [];
  }
};

export const performWebSearch = async (query: string): Promise<ResearchResult> => {
  try {
    return await postApi("search", { query });
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Search failed.", sources: [] };
  }
};

export const generateHomeworkHelp = async (input: string, isImage: boolean = false) => {
  try {
    return await postApi("homework", { input, isImage });
  } catch (error) {
    console.error("Homework Error:", error);
    return null;
  }
};

export const generateStudyPlan = async (userName: string, goals: string) => {
  try {
    const data = await postApi("reason", {
      prompt: `Generate a structured daily study plan for ${userName} with goals: ${goals}`,
      systemInstruction: "Create a rich, structured study schedule with task name, duration (mins), and type."
    });
    return { plan: data.text, tasks: [] };
  } catch (error) {
    console.error("Study Plan Error:", error);
    return { tasks: [] };
  }
};

export const generateCoachInsights = async (userName: string, performanceData: any) => {
  try {
    const data = await postApi("insights", { userName, studyHistory: performanceData });
    return data?.insights || [];
  } catch (error) {
    console.error("Coach Error:", error);
    return [];
  }
};

export const processVoiceConversation = async (params: {
  prompt?: string;
  userInput?: string;
  userAudioBase64?: string;
  mimeType?: string;
  history?: Array<{ role: string; text?: string; content?: string }>;
  voiceName?: string;
  userName?: string;
  topic?: string;
  currentTopic?: string;
  studyMode?: string;
}) => {
  return await postApi("voice-conversation", {
    prompt: params.prompt || params.userInput,
    userInput: params.userInput || params.prompt,
    ...params,
  });
};

export const requestTextToSpeech = async (text: string, voiceName: string = "Zephyr") => {
  return await postApi("tts", { text, voiceName });
};

export const analyzeImageWithGemini = async (imageData: string, prompt?: string) => {
  try {
    const data = await postApi("analyze-image", { imageData, prompt });
    return data.text || "No analysis available.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
};

export const analyzeVideoWithGemini = async (videoData: string, mimeType: string = "video/mp4", prompt?: string) => {
  try {
    const data = await postApi("analyze-video", { videoData, mimeType, prompt });
    return data.text || "No video analysis available.";
  } catch (error) {
    console.error("Video Analysis Error:", error);
    throw error;
  }
};

export const transcribeAudioWithGemini = async (audioData: string, mimeType: string = "audio/webm", prompt?: string) => {
  try {
    const data = await postApi("transcribe-audio", { audioData, mimeType, prompt });
    return data.text || "No transcription generated.";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};

export const getHighThinkingReasoning = async (prompt: string, systemInstruction?: string) => {
  try {
    const data = await postApi("high-thinking", { prompt, systemInstruction });
    return data.text || "No response generated.";
  } catch (error) {
    console.error("High Thinking Error:", error);
    throw error;
  }
};

export const sendGeminiChatMessage = async (params: {
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts?: Array<{ text: string }>; text?: string; content?: string }>;
  model?: 'deep' | 'fast';
  role?: string;
  systemInstruction?: string;
  userProfile?: UserProfile | null;
}) => {
  try {
    const { userProfile, ...request } = params;
    return await postApi("chat", {
      ...request,
      profileContext: buildAIProfileContext(userProfile || null, request.role ? `AI role: ${request.role}` : undefined),
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    throw error;
  }
};


export const mapsGroundingWithGemini = async (query: string) => {
  try {
    return await postApi("maps-grounding", { query });
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "Maps grounding failed.", sources: [] };
  }
};

export const startVeoVideoGeneration = async (params: {
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio?: '16:9' | '9:16';
}) => {
  try {
    return await postApi("generate-video", params);
  } catch (error) {
    console.error("Veo Video Generation Error:", error);
    throw error;
  }
};

export const checkVeoVideoStatus = async (operationName: string) => {
  try {
    return await postApi("video-status", { operationName });
  } catch (error) {
    console.error("Video Status Error:", error);
    throw error;
  }
};

