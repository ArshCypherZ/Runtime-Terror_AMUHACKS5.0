import { NextRequest, NextResponse } from "next/server";
import { generateSpeech, generateSpeechStream } from "@/lib/services/cartesia";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, speed, emotion, stream: useStream } = body;

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 5000 characters." },
        { status: 400 }
      );
    }

    // Streaming audio response
    if (useStream) {
      const audioStream = await generateSpeechStream({
        text,
        voiceId,
        speed: speed || "normal",
        emotion: emotion || "empathetic",
      });

      return new Response(audioStream, {
        headers: {
          "Content-Type": "audio/pcm",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Full audio response
    const audioBuffer = await generateSpeech({
      text,
      voiceId,
      speed: speed || "normal",
      emotion: emotion || "empathetic",
    });

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
