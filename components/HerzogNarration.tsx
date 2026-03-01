"use client";

import { useRef, useState } from "react";

type HerzogNarrationProps = {
  text: string;
};

export default function HerzogNarration({ text }: HerzogNarrationProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const play = async () => {
    setPlaying(true);
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
        await audioRef.current.play();
        audioRef.current.onended = () => setPlaying(false);
      } else {
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <audio ref={audioRef} />
      <button
        onClick={play}
        disabled={playing}
        className="px-8 py-3 border border-[#4a90d9] rounded-full text-[#4a90d9] hover:bg-[#4a90d9] hover:text-black transition-all text-sm tracking-widest uppercase disabled:opacity-40"
      >
        {playing ? "Speaking..." : "Hear narration"}
      </button>
    </div>
  );
}
