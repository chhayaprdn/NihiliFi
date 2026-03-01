export function calculateKMDelta(
  amount: number,
  weeklyBudget: number = 200,
  currentKm: number = 35
): number {
  if (amount < 20) return 0.5;
  if (amount < 60) return Math.round(amount / 20);
  return Math.min(Math.round(amount / 15), 8);
}

export function getKMMessage(km: number): string {
  if (km <= 10) return "He is near the ocean. This can continue.";
  if (km <= 25) return "He walks. Not yet alarming.";
  if (km <= 40) return "The colony grows distant.";
  if (km <= 55) return "The mountains are visible now.";
  if (km <= 65) return "He will not return.";
  return "70 kilometers. The end.";
}
