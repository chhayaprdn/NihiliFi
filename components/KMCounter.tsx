type KMCounterProps = {
  kmScore: number;
};

export default function KMCounter({ kmScore }: KMCounterProps) {
  return (
    <div className="text-center">
      <span className="text-7xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
        {kmScore}
      </span>
      <span className="text-2xl text-[#4a6680] ml-2">km</span>
      <p className="text-[#4a6680] text-sm mt-1">from the ocean</p>
    </div>
  );
}
