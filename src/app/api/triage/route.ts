import { NextRequest, NextResponse } from "next/server";
import { generateTriage, generateTriageStream } from "@/lib/services/groq";
import { generateSpeech } from "@/lib/services/cartesia";
import { getOrCreateUser, saveOnboardingData, saveTriageResult } from "@/lib/services/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam, subjects, daysAbsent, absenceReason, stressLevel, worryText, sessionId } = body;

    // Validate required fields
    if (!exam || !subjects?.length || !daysAbsent || !stressLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create user session
    const user = await getOrCreateUser(sessionId || crypto.randomUUID());

    // Save onboarding data
    await saveOnboardingData(user.id, {
      exam,
      subjects,
      daysAbsent,
      absenceReason,
      stressLevel,
      worryText: worryText || "",
    });

    // Generate triage analysis using Groq
    const triageResult = await generateTriage({
      exam,
      subjects,
      daysAbsent,
      absenceReason,
      stressLevel,
      worryText: worryText || "",
    });

    // Generate TTS audio from narrative using Cartesia
    let audioBase64: string | null = null;
    try {
      const audioBuffer = await generateSpeech({
        text: triageResult.narrative,
        emotion: stressLevel >= 7 ? "empathetic" : "encouraging",
        speed: "slow",
      });
      audioBase64 = Buffer.from(audioBuffer).toString("base64");
    } catch (ttsError) {
      console.error("TTS generation failed, continuing without audio:", ttsError);
    }

    // Save triage result to database
    await saveTriageResult(user.id, {
      ...triageResult,
      audioUrl: audioBase64 ? "data:audio/wav;base64," : undefined,
    });

    return NextResponse.json({
      success: true,
      sessionId: user.sessionId,
      triage: triageResult,
      audio: audioBase64,
    });
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      { error: "Failed to generate triage analysis" },
      { status: 500 }
    );
  }
}

// Streaming endpoint for real-time text display
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  // For streaming, we use a simpler approach - the client calls POST first,
  // then this endpoint streams the narrative word by word for the typing effect
  // In production, this would use Server-Sent Events with the Groq stream

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const user = await getOrCreateUser(sessionId);
        
        const triageStream = await generateTriageStream({
          exam: searchParams.get("exam") || "NEET",
          subjects: searchParams.get("subjects")?.split(",") || [],
          daysAbsent: parseInt(searchParams.get("daysAbsent") || "7"),
          absenceReason: searchParams.get("reason") || "illness",
          stressLevel: parseInt(searchParams.get("stress") || "5"),
          worryText: searchParams.get("worry") || "",
        });

        for await (const chunk of triageStream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
