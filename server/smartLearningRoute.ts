import { Request, Response } from "express";
import { getGemini } from "./geminiService";
import { Type } from "@google/genai";

export async function handleSmartLearning(req: Request, res: Response) {
  try {
    const { profile, activity } = req.body;
    const ai = getGemini();
    const prompt = `Based on the following user profile and recent activity, generate a personalized daily study plan and learning recommendations.
    
Profile: ${JSON.stringify(profile)}
Recent Activity: ${JSON.stringify(activity)}

Create 4 realistic study tasks and 3 personalized recommendations based on their age group, role, and past interests/activity. Make it encouraging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studyPlan: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                user_name: { type: Type.STRING },
                date: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["review", "practice", "quiz", "game"] },
                      duration: { type: Type.INTEGER },
                      completed: { type: Type.BOOLEAN }
                    },
                    required: ["id", "title", "description", "type", "duration", "completed"]
                  }
                }
              },
              required: ["id", "user_name", "date", "tasks"]
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  user_name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["topic", "habit", "resource"] },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  created_at: { type: Type.STRING }
                },
                required: ["id", "title", "description", "type", "priority"]
              }
            }
          },
          required: ["studyPlan", "recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Default fallback if generation fails
    if (!data.studyPlan || !data.recommendations) {
      throw new Error("Invalid structure from AI");
    }

    res.json(data);
  } catch (error: any) {
    console.error("Smart Learning AI Error:", error);
    res.status(500).json({ error: error.message });
  }
}
