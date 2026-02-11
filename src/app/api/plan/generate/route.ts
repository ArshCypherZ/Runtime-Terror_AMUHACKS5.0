import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/services/groq";
import { getOrCreateUser, savePlan } from "@/lib/services/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, exam, subjects, daysAbsent, absenceReason, stressLevel, triageResult, mode } = body;

    if (!sessionId || !exam || !subjects?.length || !triageResult || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["survival", "thriving"].includes(mode)) {
      return NextResponse.json(
        { error: "Mode must be 'survival' or 'thriving'" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    // Generate recovery plan using Groq
    const plan = await generatePlan({
      exam,
      subjects,
      daysAbsent,
      absenceReason,
      stressLevel,
      triageResult,
      mode,
    });

    // Save plan to database
    await savePlan(user.id, mode, plan);

    return NextResponse.json({
      success: true,
      plan,
      mode,
    });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recovery plan" },
      { status: 500 }
    );
  }
}
