import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/services/db";
import { db } from "@/lib/services/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);

    const [onboarding, latestTriage, plans, progress] = await Promise.all([
      db.onboarding.findUnique({ where: { userId: user.id } }),
      db.triageResult.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.recoveryPlan.findMany({ where: { userId: user.id } }),
      db.taskProgress.findMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        sessionId: user.sessionId,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      },
      onboarding: onboarding
        ? {
            exam: onboarding.exam,
            subjects: onboarding.subjects,
            daysAbsent: onboarding.daysAbsent,
            absenceReason: onboarding.absenceReason,
            stressLevel: onboarding.stressLevel,
          }
        : null,
      hasTriageResult: !!latestTriage,
      plans: plans.map((p) => ({ mode: p.mode, updatedAt: p.updatedAt })),
      taskProgress: {
        total: progress.length,
        completed: progress.filter((p) => p.completed).length,
      },
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    const user = await getOrCreateUser(sessionId || crypto.randomUUID());

    return NextResponse.json({
      success: true,
      sessionId: user.sessionId,
      userId: user.id,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user session" },
      { status: 500 }
    );
  }
}
