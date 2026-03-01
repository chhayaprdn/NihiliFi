import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { analysis, kmScore } = await req.json();

    if (!analysis) {
      return NextResponse.json({ error: "Missing analysis payload" }, { status: 400 });
    }

    const currentKm = typeof kmScore === "number" ? kmScore : analysis.kmScore ?? 35;
    const reportText = `
${analysis.weekSummary ?? ""}

${analysis.herzogNarration ?? ""}

You are currently ${currentKm} kilometers from the ocean.
${currentKm < 20
    ? "The colony is close. There may still be time."
    : currentKm < 50
      ? "The path behind you grows distant."
      : "The mountains are near. He walks still."}
    `.trim();

    return NextResponse.json({ report: reportText });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
