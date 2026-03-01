# NihiliFi — Cursor Pro Build Guide
> "Neither ocean nor colony."
> A personal finance app narrated by a nihilistic penguin who knows you're doomed anyway.

---

## Project Overview

**App Name:** NihiliFi
**Theme:** Mountain Madness 2026 — Dr. Jekyll / Mr. Hyde
**Prize Tracks Being Targeted:**
- RBC Custom Challenge (Personal Finance Platform)
- Best Mr. Hyde OR Best Dr. Jekyll (walks the line — funny wrapper, serious engine)
- Best Solo Hack
- MLH Best Use of ElevenLabs
- MLH Best Use of Gemini API
- MLH Best Use of DigitalOcean (deployment)

**Core Concept:**
NihiliFi is a behavioral finance app that analyzes the intersection of your calendar and your spending to find hidden patterns in your financial life — then narrates them back to you in the voice of Werner Herzog, as the nihilistic penguin walks toward the mountains. Every financial decision moves the penguin. Bad decisions walk him further inland. Good ones turn him around. At 70KM, he's gone.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| AI Analysis | Google Gemini 1.5 Pro API |
| Voice Narration | ElevenLabs API |
| Deployment | DigitalOcean App Platform |
| Styling | Tailwind CSS |
| Data | LocalStorage + in-memory (no database needed) |

---

## File Structure

```
nihilifi/
├── app/
│   ├── page.tsx                    # Intro screen (penguin splash)
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard with penguin tracker
│   ├── upload/
│   │   └── page.tsx                # CSV upload + calendar input
│   ├── report/
│   │   └── page.tsx                # Weekly Herzog narration report
│   └── layout.tsx                  # Root layout with Antarctic theme
├── components/
│   ├── PenguinWalker.tsx           # Animated penguin component
│   ├── TransactionLog.tsx          # Spend logger
│   ├── HerzogNarration.tsx         # ElevenLabs audio player + transcript
│   ├── KMCounter.tsx               # Distance tracker display
│   └── SpendingGraph.tsx           # Visual spending vs calendar chart
├── api/
│   ├── analyze/route.ts            # Gemini analysis endpoint
│   ├── narrate/route.ts            # ElevenLabs TTS endpoint
│   └── report/route.ts             # Weekly report generation endpoint
├── lib/
│   ├── gemini.ts                   # Gemini client + prompts
│   ├── elevenlabs.ts               # ElevenLabs client
│   ├── parseCSV.ts                 # Transaction CSV parser
│   ├── parseICS.ts                 # Google Calendar ICS parser
│   └── penguinEngine.ts            # KM calculation logic
├── public/
│   └── penguin.png                 # The nihilistic penguin PNG (Werner Herzog meme)
├── styles/
│   └── globals.css                 # Antarctic dark theme
└── .env.local                      # API keys
```

---

## Environment Variables

Create `.env.local` in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id_here
# Choose a deep, slow, gravelly ElevenLabs voice — search "narrator" or "documentary"
```

---

## Screen 1: Intro Splash (The Penguin Entrance)

**File:** `app/page.tsx`

This is the first thing users see. Full screen. Dark Antarctic background. The nihilistic penguin PNG centered on screen with "But, Why?" overlaid on the image in white serif font. The pipe organ L'Amour Toujours audio plays softly on load. After 3 seconds (or on click), it transitions to the upload screen.

```tsx
// app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function IntroPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Autoplay organ music softly
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {}); // catch autoplay block
    }
  }, []);

  const handleEnter = () => {
    router.push("/upload");
  };

  return (
    <main
      className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
      onClick={handleEnter}
    >
      {/* Subtle Antarctic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0d1a2e] to-[#0a0f1a] opacity-100" />

      {/* Penguin image container with "But, Why?" overlay */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <img
            src="/penguin.png"
            alt="The Nihilistic Penguin"
            className="w-[420px] max-w-[90vw] object-contain"
            style={{ filter: "drop-shadow(0 0 40px rgba(100,160,255,0.15))" }}
          />
          {/* "But, Why?" overlaid directly on the penguin image */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-6"
            style={{ pointerEvents: "none" }}
          >
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: "#ffffff",
                fontWeight: "bold",
                letterSpacing: "0.05em",
                textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 0px 4px rgba(0,0,0,1)",
              }}
            >
              But, Why?
            </span>
          </div>
        </div>

        {/* App name */}
        <h1
          className="mt-8 text-5xl font-bold tracking-widest text-white"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.3em" }}
        >
          NihiliFi
        </h1>

        <p className="mt-3 text-[#6b8cae] text-lg tracking-wide italic">
          Neither ocean nor colony.
        </p>

        {/* Subtle click prompt */}
        <p className="mt-12 text-[#3a5068] text-sm animate-pulse tracking-widest uppercase">
          Click anywhere to begin your march
        </p>
      </div>

      {/* Organ music — use a royalty-free pipe organ version or silence */}
      <audio ref={audioRef} loop>
        <source src="/organ.mp3" type="audio/mpeg" />
      </audio>
    </main>
  );
}
```

**Important:** Place the penguin meme PNG at `public/penguin.png`. The "But, Why?" text is overlaid on the image using absolute positioning so it appears burned into the photo. If you want it to look like a meme caption, change `items-end` to `items-center` to center it vertically on the penguin.

---

## Screen 2: Upload Screen

**File:** `app/upload/page.tsx`

Two upload zones side by side:
1. **Transaction CSV** — bank export. Expected columns: Date, Description, Amount, Category (optional)
2. **Calendar ICS** — Google Calendar export. Go to Google Calendar → Settings → Export

After both are uploaded, a "Analyze My Finances" button appears. On click, sends data to the Gemini API route and redirects to dashboard.

```tsx
// app/upload/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseCSV } from "@/lib/parseCSV";
import { parseICS } from "@/lib/parseICS";

