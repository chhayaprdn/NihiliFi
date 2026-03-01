import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getGeminiModel() {
  return gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export function buildAnalysisPrompt(transactions: any[], calendarEvents: any[]) {
  return `
You are the financial analysis engine for NihiliFi, a personal finance app narrated in the style of Werner Herzog's documentary "Encounters at the End of the World." 

The app features a lone penguin who walks toward certain death (70km inland from the ocean). Financial decisions move the penguin: overspending walks him further inland, good decisions bring him back.

Analyze the following transaction history and calendar events. Return ONLY valid JSON with no markdown formatting.

TRANSACTION HISTORY:
${JSON.stringify(transactions.slice(0, 150), null, 2)}

CALENDAR EVENTS:
${JSON.stringify(calendarEvents.slice(0, 100), null, 2)}

Return this exact JSON structure:

{
  "behavioralFingerprint": {
    "type": "string (e.g. 'Social Spender', 'Stress Buyer', 'Subscription Hoarder', 'Calendar Eater')",
    "description": "2-3 sentences describing their specific financial personality",
    "primaryLeak": "The single biggest spending pattern that costs them money",
    "leakPercentage": number
  },
  "calendarCorrelations": [
    {
      "pattern": "string describing the correlation",
      "evidence": "specific data point supporting this",
      "estimatedCost": "dollar amount"
    }
  ],
  "kmScore": number between 0 and 70,
  "weeklyAvgOverspend": number in dollars,
  "forwardLookingWarning": "1-2 sentences about what's coming next",
  "herzogNarration": "A 150-200 word Werner Herzog-style narration of their financial situation",
  "weekSummary": "One brutal but darkly funny sentence summarizing their financial week"
}
`;
}
