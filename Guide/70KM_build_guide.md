# 70KM — Full Build Guide for Cursor Pro
> Mountain Madness 2026 Hackathon @ SFU | Solo Build | 24 Hours

---

## What Is This App

**70KM** is a personal finance app narrated by the nihilist penguin. The penguin from Werner Herzog's 2007 documentary *Encounters at the End of the World* abandoned his colony and walked 70km toward certain death in the Antarctic mountains — calm, deliberate, unbothered. This app uses that metaphor: every bad financial decision walks him further inland. Every good one brings him back.

The finance intelligence is real: the app ingests the user's transaction history and Google Calendar data, uses **Gemini AI** to find behavioral correlations across time cycles (when do you overspend? what life events trigger it?), and delivers all insights as **Werner Herzog-style narration via ElevenLabs**. The penguin walks or turns based on your spending. It is simultaneously a shitpost and a genuinely useful personal finance tool.

**Prize tracks this targets:**
- RBC Custom Challenge (Personal Finance Platforms)
- Best Mr. Hyde (chaotic fun project)
- Best Solo Hack
- [MLH] Best Use of ElevenLabs
- [MLH] Best Use of Gemini API
- [MLH] Best Use of DigitalOcean (deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python (FastAPI) |
| AI — Analysis | Google Gemini 1.5 Pro API |
| AI — Voice | ElevenLabs API |
| Deployment | DigitalOcean App Platform |
| Data Storage | localStorage (frontend) + in-memory (backend) |
| Calendar Data | Google Calendar ICS export (no OAuth needed) |
| Transaction Data | CSV upload |

---

## Project Structure

```
70km/
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── PenguinScene.jsx       # Animated penguin + mountain background
│   │   │   ├── OnboardingFlow.jsx     # CSV + ICS upload screens
│   │   │   ├── Dashboard.jsx          # Main app view
│   │   │   ├── SpendLogger.jsx        # Log a new transaction
│   │   │   ├── WeeklyReport.jsx       # Sunday insight modal
│   │   │   └── NarrationPlayer.jsx    # Audio player for ElevenLabs output
│   │   ├── utils/
│   │   │   ├── csvParser.js
│   │   │   ├── icsParser.js
│   │   │   └── penguinPosition.js     # Logic for how far penguin has walked
│   │   └── assets/
│   │       ├── penguin.png            # PNG of penguin (transparent background)
│   │       ├── mountain-bg.jpg        # Antarctic mountain background
│   │       └── organ-music.mp3        # L'Amour Toujours pipe organ cover (Andreas Gärtner)
├── backend/
│   ├── main.py                        # FastAPI app
│   ├── routes/
│   │   ├── analyze.py                 # POST /analyze — Gemini analysis
│   │   ├── narrate.py                 # POST /narrate — ElevenLabs TTS
│   │   └── weekly.py                  # POST /weekly-report — full weekly insight
│   ├── services/
│   │   ├── gemini_service.py
│   │   └── elevenlabs_service.py
│   ├── prompts/
│   │   └── herzog_prompts.py          # All Gemini prompt templates
│   └── requirements.txt
├── .env                               # API keys (never commit)
├── .env.example
└── README.md
```

---

## Environment Variables

Create a `.env` file in the root:

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id  # Choose deep/gravelly voice in ElevenLabs

# For DigitalOcean deployment, these same vars go into App Platform environment config
```

---

## Backend — FastAPI

### `backend/requirements.txt`
```
fastapi
uvicorn
python-dotenv
google-generativeai
requests
python-multipart
icalendar
```

### `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analyze, narrate, weekly

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(narrate.router)
app.include_router(weekly.router)

@app.get("/health")
def health():
    return {"status": "the penguin lives"}
```

---

### `backend/services/gemini_service.py`
```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

def analyze_financial_patterns(transactions: list[dict], calendar_events: list[dict]) -> dict:
    """
    Takes structured transactions and calendar events.
    Returns behavioral analysis as JSON.
    """
    from prompts.herzog_prompts import PATTERN_ANALYSIS_PROMPT
    
    prompt = PATTERN_ANALYSIS_PROMPT.format(
        transactions=transactions,
        calendar_events=calendar_events
    )
    
    response = model.generate_content(prompt)
    
    # Parse JSON from response
    import json, re
    text = response.text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return {"error": "Failed to parse Gemini response", "raw": text}


def generate_transaction_narration(transaction: dict, user_context: dict) -> str:
    """
    For a single logged transaction, generate a short Herzog-style narration.
    Returns a string of 1-3 sentences.
    """
    from prompts.herzog_prompts import TRANSACTION_NARRATION_PROMPT
    
    prompt = TRANSACTION_NARRATION_PROMPT.format(
        merchant=transaction.get("merchant", "unknown"),
        amount=transaction.get("amount", 0),
        category=transaction.get("category", "misc"),
        budget_remaining=user_context.get("budget_remaining", 0),
        km_position=user_context.get("km_position", 35),
        is_over_budget=user_context.get("is_over_budget", False)
    )
    
    response = model.generate_content(prompt)
    return response.text.strip()


def generate_weekly_report(transactions: list[dict], calendar_events: list[dict], upcoming_events: list[dict]) -> dict:
    """
    Full weekly report: past week analysis + upcoming week prediction.
    Returns Herzog narration script + data points.
    """
    from prompts.herzog_prompts import WEEKLY_REPORT_PROMPT
    
    prompt = WEEKLY_REPORT_PROMPT.format(
        past_transactions=transactions,
        past_events=calendar_events,
        upcoming_events=upcoming_events
    )
    
    response = model.generate_content(prompt)
    
    import json, re
    text = response.text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return {"narration": text, "data": {}}
```

---

### `backend/prompts/herzog_prompts.py`

This is the most important file. The prompts define the entire personality of the app.

```python
PATTERN_ANALYSIS_PROMPT = """
You are analyzing someone's personal financial data to find behavioral patterns.
You will be given their transaction history and calendar events.

TRANSACTIONS (last 3 months):
{transactions}

CALENDAR EVENTS (last 3 months):
{calendar_events}

Find real correlations between their calendar density and spending behavior.
Look for:
1. Spending spikes around specific event types (social, work, academic stress)
2. Their primary spending "leak" category
3. Days of week / times of month they overspend
4. Their behavioral spending fingerprint (social spender, stress spender, subscription hoarder, etc.)
5. Upcoming week prediction based on their calendar

Respond ONLY in valid JSON, no markdown, no preamble:
{{
  "behavioral_type": "social spender | stress spender | subscription hoarder | impulse buyer | etc",
  "behavioral_type_description": "one sentence explaining this",
  "primary_leak_category": "food delivery | subscriptions | social outings | etc",
  "primary_leak_percentage": 0.73,
  "calendar_correlation": "you consistently overspend within 48 hours of calendar events with 3+ attendees",
  "spending_fingerprint": "detailed 2-3 sentence description of their unique pattern",
  "km_position": 42,
  "herzog_narration": "Write a 4-6 sentence Werner Herzog-style narration of this person's financial situation. Dark, philosophical, poetic, but also oddly hopeful. Reference the penguin metaphor. Reference their specific patterns. Do NOT be cheesy. Do NOT give advice. Just observe, like a nature documentary narrator watching a creature in its habitat.",
  "insight_bullets": [
    "73% of your overspending happens within 48 hours of a social calendar event",
    "You have 4 active streaming subscriptions you have not used this month",
    "Your Tuesday spending is consistently 40% higher than any other day"
  ]
}}
"""


TRANSACTION_NARRATION_PROMPT = """
You are Werner Herzog narrating a nature documentary about a penguin making financial decisions.
The penguin represents a person who just made this purchase:

Merchant: {merchant}
Amount: ${amount}
Category: {category}
Budget remaining this week: ${budget_remaining}
Current position: {km_position}km from the ocean (70km = certain financial death)
Over budget this week: {is_over_budget}

Write 1-3 sentences in Werner Herzog's voice. 
- Deeply philosophical, dry, slightly dark but not cruel
- Reference the penguin and the march toward the mountains if over budget
- Reference turning back toward the ocean if it's a good decision
- Be specific about the merchant/purchase
- Do NOT give financial advice
- Do NOT be preachy
- Maximum 60 words

Examples of good tone:
"He has purchased a fourth streaming subscription. He does not watch three of them. The mountains grow closer."
"The coffee, at six dollars, is not the problem. The rent went up four hundred dollars this year. The penguin knows this."
"He cooked at home tonight. A small thing. But the ocean is, perhaps, two steps closer than it was this morning."

Respond with ONLY the narration text, nothing else.
"""


WEEKLY_REPORT_PROMPT = """
You are Werner Herzog delivering the weekly financial documentary for a person's life.

PAST WEEK TRANSACTIONS:
{past_transactions}

PAST WEEK CALENDAR EVENTS:
{past_events}

UPCOMING WEEK CALENDAR EVENTS:
{upcoming_events}

Generate a full weekly financial report in the style of a Werner Herzog documentary narration.
Be specific, use their actual numbers, be philosophical and dark but never cruel.
Also provide a forward-looking warning about the upcoming week based on their calendar.

Respond ONLY in valid JSON:
{{
  "weekly_narration": "Full 6-10 sentence Herzog narration of their financial week. Reference specific purchases, calendar events, patterns. End with an observation about the upcoming week.",
  "km_change": -5,
  "total_spent": 847.23,
  "over_under_budget": -127.50,
  "top_category": "food delivery",
  "upcoming_warning": "You have 3 social events next week. Historically this costs you $180. Your current buffer is $90. The penguin is watching.",
  "penguin_mood": "concerned | neutral | relieved | alarmed"
}}
"""
```

---

### `backend/services/elevenlabs_service.py`
```python
import requests
import os
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

def text_to_speech(text: str) -> bytes:
    """
    Converts text to audio using ElevenLabs.
    Returns audio as bytes (mp3).
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.75,       # Higher = more consistent, less emotional
            "similarity_boost": 0.85, # How closely it matches the voice
            "style": 0.2,            # Slight style exaggeration
            "use_speaker_boost": True
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.content  # Raw mp3 bytes
```

---

### `backend/routes/narrate.py`
```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.elevenlabs_service import text_to_speech
import io

router = APIRouter()

class NarrateRequest(BaseModel):
    text: str

@router.post("/narrate")
def narrate(req: NarrateRequest):
    audio_bytes = text_to_speech(req.text)
    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=narration.mp3"}
    )
```

---

### `backend/routes/analyze.py`
```python
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from services.gemini_service import analyze_financial_patterns
import csv, io
from icalendar import Calendar
from datetime import datetime

router = APIRouter()

@router.post("/analyze")
async def analyze(
    transactions_csv: UploadFile = File(...),
    calendar_ics: UploadFile = File(...)
):
    # Parse CSV transactions
    csv_content = await transactions_csv.read()
    csv_text = csv_content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(csv_text))
    transactions = [row for row in reader]
    
    # Parse ICS calendar
    ics_content = await calendar_ics.read()
    cal = Calendar.from_ical(ics_content)
    calendar_events = []
    for component in cal.walk():
        if component.name == "VEVENT":
            calendar_events.append({
                "summary": str(component.get("SUMMARY", "")),
                "start": str(component.get("DTSTART").dt),
                "attendee_count": len(component.get("ATTENDEE", [])) if component.get("ATTENDEE") else 0
            })
    
    result = analyze_financial_patterns(transactions, calendar_events)
    return result
```

---

### `backend/routes/weekly.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import generate_weekly_report, generate_transaction_narration

router = APIRouter()

class WeeklyReportRequest(BaseModel):
    past_transactions: list
    past_events: list
    upcoming_events: list

class TransactionNarrationRequest(BaseModel):
    transaction: dict
    user_context: dict

@router.post("/weekly-report")
def weekly_report(req: WeeklyReportRequest):
    result = generate_weekly_report(
        req.past_transactions,
        req.past_events,
        req.upcoming_events
    )
    return result

@router.post("/transaction-narration")
def transaction_narration(req: TransactionNarrationRequest):
    narration = generate_transaction_narration(req.transaction, req.user_context)
    return {"narration": narration}
```

---

## Frontend — React

### Key Component: `PenguinScene.jsx`

This is the visual heart of the app. The penguin is a PNG positioned on a mountain background. His X position is driven by `kmPosition` (0 = ocean left side, 70 = mountains right side).

```jsx
import { useEffect, useRef } from "react";

export default function PenguinScene({ kmPosition, isPlaying, onAudioEnd }) {
  // kmPosition: 0-70
  // 0 = safe at ocean (left), 70 = mountains (right/dead)
  
  const penguinLeftPercent = (kmPosition / 70) * 80; // max 80% across screen
  
  return (
    <div className="penguin-scene" style={{ position: "relative", width: "100%", height: "400px", overflow: "hidden" }}>
      {/* Background: Antarctic landscape, mountains on right */}
      <img 
        src="/assets/mountain-bg.jpg" 
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        alt="Antarctic mountains"
      />
      
      {/* Distance indicator */}
      <div className="km-indicator" style={{
        position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)",
        color: "white", fontSize: "24px", fontFamily: "monospace",
        textShadow: "2px 2px 4px black"
      }}>
        {kmPosition.toFixed(1)} km from the ocean
      </div>
      
      {/* Penguin */}
      <img 
        src="/assets/penguin.png"
        className={isPlaying ? "penguin-walking" : ""}
        style={{
          position: "absolute",
          bottom: "20%",
          left: `${penguinLeftPercent}%`,
          height: "80px",
          transition: "left 2s ease-in-out",
          filter: kmPosition > 50 ? "brightness(0.7)" : "none"
        }}
        alt="penguin"
      />
      
      {/* Danger zone overlay when close to mountains */}
      {kmPosition > 55 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(150, 0, 0, 0.1)",
          animation: "pulse 2s infinite"
        }} />
      )}
    </div>
  );
}
```

---

### Key Component: `NarrationPlayer.jsx`

Fetches audio from the `/narrate` endpoint and plays it automatically.

```jsx
import { useEffect, useRef, useState } from "react";

export default function NarrationPlayer({ text, autoPlay = true }) {
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!text) return;
    
    const fetchAndPlay = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          if (autoPlay) audioRef.current.play();
        }
      } catch (e) {
        setError("Narration failed");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndPlay();
  }, [text]);

  return (
    <div className="narration-player">
      {loading && <p style={{ color: "#aaa", fontStyle: "italic" }}>The penguin is watching...</p>}
      <audio ref={audioRef} controls style={{ width: "100%", marginTop: "8px" }} />
    </div>
  );
}
```

---

### Key Component: `SpendLogger.jsx`

Where users log new transactions. On submit, it calls the backend for a narration, then moves the penguin.

```jsx
import { useState } from "react";

export default function SpendLogger({ kmPosition, setKmPosition, weekBudget, weekSpent, setWeekSpent }) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [narration, setNarration] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ["food", "food delivery", "subscriptions", "social", "transport", "groceries", "shopping", "other"];

  const handleSubmit = async () => {
    if (!merchant || !amount) return;
    setLoading(true);

    const budgetRemaining = weekBudget - weekSpent - parseFloat(amount);
    const isOverBudget = budgetRemaining < 0;

    // Get narration from backend
    const res = await fetch("http://localhost:8000/transaction-narration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction: { merchant, amount: parseFloat(amount), category },
        user_context: {
          budget_remaining: budgetRemaining,
          km_position: kmPosition,
          is_over_budget: isOverBudget
        }
      })
    });

    const data = await res.json();
    setNarration(data.narration);

    // Move penguin based on spend
    // Simple heuristic: over budget moves him, good decisions pull him back
    const kmDelta = isOverBudget 
      ? Math.min(parseFloat(amount) / 20, 5)   // max 5km per bad purchase
      : -Math.min(parseFloat(amount) / 50, 2); // good purchases pull back slightly
    
    setKmPosition(prev => Math.max(0, Math.min(70, prev + kmDelta)));
    setWeekSpent(prev => prev + parseFloat(amount));

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("transactions") || "[]");
    existing.push({ merchant, amount: parseFloat(amount), category, date: new Date().toISOString() });
    localStorage.setItem("transactions", JSON.stringify(existing));

    setLoading(false);
    setMerchant("");
    setAmount("");
  };

  return (
    <div className="spend-logger">
      <h3>Log a Spend</h3>
      <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Where did you spend?" />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" type="number" />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "The penguin deliberates..." : "Log It"}
      </button>

      {narration && (
        <div className="narration-box">
          <p style={{ fontStyle: "italic", color: "#ccc" }}>"{narration}"</p>
          <NarrationPlayer text={narration} autoPlay={true} />
        </div>
      )}
    </div>
  );
}

import NarrationPlayer from "./NarrationPlayer";
```

---

### Key Component: `OnboardingFlow.jsx`

First-time user setup. Uploads CSV + ICS, sends to backend, gets initial analysis.

```jsx
import { useState } from "react";

export default function OnboardingFlow({ onComplete }) {
  const [csvFile, setCsvFile] = useState(null);
  const [icsFile, setIcsFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = upload, 2 = analyzing, 3 = reveal

  const handleAnalyze = async () => {
    if (!csvFile || !icsFile) return;
    setLoading(true);
    setStep(2);

    const formData = new FormData();
    formData.append("transactions_csv", csvFile);
    formData.append("calendar_ics", icsFile);

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    
    // Store analysis result
    localStorage.setItem("analysis", JSON.stringify(data));
    localStorage.setItem("kmPosition", data.km_position || 35);
    
    setLoading(false);
    setStep(3);
    onComplete(data);
  };

  if (step === 1) return (
    <div className="onboarding">
      <h1>70KM</h1>
      <p>He walked away from the colony. Toward the mountains. Toward certain death.</p>
      <p>How far have you walked?</p>
      
      <div className="upload-section">
        <label>Your bank transactions (CSV)</label>
        <p style={{ fontSize: "12px", color: "#aaa" }}>
          Export from your bank: usually under Accounts → Download Transactions → CSV
        </p>
        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} />
      </div>
      
      <div className="upload-section">
        <label>Your Google Calendar (ICS)</label>
        <p style={{ fontSize: "12px", color: "#aaa" }}>
          Google Calendar → Settings → Export → Download your calendar.ics
        </p>
        <input type="file" accept=".ics" onChange={e => setIcsFile(e.target.files[0])} />
      </div>
      
      <button onClick={handleAnalyze} disabled={!csvFile || !icsFile}>
        Show me how far I've walked
      </button>
    </div>
  );

  if (step === 2) return (
    <div className="analyzing">
      <p style={{ fontStyle: "italic" }}>
        "One of them caught our eye... he would neither go toward the feeding grounds, nor return to the colony."
      </p>
      <p>Gemini is finding your patterns...</p>
      {/* Penguin walking animation here */}
    </div>
  );

  return null; // step 3 handled by parent (Dashboard renders)
}
```

---

### `src/App.jsx`
```jsx
import { useState, useEffect } from "react";
import OnboardingFlow from "./components/OnboardingFlow";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [kmPosition, setKmPosition] = useState(35);

  useEffect(() => {
    // Check if user has already onboarded
    const saved = localStorage.getItem("analysis");
    const savedKm = localStorage.getItem("kmPosition");
    if (saved) {
      setAnalysis(JSON.parse(saved));
      setKmPosition(parseFloat(savedKm) || 35);
    }
  }, []);

  const handleOnboardingComplete = (data) => {
    setAnalysis(data);
    setKmPosition(data.km_position || 35);
  };

  if (!analysis) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <Dashboard 
      analysis={analysis} 
      kmPosition={kmPosition} 
      setKmPosition={setKmPosition} 
    />
  );
}
```

---

## CSS / Styling Direction

Dark theme. Antarctic palette. Minimal UI — the penguin and voice do the work.

```css
/* Global */
body {
  background: #0a0f1a;
  color: #e8e8e8;
  font-family: 'Georgia', serif; /* Documentary feel */
  margin: 0;
  padding: 0;
}

/* Penguin walking animation */
@keyframes waddle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.penguin-walking {
  animation: waddle 0.5s ease-in-out infinite;
}

/* Pulse for danger zone */
@keyframes pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

/* Narration box */
.narration-box {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #4a6fa5;
  padding: 16px;
  margin-top: 16px;
  border-radius: 4px;
}

/* Upload sections */
.upload-section {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 8px;
  margin: 16px 0;
}

input[type="file"] {
  color: #aaa;
  margin-top: 8px;
}

button {
  background: #1a3a5c;
  color: white;
  border: 1px solid #4a6fa5;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-family: inherit;
}

button:hover { background: #2a4a7c; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
```

---

## ElevenLabs Voice Setup

1. Log into ElevenLabs → Voice Library
2. Search for voices with these qualities: deep, slow, slightly accented, documentary-style
3. Good options to try: "Arnold", "Clyde", or create a custom voice
4. Or use Voice Design: set accent to "German-American", age "older", description "philosophical documentary narrator"
5. Copy the Voice ID into your `.env`
6. Test the voice with the exact narration style before committing — the voice IS the app

---

## Google Calendar Data Export (No OAuth)

To avoid the complexity of OAuth for the hackathon demo:

1. Go to calendar.google.com
2. Settings (gear icon) → Settings
3. Left sidebar → Import & Export → Export
4. Downloads a .zip with .ics files inside
5. User uploads the .ics directly in the app

This is a perfectly valid UX for a hackathon. You can note in the pitch that production would use OAuth.

---

## Bank Transaction CSV Format

Different banks export slightly different CSV formats. The parser should handle common variants. Tell users to look for these columns (and handle aliases):

```
Required columns (handle variants):
- Date (or "Transaction Date", "Posted Date")  
- Amount (or "Debit", "Credit", "Transaction Amount")
- Description (or "Merchant", "Payee", "Details")

Optional but helpful:
- Category (if bank provides it)
- Balance
```

The CSV parser should normalize these into:
```json
{ "date": "2026-02-15", "merchant": "DoorDash", "amount": -24.50, "category": "food delivery" }
```

Negative amounts = spending. Positive = income.

---

## DigitalOcean Deployment

### Option A: App Platform (Recommended — easiest)

1. Push code to GitHub
2. Go to DigitalOcean → Create → App
3. Connect GitHub repo
4. Configure two components:
   - **Frontend:** Static Site → `frontend/` directory → build command `npm run build` → output dir `dist`
   - **Backend:** Web Service → `backend/` directory → run command `uvicorn main:app --host 0.0.0.0 --port 8080`
5. Add environment variables (GEMINI_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID) in App Platform settings
6. Deploy

### Option B: Single Droplet (More control)

```bash
# On your Droplet (Ubuntu 22.04)
apt update && apt install -y python3-pip nodejs npm nginx

# Clone repo and install
git clone your-repo
cd 70km/backend && pip3 install -r requirements.txt
cd ../frontend && npm install && npm run build

# Run backend with PM2
npm install -g pm2
cd ../backend && pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name 70km-backend

# Nginx config: serve frontend static, proxy /api to backend
```

---

## Demo Flow (For Judging)

**This is your most important document. Practice this exactly.**

1. Open app. L'Amour Toujours pipe organ starts softly. Penguin is at position 35km. "He has walked halfway."

2. Show the onboarding — explain you've pre-loaded demo data (your own real transactions + calendar). Don't fumble with uploads during demo.

3. Show the **initial analysis reveal**: Gemini has found the pattern. ElevenLabs narrates: *"You are a social spender. Seventy-one percent of your discretionary overspending occurs within 48 hours of a group event. The colony pulls at you..."* Let it play fully. Silence in the room. This is your moment.

4. Show the **dashboard**: penguin at current km position, this week's spending vs budget, behavioral type badge.

5. Log a transaction live: type in "DoorDash $28" → click log → penguin walks slightly → narration plays: *"He has ordered delivery again. It is the third time this week. The mountains are patient."*

6. Show the **weekly report** (pre-generated): full Herzog narration of the week + upcoming warning about next week's social events.

7. Close with: "He didn't choose the ocean. He didn't choose the colony. He chose to know the truth about where he was walking. That's 70KM."

**Expected demo duration: 3-4 minutes.**

---

## Build Timeline (24 Hours)

| Hours | Focus |
|---|---|
| 0–1 | Set up project structure, install dependencies, confirm API keys work |
| 1–3 | Backend: Gemini service + prompts, test analyze endpoint with sample data |
| 3–5 | Backend: ElevenLabs service + narrate endpoint, test voice output |
| 5–7 | Backend: All routes wired, weekly report endpoint working |
| 7–10 | Frontend: PenguinScene component, CSS/styling, animation |
| 10–13 | Frontend: OnboardingFlow + file upload + analyze call |
| 13–16 | Frontend: Dashboard + SpendLogger + NarrationPlayer |
| 16–18 | Integration testing end-to-end, fix broken edges |
| 18–20 | DigitalOcean deployment, environment variables, test live URL |
| 20–22 | Polish: loading states, error handling, demo data prep |
| 22–24 | Demo rehearsal, README, Devpost submission |

---

## Devpost Submission Checklist

- [ ] App title: **70KM**
- [ ] Tagline: *"He walked away from the colony. How far have you walked?"*
- [ ] Prize tracks to select: RBC Challenge, Best Mr. Hyde, Best Solo Hack, Best Use of ElevenLabs, Best Use of Gemini API, Best Use of DigitalOcean
- [ ] Demo video: screen record your demo flow (3–4 min)
- [ ] Include the Werner Herzog quote in the description
- [ ] Tech stack listed: React, FastAPI, Gemini 1.5 Pro, ElevenLabs, DigitalOcean App Platform
- [ ] GitHub repo linked (make public before submission)

---

## Optional Add-On: Snowflake Integration

> **Only build this if you finish the above with 4+ hours to spare.**

Instead of passing raw transaction lists as text to Gemini, store them in Snowflake and use Snowflake Cortex for the analytical query layer. This makes the finance logic more robust and earns you the Snowflake MLH prize.

### What changes:

**Backend only.** The frontend doesn't change at all.

1. Sign up for Snowflake (120-day student trial)
2. Create a table: `TRANSACTIONS (date DATE, merchant VARCHAR, amount FLOAT, category VARCHAR, user_id VARCHAR)`
3. On CSV upload, instead of passing raw list to Gemini, first INSERT rows into Snowflake
4. Then use Snowflake Cortex to run a pre-analytical SQL query:

```sql
-- Run this via Snowflake Python connector to get structured insights BEFORE Gemini prompt
SELECT 
  category,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_spent,
  AVG(ABS(amount)) as avg_transaction,
  DAYOFWEEK(date) as day_of_week
FROM TRANSACTIONS 
WHERE user_id = 'demo'
  AND date >= DATEADD(month, -3, CURRENT_DATE())
GROUP BY category, DAYOFWEEK(date)
ORDER BY total_spent DESC;
```

5. Feed this structured SQL output to Gemini instead of raw transactions — smaller, cleaner prompt, better analysis

### Snowflake Python connector:
```python
pip install snowflake-connector-python

import snowflake.connector

conn = snowflake.connector.connect(
    user=os.getenv("SNOWFLAKE_USER"),
    password=os.getenv("SNOWFLAKE_PASSWORD"),
    account=os.getenv("SNOWFLAKE_ACCOUNT"),
    warehouse="COMPUTE_WH",
    database="FINANCE_DB",
    schema="PUBLIC"
)
```

### Additional env vars for Snowflake:
```
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_ACCOUNT=your_account_identifier
```

**Honest effort estimate:** 3-4 hours to add properly. Only worth it if you have the time and want the extra prize track.

---

## Assets You Need to Source

- `penguin.png` — Find a transparent PNG of an Adélie penguin (side view, facing right). Search "Adélie penguin transparent PNG" on Google Images or use a free resource like PNGwing.
- `mountain-bg.jpg` — Antarctic mountain landscape photo. Search Unsplash for "Antarctica mountains ice" (free to use).
- `organ-music.mp3` — The Andreas Gärtner pipe organ cover of L'Amour Toujours. Find on YouTube and convert, or search for the track directly. Confirm licensing before use in demo.

---

*Good luck. The penguin is watching.*
