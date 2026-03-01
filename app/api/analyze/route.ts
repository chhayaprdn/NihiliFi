import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { transactions, calendarEvents } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
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
    "leakPercentage": number (% of overspending attributable to primary leak)
  },
  "calendarCorrelations": [
    {
      "pattern": "string describing the correlation",
      "evidence": "specific data point supporting this",
      "estimatedCost": "dollar amount"
    }
  ],
  "kmScore": number between 0 and 70 (0 = financially healthy/at ocean, 70 = financially doomed/at mountains),
  "weeklyAvgOverspend": number in dollars,
  "forwardLookingWarning": "1-2 sentences about what's coming next based on their calendar if available, or their pattern",
  "herzogNarration": "A 150-200 word Werner Herzog-style narration of their financial situation. Dark, philosophical, poetic, with Herzog's characteristic mix of doom and strange wonder. Reference the penguin and the mountains. Do NOT be generic — reference their actual patterns. End with something quietly devastating.",
  "weekSummary": "One brutal but darkly funny sentence summarizing their financial week"
}

Rules for the herzogNarration:
- Write as Werner Herzog would narrate a nature documentary about a doomed animal
- Reference their ACTUAL spending patterns (e.g. DoorDash, Uber, coffee, subscriptions)
- Philosophical but specific — not generic finance advice
- Tone: calm, melancholic, slightly absurd, never angry
- Example opener style: "Here we observe the social spender in their natural habitat..."
- End with something like: "And still, the penguin walks."
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
