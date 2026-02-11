import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Helper functions for common database operations

export async function getOrCreateUser(sessionId: string) {
  return db.user.upsert({
    where: { sessionId },
    update: { lastActiveAt: new Date() },
    create: {
      sessionId,
      lastActiveAt: new Date(),
    },
  });
}

export async function saveOnboardingData(
  userId: string,
  data: {
    exam: string;
    subjects: string[];
    daysAbsent: number;
    absenceReason: string;
    stressLevel: number;
    worryText: string;
  }
) {
  return db.onboarding.upsert({
    where: { userId },
    update: {
      ...data,
      updatedAt: new Date(),
    },
    create: {
      userId,
      ...data,
    },
  });
}

export async function saveTriageResult(
  userId: string,
  data: {
    narrative: string;
    subjects: Array<{
      name: string;
      status: string;
      priority: number;
      hoursNeeded: number;
      topicsToFocus: string[];
      reason: string;
    }>;
    quickWin: {
      title: string;
      description: string;
      timeMinutes: number;
      subject: string;
    };
    audioUrl?: string;
  }
) {
  return db.triageResult.create({
    data: {
      userId,
      narrative: data.narrative,
      subjects: JSON.stringify(data.subjects),
      quickWin: JSON.stringify(data.quickWin),
      audioUrl: data.audioUrl,
    },
  });
}

export async function savePlan(
  userId: string,
  mode: "survival" | "thriving",
  plan: unknown
) {
  return db.recoveryPlan.upsert({
    where: {
      userId_mode: { userId, mode },
    },
    update: {
      plan: JSON.stringify(plan),
      updatedAt: new Date(),
    },
    create: {
      userId,
      mode,
      plan: JSON.stringify(plan),
    },
  });
}

export async function toggleTaskCompletion(
  userId: string,
  planMode: string,
  dayIndex: number,
  taskId: string
) {
  const existing = await db.taskProgress.findUnique({
    where: {
      userId_taskId: { userId, taskId },
    },
  });

  if (existing) {
    return db.taskProgress.update({
      where: { id: existing.id },
      data: { completed: !existing.completed, updatedAt: new Date() },
    });
  }

  return db.taskProgress.create({
    data: {
      userId,
      taskId,
      dayIndex,
      planMode,
      completed: true,
    },
  });
}

export async function getUserProgress(userId: string) {
  const tasks = await db.taskProgress.findMany({
    where: { userId },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
    tasksByDay: tasks.reduce(
      (acc, t) => {
        const day = t.dayIndex;
        if (!acc[day]) acc[day] = { total: 0, completed: 0 };
        acc[day].total++;
        if (t.completed) acc[day].completed++;
        return acc;
      },
      {} as Record<number, { total: number; completed: number }>
    ),
  };
}
