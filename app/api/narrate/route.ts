import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const voiceId = process.env.ELEVENLABS_VOICE_ID!;
    const apiKey = process.env.ELEVENLABS_API_KEY!;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.85,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let message = "ElevenLabs failed";
      try {
        const parsed = JSON.parse(errorText);
        message = parsed?.detail?.message || parsed?.message || message;
      } catch {
        if (errorText) message = errorText;
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error("Narration route error:", err);
    return NextResponse.json({ error: "Narration request failed" }, { status: 500 });
  }
}
