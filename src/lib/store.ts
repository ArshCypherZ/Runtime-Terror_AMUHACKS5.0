import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData, TriageResult, RecoveryPlan, DashboardStats } from "./types";

interface AppState {
  // Onboarding
  onboarding: OnboardingData;
  setOnboarding: (data: Partial<OnboardingData>) => void;

  // Triage (Panic Mode result)
  triage: TriageResult | null;
  setTriage: (data: TriageResult) => void;

  // Recovery Plan
  plan: RecoveryPlan | null;
  setPlan: (data: RecoveryPlan) => void;

  // Dashboard
  dashboard: DashboardStats | null;
  setDashboard: (data: DashboardStats) => void;

  // Task completion
  toggleTask: (dayIndex: number, taskId: string) => void;

  // Reset
  reset: () => void;
}

const defaultOnboarding: OnboardingData = {
  exam: null,
  reason: "",
  daysMissed: 7,
  subjects: [],
  stressLevel: 5,
  worry: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarding: defaultOnboarding,
      setOnboarding: (data) =>
        set((state) => ({
          onboarding: { ...state.onboarding, ...data },
        })),

      triage: null,
      setTriage: (data) => set({ triage: data }),

      plan: null,
      setPlan: (data) => set({ plan: data }),

      dashboard: null,
      setDashboard: (data) => set({ dashboard: data }),

      toggleTask: (dayIndex, taskId) => {
        const plan = get().plan;
        if (!plan) return;
        const updatedPlan = { ...plan };
        updatedPlan.dailyPlan = updatedPlan.dailyPlan.map((day, i) => {
          if (i !== dayIndex) return day;
          return {
            ...day,
            tasks: day.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
          };
        });
        set({ plan: updatedPlan });
      },

      reset: () =>
        set({
          onboarding: defaultOnboarding,
          triage: null,
          plan: null,
          dashboard: null,
        }),
    }),
    {
      name: "catchup-ai-storage",
    }
  )
);
