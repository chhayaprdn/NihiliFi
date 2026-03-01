"use client";

import { useState } from "react";

type TransactionLogProps = {
  onLog: (amount: number, description: string) => void;
};

export default function TransactionLog({ onLog }: TransactionLogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    onLog(parsed, description);
    setAmount("");
    setDescription("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0d1520] border border-[#1e3a5f] rounded-xl p-6">
      <p className="text-xs uppercase tracking-widest text-[#4a6680] mb-4">Log a Spend</p>
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="$0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-[#0a0f1a] border border-[#1e3a5f] rounded-lg px-4 py-2 text-white w-32 text-sm focus:outline-none focus:border-[#4a90d9]"
        />
        <input
          type="text"
          placeholder="What did you spend it on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#0a0f1a] border border-[#1e3a5f] rounded-lg px-4 py-2 text-white flex-1 text-sm focus:outline-none focus:border-[#4a90d9]"
        />
        <button
          onClick={submit}
          className="bg-[#1e3a5f] hover:bg-[#2a4f80] px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Log
        </button>
      </div>
    </div>
  );
}
