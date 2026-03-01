type AnalysisShape = {
  behavioralFingerprint: {
    type: string;
    description: string;
    primaryLeak: string;
    leakPercentage: number;
  };
  calendarCorrelations: Array<{
    pattern: string;
    evidence: string;
    estimatedCost: string;
  }>;
  kmScore: number;
  weeklyAvgOverspend: number;
  forwardLookingWarning: string;
  herzogNarration: string;
  weekSummary: string;
};

function parseAmount(row: any): number {
  const raw = row?.amount ?? row?.debit ?? row?.credit ?? "0";
  const cleaned = String(raw).replace(/[^0-9.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

function detectLeak(transactions: any[]): { label: string; cost: number; percent: number } {
  const buckets: Record<string, number> = {
    "Food Delivery": 0,
    Transport: 0,
    Coffee: 0,
    Subscriptions: 0,
    Social: 0,
    Other: 0,
  };

  for (const tx of transactions) {
    const amount = parseAmount(tx);
    const text = `${tx?.description ?? ""} ${tx?.category ?? ""}`.toLowerCase();

    if (/uber|lyft|taxi|ride/.test(text)) buckets.Transport += amount;
    else if (/doordash|ubereats|skip|delivery/.test(text)) buckets["Food Delivery"] += amount;
    else if (/coffee|starbucks|tim hortons|cafe/.test(text)) buckets.Coffee += amount;
    else if (/netflix|spotify|subscription|apple|google|prime/.test(text))
      buckets.Subscriptions += amount;
    else if (/bar|restaurant|dinner|party|club|drinks/.test(text)) buckets.Social += amount;
    else buckets.Other += amount;
  }

  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0] ?? ["Other", 0];
  const percent = total > 0 ? Math.min(100, Math.round((top[1] / total) * 100)) : 0;
  return { label: top[0], cost: top[1], percent };
}

export function buildLocalAnalysis(transactions: any[], calendarEvents: any[]): AnalysisShape {
  const totalSpend = transactions.reduce((sum, tx) => sum + parseAmount(tx), 0);
  const eventCount = calendarEvents.length;
  const leak = detectLeak(transactions);
  const weeklyAvgOverspend = Math.round(totalSpend / 4);
  const kmScore = Math.max(8, Math.min(70, Math.round(18 + weeklyAvgOverspend / 10 + eventCount / 4)));

  const identity =
    leak.label === "Food Delivery"
      ? "Convenience Drifter"
      : leak.label === "Transport"
        ? "Momentum Spender"
        : leak.label === "Subscriptions"
          ? "Subscription Hoarder"
          : leak.label === "Social"
            ? "Social Spender"
            : "Pattern Wanderer";

  return {
    behavioralFingerprint: {
      type: identity,
      description:
        "This is a local fallback analysis generated on-device because cloud analysis is currently unavailable. Your spending still shows a clear repeat pattern, and that repeat pattern is what moves the penguin inland.",
      primaryLeak: leak.label,
      leakPercentage: leak.percent,
    },
    calendarCorrelations: [
      {
        pattern: "Busier weeks appear to increase discretionary spending.",
        evidence: `${eventCount} calendar events detected with approximately $${totalSpend.toFixed(2)} in transactions.`,
        estimatedCost: `$${Math.round(totalSpend * 0.22)}`,
      },
    ],
    kmScore,
    weeklyAvgOverspend,
    forwardLookingWarning:
      eventCount > 0
        ? "Your calendar is active. If you do not pre-plan meals and transport, convenience spending will likely spike again."
        : "Without calendar context, your strongest predictor remains recurring discretionary purchases.",
    herzogNarration:
      "Here we observe the modern spender, suspended between intention and impulse. The receipts accumulate not in violence, but in a soft repetition: one tap, one ride, one delivery, one more small surrender. The penguin does not argue with the storm. He only walks through it. In this ledger there is no villain, only gravity - and gravity always favors habit. Yet even now, at the edge of discouragement, there remains a narrow geometry of choice: a meal prepared before hunger, a pause before checkout, a plan before the week begins. These are not heroic acts. They are small acts. But small acts are the only ones that change direction. And still, the penguin walks.",
    weekSummary:
      "You are not losing money in one dramatic collapse; you are leaking it in a thousand polite decisions.",
  };
}
