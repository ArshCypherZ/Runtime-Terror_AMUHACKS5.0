export type ExamType = "cbse-12" | "icse-12" | "jee" | "neet" | "college-semester";

export interface Subject {
  name: string;
  status: "critical" | "warning" | "on-track";
  chapters: string[];
  completedChapters: number;
  totalChapters: number;
  weightage: number; // percentage
  hoursNeeded: number;
}

export interface QuickWin {
  subject: string;
  task: string;
  timeMinutes: number;
  impact: string;
}

export interface TriageResult {
  narrative: string; // streaming text
  subjects: Subject[];
  quickWin: QuickWin;
}

export interface DailyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number; // minutes
  type: "study" | "practice" | "revision";
  completed: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  tasks: DailyTask[];
  focusSubject: string;
}

export interface RecoveryPlan {
  overview: string;
  mode: "survival" | "thriving";
  subjects: Subject[];
  dailyPlan: DayPlan[];
  tradeoffs: string[];
  keyInsight: string;
}

export interface OnboardingData {
  exam: ExamType | null;
  reason: string;
  daysMissed: number;
  subjects: string[];
  stressLevel: number;
  worry: string;
}

export interface DashboardStats {
  recoveryScore: number;
  daysRemaining: number;
  todayTasks: number;
  todayCompleted: number;
  subjectProgress: {
    subject: string;
    progress: number;
    status: "critical" | "warning" | "on-track";
  }[];
  timelineData: {
    day: string;
    planned: number;
    completed: number;
  }[];
  readinessData: {
    subject: string;
    readiness: number;
  }[];
}
