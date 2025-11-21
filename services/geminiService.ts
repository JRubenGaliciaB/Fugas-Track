import { GoogleGenAI } from "@google/genai";
import { DashboardStats, Leak } from "../types";

// Initialize Gemini API
// Note: In a production environment, ensure the key is not exposed to the client directly without proxy or restrictions.
// For this demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDashboardReport = async (stats: DashboardStats, recentLeaks: Leak[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "API Key not configured. Please set process.env.API_KEY to use AI insights.";
    }

    const prompt = `
      You are an expert urban infrastructure analyst for the city of Querétaro, Mexico.
      Analyze the following water leak data for the "Qro sin fugas" dashboard.
      
      Statistics:
      - Total Incidents: ${stats.total}
      - Active Leaks: ${stats.active}
      - Under Repair: ${stats.repairing}
      - Repaired: ${stats.repaired}
      - Average Repair Time: ${stats.avgRepairTimeHours.toFixed(1)} hours

      Recent Incident Sample (last 3):
      ${recentLeaks.slice(0, 3).map(l => `- [${l.status}] ${l.address} (Severity: ${l.severity})`).join('\n')}

      Provide a concise, professional executive summary (max 150 words) focusing on efficiency trends, critical zones, and recommended actions. Use a formal but modern tone. Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI analysis at this time. Please try again later.";
  }
};
