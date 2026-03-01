"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [narrationError, setNarrationError] = useState("");
  const [usingVoiceFallback, setUsingVoiceFallback] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const analysis = localStorage.getItem("nihilifi_analysis");
    const km = localStorage.getItem("nihilifi_km");
    if (!analysis) {
      router.push("/upload");
      return;
    }

    const data = JSON.parse(analysis);
    const currentKm = km ? parseInt(km) : data.kmScore;
    setDemoMode(localStorage.getItem("nihilifi_demo_mode") === "true");

    const reportText = `
${data.weekSummary}

${data.herzogNarration}

You are currently ${currentKm} kilometers from the ocean. 
${currentKm < 20 ? "The colony is close. There may still be time." : currentKm < 50 ? "The path behind you grows distant." : "The mountains are near. He walks still."}
    `.trim();

    setReport(reportText);
    setLoading(false);
  }, [router]);

  const speakWithBrowserVoice = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setNarrationError("Browser speech synthesis is unavailable on this device.");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setUsingVoiceFallback(true);
  };

  const playReport = async () => {
    setPlaying(true);
    setNarrationError("");
    if (demoMode) {
      speakWithBrowserVoice(report);
      setPlaying(false);
      return;
    }

    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: report }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Narration failed" }));
        throw new Error(data.error || "Narration failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        audioRef.current.onended = () => setPlaying(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Narration failed";
      if ("speechSynthesis" in window) {
        speakWithBrowserVoice(report);
        setNarrationError(`${message}. Using browser voice fallback.`);
      } else {
        setNarrationError(message);
      }
      setPlaying(false);
      console.error(err);
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
      {demoMode && (
        <p className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#2a6a7a] text-white mb-6">
          Demo Mode
        </p>
      )}

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
          {narrationError && (
            <div className="max-w-xl bg-[#2b1111] border border-[#7a2a2a] rounded-xl p-4 mt-4 w-full">
              <p className="text-[#f2b8b8] text-xs">{narrationError}</p>
            </div>
          )}
          {usingVoiceFallback && (
            <div className="max-w-xl bg-[#11252b] border border-[#2a6a7a] rounded-xl p-4 mt-4 w-full">
              <p className="text-[#b8e6f2] text-xs">
                Browser TTS fallback is active because ElevenLabs is unreachable from this network.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
