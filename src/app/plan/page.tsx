"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "@/components/ui/blur-fade";
import { Logo } from "@/components/logo";
import { useAppStore } from "@/lib/store";
import type { RecoveryPlan } from "@/lib/types";

const taskTypeIcons = {
  study: BookOpen,
  practice: FlaskConical,
  revision: RotateCcw,
};

const taskTypeColors = {
  study: "bg-ember/10 text-ember",
  practice: "bg-gold/10 text-gold",
  revision: "bg-sage/10 text-sage",
};

export default function PlanPage() {
  const router = useRouter();
  const { plan, setPlan, toggleTask, onboarding, triage } = useAppStore();
  const [mode, setMode] = useState<"survival" | "thriving">("survival");
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the recovery plan from the API on mount
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const sessionId = localStorage.getItem("catchup-session-id");
        const response = await fetch("/api/plan/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            exam: onboarding.exam,
            subjects: onboarding.subjects,
            daysAbsent: onboarding.daysMissed,
            absenceReason: onboarding.reason,
            stressLevel: onboarding.stressLevel,
            triageResult: triage
              ? {
                  subjects: triage.subjects.map((s) => ({
                    name: s.name,
                    status: s.status,
                    priority: s.status === "critical" ? 1 : s.status === "warning" ? 2 : 3,
                  })),
                }
              : null,
            mode,
          }),
        });

        const data = await response.json();
        if (data.success && data.plan) {
          setPlan(data.plan);
        }
      } catch (error) {
        console.error("Plan generation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [setPlan, onboarding, triage, mode]);

  const handleModeSwitch = async (newMode: string) => {
    const m = newMode as "survival" | "thriving";
    setMode(m);
    setIsLoading(true);

    try {
      const sessionId = localStorage.getItem("catchup-session-id");
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          exam: onboarding.exam,
          subjects: onboarding.subjects,
          daysAbsent: onboarding.daysMissed,
          absenceReason: onboarding.reason,
          stressLevel: onboarding.stressLevel,
          triageResult: triage
            ? {
                subjects: triage.subjects.map((s) => ({
                  name: s.name,
                  status: s.status,
                  priority: s.status === "critical" ? 1 : s.status === "warning" ? 2 : 3,
                })),
              }
            : null,
          mode: m,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (error) {
      console.error("Plan mode switch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (dayIndex: number, taskId: string) => {
    // Optimistic local update
    toggleTask(dayIndex, taskId);

    // Persist to backend
    try {
      const sessionId = localStorage.getItem("catchup-session-id");
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          taskId,
          dayIndex,
          planMode: mode,
        }),
      });
    } catch (error) {
      console.error("Failed to sync task progress:", error);
    }
  };

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-surface-raised border-t-ember mx-auto mb-4"
          />
          <p className="text-muted-foreground font-medium">
            Building your recovery plan...
          </p>
        </motion.div>
      </div>
    );
  }

  const currentPlan = plan;
  const todayPlan = currentPlan.dailyPlan[selectedDay];
  const completedTasks =
    todayPlan?.tasks.filter((t) => t.completed).length ?? 0;
  const totalTasks = todayPlan?.tasks.length ?? 0;
  const totalMinutes =
    todayPlan?.tasks.reduce((sum, t) => sum + t.duration, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Glassmorphic Sticky Header */}
      <div className="glass-strong sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Logo className="h-5 w-5 text-ember" />
                <span className="font-display font-semibold text-sm tracking-tight text-cream">
                  CatchUp AI
                </span>
              </Link>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-xs border-border text-muted-foreground hover:text-cream hover:border-ember/30"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-cream">
                Your Recovery Plan
              </h1>
              <p className="text-sm text-muted-foreground">
                14 days &middot; {currentPlan.subjects.length} subjects &middot;{" "}
                {currentPlan.subjects.reduce(
                  (s, sub) => s + sub.hoursNeeded,
                  0
                )}{" "}
                total hours
              </p>
            </div>

            <Tabs value={mode} onValueChange={handleModeSwitch}>
              <TabsList className="bg-surface">
                <TabsTrigger value="survival" className="text-xs">
                  Survival
                </TabsTrigger>
                <TabsTrigger value="thriving" className="text-xs">
                  Thriving
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
        {/* Overview — gradient border card */}
        <BlurFade delay={0.1}>
          <div className="gradient-border rounded-2xl mb-6">
            <div className="p-6 rounded-2xl bg-surface">
              <p className="text-cream/80 leading-relaxed text-sm">
                {currentPlan.overview}
              </p>
            </div>
          </div>
        </BlurFade>

        {/* Day Selector — warm theme */}
        <BlurFade delay={0.15}>
          <div className="mb-6">
            <h3 className="font-display font-semibold text-sm text-cream mb-3">
              Week Timeline
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              {currentPlan.dailyPlan.map((day, i) => {
                const dayCompleted =
                  day.tasks.filter((t) => t.completed).length ===
                  day.tasks.length;
                const isSelected = selectedDay === i;
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-shrink-0 w-[72px] rounded-xl p-3 text-center transition-all border ${
                      isSelected
                        ? "border-ember/40 bg-ember/10 glow-ember"
                        : dayCompleted
                        ? "border-sage/30 bg-sage/5"
                        : "border-border bg-surface hover:border-ember/20"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isSelected ? "text-ember" : "text-muted-foreground"
                      }`}
                    >
                      Day {day.day}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-ember/70" : "text-muted-foreground/60"
                      }`}
                    >
                      {day.date.split(",")[0]}
                    </div>
                    {dayCompleted && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-sage mx-auto mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </BlurFade>

        {/* Today's Plan */}
        <BlurFade delay={0.2}>
          <Card className="mb-6 bg-surface border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-cream font-display">
                  Day {todayPlan.day} — {todayPlan.date}
                </CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-surface-raised text-cream"
                  >
                    {completedTasks}/{totalTasks} done
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Focus:{" "}
                <span className="font-medium text-ember">
                  {todayPlan.focusSubject}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayPlan.tasks.map((task) => {
                  const TypeIcon = taskTypeIcons[task.type];
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        task.completed
                          ? "bg-surface-raised/50 border-border/50"
                          : "bg-surface border-border hover:border-ember/20"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(selectedDay, task.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-sage" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-ember transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-cream"
                          }`}
                        >
                          {task.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${taskTypeColors[task.type]}`}
                          >
                            <TypeIcon className="h-3 w-3" />
                            {task.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {task.duration} min
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {task.subject}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Key Insight — Gold themed */}
        <BlurFade delay={0.25}>
          <Card className="mb-6 border-gold/20 bg-gold/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Lightbulb className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-semibold text-sm text-gold mb-1">
                    Key Insight
                  </p>
                  <p className="text-sm text-gold/80 leading-relaxed">
                    {currentPlan.keyInsight}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Trade-offs */}
        <BlurFade delay={0.3}>
          <Card className="mb-6 bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-cream font-display">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Trade-offs in {mode === "survival" ? "Survival" : "Thriving"}{" "}
                Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentPlan.tradeoffs.map((tradeoff, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <ChevronRight className="h-4 w-4 text-ember/50 flex-shrink-0 mt-0.5" />
                    {tradeoff}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </BlurFade>

        {/* CTA to Dashboard */}
        <BlurFade delay={0.35}>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              className="bg-ember hover:bg-ember/90 text-white h-12 px-8"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
