# NihiliFi

Neither ocean nor colony.

NihiliFi is a darkly humorous personal finance app that analyzes your spending behavior (optionally against your calendar), then visualizes your financial trajectory through a penguin metaphor: every poor decision moves the penguin closer to the mountains.

Built for hackathon demos, it combines serious behavioral insights with narrative storytelling and voice output.

## What It Does

- Upload bank transactions as CSV.
- Optionally upload Google Calendar events as ICS.
- Generate behavioral finance analysis with Gemini.
- Convert narration text to speech with ElevenLabs.
- Visualize risk with a live KM tracker (ocean -> mountains).
- Log new spending in real time and update trajectory.
- Produce a weekly report with narration.

## Demo Mode

NihiliFi includes a Demo Mode for unreliable networks or API outages.

- Uses local, on-device fallback analysis.
- Uses browser speech synthesis fallback for narration.
- Can be toggled from the upload screen.
- Lets you run a full end-to-end demo without cloud dependencies.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Gemini API
- ElevenLabs API

## Project Structure

```text
app/
  page.tsx                # Intro splash
  upload/page.tsx         # CSV/ICS upload + analyze
  dashboard/page.tsx      # Main tracker dashboard
  report/page.tsx         # Weekly report screen
  api/analyze/route.ts    # Gemini analysis endpoint
  api/narrate/route.ts    # ElevenLabs narration endpoint
  api/report/route.ts     # Report generation endpoint
lib/
  parseCSV.ts
  parseICS.ts
  penguinEngine.ts
  localAnalysis.ts        # Offline fallback analysis
public/
  penguin.png
  penguin2.png
  ocean.png
  mountains.png
  organ.mp3
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in project root:

```env
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id
```

3. Run development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Deployment (DigitalOcean App Platform)

- Build command: `npm run build`
- Run command: `npm start`
- Port: `3000`
- Add the same three environment variables in App settings.

## Notes

- `.env.local` is ignored by git and should never be committed.
- Some browsers block unmuted autoplay audio by policy.
- For stable demos, keep Demo Mode enabled if cloud APIs are unstable.