export default function UploadPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  const [icsReady, setIcsReady] = useState(false);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    setTransactions(parsed);
    localStorage.setItem("nihilifi_transactions", JSON.stringify(parsed));
    setCsvReady(true);
  };

  const handleICS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseICS(text);
    setCalendarEvents(parsed);
    localStorage.setItem("nihilifi_calendar", JSON.stringify(parsed));
    setIcsReady(true);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, calendarEvents }),
      });
      const data = await res.json();
      localStorage.setItem("nihilifi_analysis", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white p-8">
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Show the penguin your finances.
      </h2>
      <p className="text-center text-[#6b8cae] italic mb-12">
        He will not judge you. He is already walking away.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* CSV Upload */}
        <label className="border border-[#1e3a5f] rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-[#4a90d9] transition-colors bg-[#0d1520]">
          <span className="text-4xl mb-4">💳</span>
          <span className="text-lg font-semibold mb-2">Transaction History</span>
          <span className="text-sm text-[#4a6680] text-center mb-4">
            Export CSV from your bank (RBC, TD, Scotiabank etc.)
          </span>
          {csvReady ? (
            <span className="text-green-400 text-sm">✓ {transactions.length} transactions loaded</span>
          ) : (
            <span className="text-[#3a5068] text-xs">CSV format: Date, Description, Amount</span>
          )}
          <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
        </label>

        {/* ICS Upload */}
        <label className="border border-[#1e3a5f] rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-[#4a90d9] transition-colors bg-[#0d1520]">
          <span className="text-4xl mb-4">📅</span>
          <span className="text-lg font-semibold mb-2">Google Calendar</span>
          <span className="text-sm text-[#4a6680] text-center mb-4">
            Settings → Export → Download .ics file
          </span>
          {icsReady ? (
            <span className="text-green-400 text-sm">✓ {calendarEvents.length} events loaded</span>
          ) : (
            <span className="text-[#3a5068] text-xs">ICS format from Google Calendar</span>
          )}
          <input type="file" accept=".ics" onChange={handleICS} className="hidden" />
        </label>
      </div>

      {csvReady && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-10 py-4 bg-[#1e3a5f] hover:bg-[#2a4f80] rounded-full text-white font-semibold tracking-widest uppercase text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "The penguin is analyzing..." : "Analyze My Finances"}
          </button>
        </div>
      )}

      {!csvReady && (
        <p className="text-center text-[#2a3f55] text-sm mt-8">
          Calendar is optional — but patterns are richer with it.
        </p>
      )}
    </main>
  );
}
```

---

## Gemini Analysis API Route

**File:** `app/api/analyze/route.ts`

This is the brain of NihiliFi. Send Gemini the transaction history + calendar events. It returns structured JSON with behavioral patterns, the user's financial fingerprint, a Herzog-style narration script, a KM score, and forward-looking predictions.

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { transactions, calendarEvents } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
    
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);
    
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
```

---

## ElevenLabs Narration API Route

