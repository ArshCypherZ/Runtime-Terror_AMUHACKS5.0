import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, toggleTaskCompletion, getUserProgress } from "@/lib/services/db";

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
    const progress = await getUserProgress(user.id);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, taskId, dayIndex, planMode } = body;

    if (!sessionId || !taskId || dayIndex === undefined || !planMode) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, taskId, dayIndex, planMode" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(sessionId);
    const task = await toggleTaskCompletion(user.id, planMode, dayIndex, taskId);

    return NextResponse.json({
      success: true,
      task: {
        taskId: task.taskId,
        completed: task.completed,
        dayIndex: task.dayIndex,
      },
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
