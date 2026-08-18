import { GoogleGenAI, ThinkingLevel } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Who won the last Super Bowl?",
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    console.log("2.5-flash works:", response.text ? "yes" : "no");
  } catch (e) {
    console.error("2.5-flash error:", e.message);
  }
}
test();