**File:** `app/api/narrate/route.ts`

Takes a text script and returns audio from ElevenLabs. Used for the onboarding narration and weekly reports.

```typescript
// app/api/narrate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const voiceId = process.env.ELEVENLABS_VOICE_ID!;
  const apiKey = process.env.ELEVENLABS_API_KEY!;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.85,        // High stability = consistent, slow delivery
          similarity_boost: 0.75,
          style: 0.2,             // Subtle style — documentary, not dramatic
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "ElevenLabs failed" }, { status: 500 });
  }

  const audioBuffer = await response.arrayBuffer();
  
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength.toString(),
    },
  });
}
```

---

## Dashboard

**File:** `app/dashboard/page.tsx`

The main experience. Shows:
- The penguin's current position on a path from ocean to mountains (CSS animation)
- KM counter
- Behavioral fingerprint card
- Calendar correlation insights
- Transaction logger (add new spend → penguin moves)
- ElevenLabs narration trigger button
- Link to weekly report

```tsx
// app/dashboard/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [kmScore, setKmScore] = useState(0);
  const [newSpend, setNewSpend] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [narrating, setNarrating] = useState(false);
  const [narratorText, setNarratorText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nihilifi_analysis");
    if (!stored) { router.push("/upload"); return; }
    const data = JSON.parse(stored);
    setAnalysis(data);
    setKmScore(data.kmScore || 35);
  }, []);

  const handleLogSpend = async () => {
    const amount = parseFloat(newSpend);
    if (isNaN(amount) || amount <= 0) return;

    // Move penguin based on spend amount relative to context
    // Simple heuristic: every $20 over $0 = +1KM
    const kmChange = Math.min(Math.round(amount / 20), 5);
    const newKm = Math.min(kmScore + kmChange, 70);
    setKmScore(newKm);
    localStorage.setItem("nihilifi_km", newKm.toString());

    // Trigger narration for meaningful moments
    if (newKm >= 50 || kmChange >= 3) {
      await triggerNarration(
        `You have spent ${newSpend} dollars on ${newDesc || "something"}. The penguin is now ${newKm} kilometers from the ocean. ${newKm >= 50 ? "The mountains are close now. He does not look back." : "He walks. He always walks."}`
      );
    }

    setNewSpend("");
    setNewDesc("");
  };

  const triggerNarration = async (text: string) => {
    setNarrating(true);
    setNarratorText(text);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNarrating(false);
    }
  };

  const playOnboarding = () => {
    if (analysis?.herzogNarration) {
      triggerNarration(analysis.herzogNarration);
    }
  };

  if (!analysis) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-white">
      The penguin is thinking...
    </div>
  );

  // Penguin position: 0km = left (ocean), 70km = right (mountains)
  const penguinPositionPercent = (kmScore / 70) * 80 + 5; // 5% to 85%

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white p-6">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-widest" style={{ fontFamily: "Georgia, serif" }}>
          NihiliFi
        </h1>
        <button onClick={() => router.push("/report")}
          className="text-sm text-[#4a90d9] hover:text-white transition-colors">
          Weekly Report →
        </button>
      </div>

      {/* KM Counter */}
      <div className="text-center mb-6">
        <span className="text-7xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
          {kmScore}
        </span>
        <span className="text-2xl text-[#4a6680] ml-2">km</span>
        <p className="text-[#4a6680] text-sm mt-1">from the ocean</p>
      </div>

      {/* Penguin Path Visualization */}
      <div className="relative w-full max-w-2xl mx-auto mb-10 h-24 bg-[#0d1520] rounded-2xl overflow-hidden border border-[#1e3a5f]">
        {/* Ocean label */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a6b8f] text-xs uppercase tracking-widest">
          🌊 Ocean
        </span>
        {/* Mountains label */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a4040] text-xs uppercase tracking-widest">
          Mountains ⛰️
        </span>
        {/* Path line */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-[#1e3a5f]" />
        {/* Penguin */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
          style={{ left: `${penguinPositionPercent}%` }}
        >
          <img src="/penguin.png" alt="penguin" className="w-12 h-12 object-contain" />
        </div>
        {/* Danger zone overlay */}
        {kmScore >= 50 && (
          <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-red-900/20 to-transparent" />
        )}
      </div>

      {/* Behavioral Fingerprint Card */}
      <div className="max-w-2xl mx-auto mb-6 bg-[#0d1520] border border-[#1e3a5f] rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-[#4a6680] mb-1">Your Financial Identity</p>
        <h3 className="text-xl font-bold text-[#4a90d9] mb-2">
          {analysis.behavioralFingerprint?.type}
        </h3>
        <p className="text-[#8aabb0] text-sm leading-relaxed">
          {analysis.behavioralFingerprint?.description}
        </p>
        <div className="mt-4 pt-4 border-t border-[#1e3a5f]">
          <p className="text-xs text-[#3a5068]">Primary Leak</p>
          <p className="text-white text-sm mt-1">{analysis.behavioralFingerprint?.primaryLeak}</p>
          <div className="mt-2 h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c0392b] rounded-full transition-all duration-1000"
              style={{ width: `${analysis.behavioralFingerprint?.leakPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calendar Correlations */}
      {analysis.calendarCorrelations?.length > 0 && (
        <div className="max-w-2xl mx-auto mb-6">
          <p className="text-xs uppercase tracking-widest text-[#4a6680] mb-3">What The Penguin Sees</p>
          {analysis.calendarCorrelations.map((c: any, i: number) => (
            <div key={i} className="bg-[#0d1520] border border-[#1e3a5f] rounded-xl p-4 mb-3">
              <p className="text-white text-sm font-medium">{c.pattern}</p>
              <p className="text-[#4a6680] text-xs mt-1">{c.evidence}</p>
              <p className="text-[#c0392b] text-xs mt-1 font-mono">{c.estimatedCost}</p>
            </div>
          ))}
        </div>
      )}

      {/* Forward Warning */}
      <div className="max-w-2xl mx-auto mb-6 bg-[#12060a] border border-[#5a1a1a] rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-[#8a3030] mb-2">The Penguin Warns You</p>
        <p className="text-[#c09090] text-sm italic leading-relaxed">
          "{analysis.forwardLookingWarning}"
        </p>
      </div>

      {/* Log Spend */}
      <div className="max-w-2xl mx-auto mb-6 bg-[#0d1520] border border-[#1e3a5f] rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-[#4a6680] mb-4">Log a Spend</p>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="$0.00"
            value={newSpend}
            onChange={(e) => setNewSpend(e.target.value)}
            className="bg-[#0a0f1a] border border-[#1e3a5f] rounded-lg px-4 py-2 text-white w-32 text-sm focus:outline-none focus:border-[#4a90d9]"
          />
          <input
            type="text"
            placeholder="What did you spend it on?"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="bg-[#0a0f1a] border border-[#1e3a5f] rounded-lg px-4 py-2 text-white flex-1 text-sm focus:outline-none focus:border-[#4a90d9]"
          />
          <button
            onClick={handleLogSpend}
            className="bg-[#1e3a5f] hover:bg-[#2a4f80] px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Log
          </button>
        </div>
      </div>

      {/* Herzog Narration Button */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-center">
        <button
          onClick={playOnboarding}
          disabled={narrating}
          className="flex items-center gap-3 px-8 py-3 border border-[#4a90d9] rounded-full text-[#4a90d9] hover:bg-[#4a90d9] hover:text-black transition-all text-sm tracking-widest uppercase disabled:opacity-40"
        >
          {narrating ? "🎙️ The penguin speaks..." : "🎙️ Hear Your Financial Report"}
        </button>
      </div>

      {/* Narration transcript */}
      {narratorText && (
        <div className="max-w-2xl mx-auto mt-4 bg-[#06090f] border border-[#0e2035] rounded-xl p-5">
          <p className="text-[#4a6680] text-xs italic leading-relaxed">"{narratorText}"</p>
        </div>
      )}
    </main>
  );
}
```

---

## Weekly Report Page

**File:** `app/report/page.tsx`

Generates a full Werner Herzog narration of the week. Calls the Gemini report endpoint, then plays it via ElevenLabs. This is the demo showstopper.

```tsx
// app/report/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const analysis = localStorage.getItem("nihilifi_analysis");
    const km = localStorage.getItem("nihilifi_km");
    if (!analysis) { router.push("/upload"); return; }

    const data = JSON.parse(analysis);
    const currentKm = km ? parseInt(km) : data.kmScore;

    const reportText = `
${data.weekSummary}

${data.herzogNarration}

You are currently ${currentKm} kilometers from the ocean. 
${currentKm < 20 ? "The colony is close. There may still be time." : 
  currentKm < 50 ? "The path behind you grows distant." : 
  "The mountains are near. He walks still."}
    `.trim();

    setReport(reportText);
    setLoading(false);
  }, []);

  const playReport = async () => {
    setPlaying(true);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: report }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setPlaying(false);
      }
    } catch (err) {
      setPlaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white p-8 flex flex-col items-center">
      <audio ref={audioRef} />
      <button onClick={() => router.push("/dashboard")} className="self-start text-[#4a6680] text-sm mb-8">
        ← Back
      </button>

      <img src="/penguin.png" alt="penguin" className="w-32 mb-8 opacity-60" />

      <h2 className="text-2xl font-bold mb-2 tracking-widest" style={{ fontFamily: "Georgia, serif" }}>
        Weekly Financial Report
      </h2>
      <p className="text-[#4a6680] text-sm italic mb-10">Narrated by the penguin</p>

      {loading ? (
        <p className="text-[#3a5068]">Preparing your report...</p>
      ) : (
        <>
          <div className="max-w-xl bg-[#0d1520] border border-[#1e3a5f] rounded-2xl p-8 mb-8 w-full">
            <p className="text-[#8aabb0] text-sm leading-relaxed italic whitespace-pre-line">
              "{report}"
            </p>
          </div>

          <button
            onClick={playReport}
            disabled={playing}
            className="px-10 py-4 border border-[#4a90d9] rounded-full text-[#4a90d9] hover:bg-[#4a90d9] hover:text-black transition-all tracking-widest uppercase text-sm disabled:opacity-40"
          >
            {playing ? "🎙️ Speaking..." : "🎙️ Play Herzog Narration"}
          </button>
        </>
      )}
    </main>
  );
}
```

---

## Utility Libraries

### CSV Parser
**File:** `lib/parseCSV.ts`

```typescript
export function parseCSV(text: string): any[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  }).filter(row => row.amount || row.debit || row.credit);
}
```

### ICS Parser
**File:** `lib/parseICS.ts`

```typescript
export function parseICS(text: string): any[] {
  const events: any[] = [];
  const blocks = text.split("BEGIN:VEVENT");
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string) => {
      const match = block.match(new RegExp(`${key}[^:]*:(.+)`));
      return match ? match[1].trim() : "";
    };
    
    events.push({
      summary: get("SUMMARY"),
      start: get("DTSTART"),
      end: get("DTEND"),
      description: get("DESCRIPTION"),
    });
  }
  
  return events;
}
```

### Penguin KM Engine
**File:** `lib/penguinEngine.ts`

```typescript
export function calculateKMDelta(
  amount: number,
  weeklyBudget: number = 200,
  currentKm: number = 35
): number {
  // Small purchase under $20: minimal movement
  if (amount < 20) return 0.5;
  // Moderate purchase $20-$60: moderate movement
  if (amount < 60) return Math.round(amount / 20);
  // Large purchase $60+: significant movement
  return Math.min(Math.round(amount / 15), 8);
}

