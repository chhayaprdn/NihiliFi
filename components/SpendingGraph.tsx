type DataPoint = {
  label: string;
  value: number;
};

type SpendingGraphProps = {
  data: DataPoint[];
};

export default function SpendingGraph({ data }: SpendingGraphProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="max-w-2xl mx-auto bg-[#0d1520] border border-[#1e3a5f] rounded-xl p-6">
      <p className="text-xs uppercase tracking-widest text-[#4a6680] mb-4">Spending vs Calendar Load</p>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label} className="space-y-1">
            <div className="flex justify-between text-xs text-[#8aabb0]">
              <span>{d.label}</span>
              <span>${d.value}</span>
            </div>
            <div className="h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4a90d9] rounded-full"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
