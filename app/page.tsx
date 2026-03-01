"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    }
  }, [router]);

  const handleEnter = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.push("/upload");
  };

  return (
    <main
      className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
      onClick={handleEnter}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0d1a2e] to-[#0a0f1a] opacity-100" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <img
            src="/penguin.png"
            alt="The Nihilistic Penguin"
            className="w-[620px] max-w-[95vw] object-contain"
            style={{ filter: "drop-shadow(0 0 40px rgba(100,160,255,0.15))" }}
          />
          <div
            className="absolute inset-0 flex items-end justify-center pb-8"
            style={{ pointerEvents: "none" }}
          >
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(2.4rem, 6.8vw, 4.2rem)",
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

        <h1
          className="mt-10 text-6xl md:text-7xl font-bold tracking-widest text-white"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.3em" }}
        >
          NihiliFi
        </h1>

        <p className="mt-4 text-[#6b8cae] text-xl md:text-2xl tracking-wide italic">
          Neither ocean nor colony.
        </p>

        <p className="mt-14 text-[#3a5068] text-base md:text-lg animate-pulse tracking-widest uppercase">
          Click anywhere to begin your march
        </p>
      </div>

      <audio ref={audioRef} loop autoPlay playsInline preload="auto">
        <source src="/organ.mp3" type="audio/mpeg" />
      </audio>
    </main>
  );
}