export function getKMMessage(km: number): string {
  if (km <= 10) return "He is near the ocean. This can continue.";
  if (km <= 25) return "He walks. Not yet alarming.";
  if (km <= 40) return "The colony grows distant.";
  if (km <= 55) return "The mountains are visible now.";
  if (km <= 65) return "He will not return.";
  return "70 kilometers. The end.";
}
```

---

## Styling — Global CSS

**File:** `styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ocean: #0a4f6e;
  --ice: #c8e0f0;
  --void: #0a0f1a;
  --text-muted: #4a6680;
}

body {
  background-color: #0a0f1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Penguin walker transition */
.penguin-walker {
  transition: left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Subtle scanline effect for that doomed documentary feel */
body::after {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

---

## DigitalOcean Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "nihilifi initial commit"
gh repo create nihilifi --public --push
```

### Step 2: Deploy on DigitalOcean App Platform
1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com) → Create → Apps
2. Connect your GitHub repo
3. DigitalOcean will auto-detect Next.js
4. Add environment variables in the App settings:
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
5. Deploy. Done.

**Build Command:** `npm run build`
**Run Command:** `npm start`
**HTTP Port:** 3000

Use the $200 free credits from the MLH DigitalOcean signup link.

---

## ElevenLabs Voice Setup

1. Go to [elevenlabs.io](https://elevenlabs.io) → Voice Library
2. Search for voices: "documentary", "narrator", "deep", "gravelly"
3. Good candidates to audition: "Arnold", "Daniel", "Liam" — look for slow, authoritative, slightly melancholic
4. Copy the Voice ID from the voice settings page
5. Add to `.env.local` as `ELEVENLABS_VOICE_ID`

**Voice Settings to use in the API call:**
- Stability: 0.85 (very consistent, measured delivery)
- Similarity Boost: 0.75
- Style: 0.20 (subtle, not theatrical)

---

## Demo Flow for Judges

This is exactly what you show during judging — practice this:

1. **Open the app.** Penguin on screen. "But, Why?" on the image. Organ music plays softly. (5 seconds of silence while judges absorb the vibe)

2. **"I built NihiliFi for people who feel like that penguin every time they check their bank account."** Click to enter.

3. **Upload screen.** Show CSV upload with pre-prepared sample data. Show ICS file. Click Analyze.

4. **Dashboard loads.** Penguin is somewhere on the path. Show the behavioral fingerprint card — "You're a Social Spender. 73% of your overspending happens within 48 hours of a group calendar event."

5. **Show a calendar correlation.** "Every time you have 3+ events in a week, your food delivery spend triples."

6. **Log a big spend live.** "$80 — team dinner." Penguin walks forward in real time.

7. **Hit the narration button.** Let Herzog speak. This is the moment. Let the audio finish.

8. **"This hits RBC's multi-calendar intelligence ask, Mr. Hyde, ElevenLabs, Gemini, and DigitalOcean. Built solo in 24 hours."**

---

## Snowflake Add-On (If Time Permits)

> Only attempt this if core app is finished with 3+ hours to spare.

Instead of sending raw transactions to Gemini as a text blob, store them in Snowflake and run Cortex AI queries against the data for richer analytics.

### Minimal Integration Plan

**What it adds:** Proper queryable database for transaction history. Snowflake Cortex can run pattern queries natively — cleaner than stuffing 150 rows into a Gemini prompt.

**Step 1:** Sign up for Snowflake student trial (120 days free via hackathon link)

**Step 2:** Create a table
```sql
CREATE TABLE transactions (
  id INT AUTOINCREMENT,
  date DATE,
  description VARCHAR,
  amount FLOAT,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Step 3:** Replace the CSV-to-Gemini pipeline with CSV-to-Snowflake ingest
```typescript
// lib/snowflake.ts
import snowflake from 'snowflake-sdk';

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT!,
  username: process.env.SNOWFLAKE_USER!,
  password: process.env.SNOWFLAKE_PASSWORD!,
  database: 'NIHILIFI',
  warehouse: 'COMPUTE_WH',
});
```

**Step 4:** Run a Cortex query for pattern analysis instead of raw Gemini prompt
```sql
SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'mistral-7b',
  CONCAT(
    'Analyze these transactions and find behavioral spending patterns: ',
    (SELECT LISTAGG(description || ': $' || amount, ', ') FROM transactions)
  )
);
```

**Step 5:** Feed Cortex output into ElevenLabs for narration

**Additional env vars needed:**
```env
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
```

**Honest advice:** If you're running low on time, skip Snowflake. DigitalOcean is already giving you a prize track for 30 minutes of work. Snowflake is 2-3 hours minimum. Only worth it if the core app is fully polished.

---

## Quick Start Commands

```bash
# Create Next.js app
npx create-next-app@latest nihilifi --typescript --tailwind --app

cd nihilifi

# Install dependencies
npm install @google/generative-ai

# Create .env.local and add your keys
touch .env.local

# Run locally
npm run dev

# Open http://localhost:3000
```

---

## Checklist Before Demo

- [ ] `public/penguin.png` is in place (the nihilistic penguin PNG)
- [ ] `public/organ.mp3` is in place (royalty-free pipe organ version of L'Amour Toujours, or silence)
- [ ] `.env.local` has all three API keys
- [ ] ElevenLabs voice ID is correct and voice sounds good
- [ ] Sample CSV of transactions is prepared for demo upload
- [ ] Sample ICS from Google Calendar is exported and ready
- [ ] Gemini analysis runs successfully end-to-end
- [ ] KM counter animates smoothly when spending is logged
- [ ] Audio plays on the dashboard narration button
- [ ] App is deployed on DigitalOcean App Platform with env vars set
- [ ] Demo flow rehearsed at least twice

---

*"He would neither go toward the feeding grounds at the edge of the ice, nor return to the colony. And still, the penguin walks."*
*— Werner Herzog, Encounters at the End of the World, 2007*
