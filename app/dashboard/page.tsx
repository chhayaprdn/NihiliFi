"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [kmScore, setKmScore] = useState(0);
  const [newSpend, setNewSpend] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [narrating, setNarrating] = useState(false);
  const [narratorText, setNarratorText] = useState("");
  const [narrationError, setNarrationError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nihilifi_analysis");
    if (!stored) {
      router.push("/upload");
      return;
    }
    const data = JSON.parse(stored);
    setAnalysis(data);
    setKmScore(data.kmScore || 35);
  }, [router]);

  const handleLogSpend = async () => {
    const amount = parseFloat(newSpend);
    if (isNaN(amount) || amount <= 0) return;

    const kmChange = Math.min(Math.round(amount / 20), 5);
    const newKm = Math.min(kmScore + kmChange, 70);
    setKmScore(newKm);
    localStorage.setItem("nihilifi_km", newKm.toString());

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
    setNarrationError("");
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Narration failed";
      setNarrationError(message);
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

  if (!analysis)
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center text-white">
        The penguin is thinking...
      </div>
    );

  const penguinPositionPercent = (kmScore / 70) * 80 + 5;

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white p-6">
      <audio ref={audioRef} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-widest" style={{ fontFamily: "Georgia, serif" }}>
          NihiliFi
        </h1>
        <button
          onClick={() => router.push("/report")}
          className="text-sm text-[#4a90d9] hover:text-white transition-colors"
        >
          Weekly Report →
        </button>
      </div>

      <div className="text-center mb-6">
        <span className="text-7xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
          {kmScore}
        </span>
        <span className="text-2xl text-[#4a6680] ml-2">km</span>
        <p className="text-[#4a6680] text-sm mt-1">from the ocean</p>
      </div>

      <div className="relative w-full max-w-2xl mx-auto mb-10 h-24 bg-[#0d1520] rounded-2xl overflow-hidden border border-[#1e3a5f]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a6b8f] text-xs uppercase tracking-widest">
          🌊 Ocean
        </span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a4040] text-xs uppercase tracking-widest">
          Mountains ⛰️
        </span>
        <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-[#1e3a5f]" />
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
          style={{ left: `${penguinPositionPercent}%` }}
        >
          <img src="/penguin.png" alt="penguin" className="w-12 h-12 object-contain" />
        </div>
        {kmScore >= 50 && (
          <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-red-900/20 to-transparent" />
        )}
      </div>

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

      <div className="max-w-2xl mx-auto mb-6 bg-[#12060a] border border-[#5a1a1a] rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-[#8a3030] mb-2">The Penguin Warns You</p>
        <p className="text-[#c09090] text-sm italic leading-relaxed">
          "{analysis.forwardLookingWarning}"
        </p>
      </div>

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

      <div className="max-w-2xl mx-auto mb-4 flex justify-center">
        <button
          onClick={playOnboarding}
          disabled={narrating}
          className="flex items-center gap-3 px-8 py-3 border border-[#4a90d9] rounded-full text-[#4a90d9] hover:bg-[#4a90d9] hover:text-black transition-all text-sm tracking-widest uppercase disabled:opacity-40"
        >
          {narrating ? "🎙️ The penguin speaks..." : "🎙️ Hear Your Financial Report"}
        </button>
      </div>

      {narrationError && (
        <div className="max-w-2xl mx-auto mt-2 bg-[#2b1111] border border-[#7a2a2a] rounded-xl p-4">
          <p className="text-[#f2b8b8] text-xs">{narrationError}</p>
        </div>
      )}

      {narratorText && (
        <div className="max-w-2xl mx-auto mt-4 bg-[#06090f] border border-[#0e2035] rounded-xl p-5">
          <p className="text-[#4a6680] text-xs italic leading-relaxed">"{narratorText}"</p>
        </div>
      )}
    </main>
  );
}
