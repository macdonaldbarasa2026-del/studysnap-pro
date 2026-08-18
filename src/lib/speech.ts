import { requestTextToSpeech } from '../services/gemini';

let currentAudio: HTMLAudioElement | null = null;
let currentSynthUtterance: SpeechSynthesisUtterance | null = null;

export const getStoredSpeechRate = (): number => {
  if (typeof window === 'undefined') return 1.0;
  const saved = localStorage.getItem('ai_speech_rate');
  return saved ? parseFloat(saved) : 1.0;
};

export const setStoredSpeechRate = (rate: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ai_speech_rate', rate.toString());
  }
};

export const stopAiVoice = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      console.warn("Audio pause error:", e);
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("SpeechSynthesis cancel error:", e);
    }
    currentSynthUtterance = null;
  }
};

export const playAiVoice = async (
  text: string, 
  voiceName: string = 'Zephyr',
  onStart?: () => void,
  onEnd?: () => void,
  customRate?: number
): Promise<boolean> => {
  if (!text || !text.trim()) return false;
  
  const speechRate = customRate ?? getStoredSpeechRate();

  // Clean text from markdown formatting for cleaner speech synthesis
  const cleanText = text
    .replace(/[#*_`~>[\]]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  stopAiVoice();

  if (onStart) onStart();

  try {
    // 1. Try StudySnap natural voice service
    const response = await requestTextToSpeech(cleanText, voiceName);
    
    if (response && response.audio) {
      const audioBlob = b64toBlob(response.audio, response.mimeType || 'audio/wav');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = speechRate;

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        currentAudio = null;
        // Fallback to browser synthesis
        speakWithBrowserSynthesis(cleanText, speechRate, onEnd);
      };

      await audio.play();
      return true;
    } else {
      // Fallback
      return speakWithBrowserSynthesis(cleanText, speechRate, onEnd);
    }
  } catch (err) {
    console.warn("[AI Voice Playback Warning, falling back to Web Speech]:", err);
    return speakWithBrowserSynthesis(cleanText, speechRate, onEnd);
  }
};

const speakWithBrowserSynthesis = (text: string, rate: number, onEnd?: () => void): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    currentSynthUtterance = utterance;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')) && v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      currentSynthUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      currentSynthUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error("Browser speech synthesis failed:", e);
    if (onEnd) onEnd();
    return false;
  }
};

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
