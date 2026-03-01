type PenguinWalkerProps = {
  kmScore: number;
};

export default function PenguinWalker({ kmScore }: PenguinWalkerProps) {
  const penguinPositionPercent = (kmScore / 70) * 80 + 5;

  return (
    <div className="relative w-full max-w-2xl mx-auto h-24 bg-[#0d1520] rounded-2xl overflow-hidden border border-[#1e3a5f]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a6b8f] text-xs uppercase tracking-widest">
        Ocean
      </span>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a4040] text-xs uppercase tracking-widest">
        Mountains
      </span>
      <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-[#1e3a5f]" />
      <div
        className="penguin-walker absolute top-1/2 -translate-y-1/2"
        style={{ left: `${penguinPositionPercent}%` }}
      >
        <img src="/penguin.png" alt="penguin" className="w-12 h-12 object-contain" />
      </div>
    </div>
  );
}
