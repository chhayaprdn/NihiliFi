"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { parseCSV } from "@/lib/parseCSV";
import { parseICS } from "@/lib/parseICS";

export default function UploadPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  const [icsReady, setIcsReady] = useState(false);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    setTransactions(parsed);
    localStorage.setItem("nihilifi_transactions", JSON.stringify(parsed));
    setCsvReady(true);
  };

  const handleICS = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseICS(text);
    setCalendarEvents(parsed);
    localStorage.setItem("nihilifi_calendar", JSON.stringify(parsed));
    setIcsReady(true);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, calendarEvents }),
      });
      const data = await res.json();
      localStorage.setItem("nihilifi_analysis", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white p-8">
      <h2
        className="text-3xl font-bold text-center mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Show the penguin your finances.
      </h2>
      <p className="text-center text-[#6b8cae] italic mb-12">
        He will not judge you. He is already walking away.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <label className="border border-[#1e3a5f] rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-[#4a90d9] transition-colors bg-[#0d1520]">
          <span className="text-4xl mb-4">💳</span>
          <span className="text-lg font-semibold mb-2">Transaction History</span>
          <span className="text-sm text-[#4a6680] text-center mb-4">
            Export CSV from your bank (RBC, TD, Scotiabank etc.)
          </span>
          {csvReady ? (
            <span className="text-green-400 text-sm">
              ✓ {transactions.length} transactions loaded
            </span>
          ) : (
            <span className="text-[#3a5068] text-xs">
              CSV format: Date, Description, Amount
            </span>
          )}
          <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
        </label>

        <label className="border border-[#1e3a5f] rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-[#4a90d9] transition-colors bg-[#0d1520]">
          <span className="text-4xl mb-4">📅</span>
          <span className="text-lg font-semibold mb-2">Google Calendar</span>
          <span className="text-sm text-[#4a6680] text-center mb-4">
            Settings → Export → Download .ics file
          </span>
          {icsReady ? (
            <span className="text-green-400 text-sm">
              ✓ {calendarEvents.length} events loaded
            </span>
          ) : (
            <span className="text-[#3a5068] text-xs">
              ICS format from Google Calendar
            </span>
          )}
          <input type="file" accept=".ics" onChange={handleICS} className="hidden" />
        </label>
      </div>

      {csvReady && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-10 py-4 bg-[#1e3a5f] hover:bg-[#2a4f80] rounded-full text-white font-semibold tracking-widest uppercase text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "The penguin is analyzing..." : "Analyze My Finances"}
          </button>
        </div>
      )}

      {!csvReady && (
        <p className="text-center text-[#2a3f55] text-sm mt-8">
          Calendar is optional — but patterns are richer with it.
        </p>
      )}
    </main>
  );
}
