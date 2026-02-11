"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Target,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Logo } from "@/components/logo";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAppStore } from "@/lib/store";

const statusConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertCircle,
    color: "text-gold",
    progress: "bg-gold",
  },
  "on-track": {
    icon: CheckCircle2,
    color: "text-sage",
    progress: "bg-sage",
  },
};

const areaChartConfig = {
  planned: {
    label: "Planned",
    color: "#292524",
  },
  completed: {
    label: "Completed",
    color: "#E8552D",
  },
};

const barChartConfig = {
  readiness: {
    label: "Readiness",
    color: "#E8552D",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { plan } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  } | null>(null);

  // Fetch progress data from the API
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const sessionId = localStorage.getItem("catchup-session-id");
        if (sessionId) {
          const response = await fetch(`/api/progress?sessionId=${sessionId}`);
          const data = await response.json();
          if (data.success) {
            setProgressData(data.progress);
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Derive all dashboard stats from the store plan ──
  const allTasks = plan?.dailyPlan.flatMap((d) => d.tasks) ?? [];
  const completedTotal = progressData?.completedTasks ?? allTasks.filter((t) => t.completed).length;
  const taskCount = progressData?.totalTasks ?? allTasks.length;

  const subjectNames = plan
    ? [...new Set(allTasks.map((t) => t.subject))]
    : ["Physics", "Chemistry", "Biology - Botany", "Biology - Zoology"];

  const data = {
    recoveryScore: taskCount > 0 ? Math.round((completedTotal / taskCount) * 100) : 0,
    daysRemaining: 14,
    todayTasks: plan?.dailyPlan[0]?.tasks.length ?? 0,
    todayCompleted: plan?.dailyPlan[0]?.tasks.filter((t) => t.completed).length ?? 0,
    subjectProgress: subjectNames.map((name) => {
      const tasks = allTasks.filter((t) => t.subject === name);
      const done = tasks.filter((t) => t.completed).length;
      const total = tasks.length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        subject: name.replace("Biology - ", "Bio - "),
        progress,
        status: (progress >= 60 ? "on-track" : progress >= 30 ? "warning" : "critical") as
          | "critical"
          | "warning"
          | "on-track",
      };
    }),
    timelineData: plan?.dailyPlan.map((day) => ({
      day: `Day ${day.day}`,
      planned: day.tasks.length,
      completed: day.tasks.filter((t) => t.completed).length,
    })) ?? [],
    readinessData: subjectNames.map((name) => {
      const tasks = allTasks.filter((t) => t.subject === name);
      const done = tasks.filter((t) => t.completed).length;
      const total = tasks.length;
      return {
        subject: name.replace("Biology - ", ""),
        readiness: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    }),
  };

  if (isLoading) {
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
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Glassmorphic Header */}
      <div className="glass-strong border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
              onClick={() => router.push("/plan")}
              className="text-xs border-border text-muted-foreground hover:text-cream hover:border-ember/30"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Recovery Plan
            </Button>
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-cream mt-3">
            Recovery Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and stay on course
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-6">
        {/* KPI Cards — MagicCards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <BlurFade delay={0.1}>
            <MagicCard
              className="rounded-2xl"
              gradientFrom="#E8552D"
              gradientTo="#D4A853"
              gradientColor="#1C1917"
              gradientOpacity={0.15}
            >
              <div className="p-6 relative overflow-hidden">
                <BorderBeam
                  size={100}
                  duration={6}
                  colorFrom="#E8552D"
                  colorTo="#D4A853"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ember/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-ember" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Recovery Score
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-cream font-display">
                        {mounted ? (
                          <NumberTicker value={data.recoveryScore} />
                        ) : (
                          data.recoveryScore
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.15}>
            <MagicCard
              className="rounded-2xl"
              gradientFrom="#D4A853"
              gradientTo="#E8552D"
              gradientColor="#1C1917"
              gradientOpacity={0.15}
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Days Remaining
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-cream font-display">
                        {mounted ? (
                          <NumberTicker value={data.daysRemaining} />
                        ) : (
                          data.daysRemaining
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of 14
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={0.2}>
            <MagicCard
              className="rounded-2xl"
              gradientFrom="#4A7C59"
              gradientTo="#D4A853"
              gradientColor="#1C1917"
              gradientOpacity={0.15}
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-sage" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Today&apos;s Tasks
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-cream font-display">
                        {mounted ? (
                          <NumberTicker value={data.todayCompleted} />
                        ) : (
                          data.todayCompleted
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {data.todayTasks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        </div>

        {/* Subject Progress */}
        <BlurFade delay={0.25}>
          <h3 className="font-display font-semibold text-sm text-cream mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Subject Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {data.subjectProgress.map((subject, i) => {
              const config = statusConfig[subject.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="bg-surface border-border">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${config.color}`} />
                          <span className="font-medium text-sm text-cream">
                            {subject.subject}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-cream">
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-raised rounded-full h-2.5">
                        <motion.div
                          className={`h-2.5 rounded-full ${config.progress}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{
                            duration: 1.2,
                            delay: 0.5 + i * 0.15,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </BlurFade>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BlurFade delay={0.35}>
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-cream font-display">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Study Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={areaChartConfig}
                  className="h-[250px] w-full"
                >
                  <AreaChart data={data.timelineData}>
                    <defs>
                      <linearGradient
                        id="fillPlanned"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#292524"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#292524"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="fillCompleted"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#E8552D"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#E8552D"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#292524"
                    />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                      stroke="#78716C"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                      stroke="#78716C"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="planned"
                      stroke="#44403C"
                      fill="url(#fillPlanned)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#E8552D"
                      fill="url(#fillCompleted)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </BlurFade>

          <BlurFade delay={0.4}>
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-cream font-display">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Exam Readiness by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={barChartConfig}
                  className="h-[250px] w-full"
                >
                  <BarChart data={data.readinessData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#292524"
                    />
                    <XAxis
                      dataKey="subject"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                      stroke="#78716C"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickMargin={8}
                      domain={[0, 100]}
                      stroke="#78716C"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="readiness"
                      fill="#E8552D"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Navigation buttons */}
        <BlurFade delay={0.45}>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/plan")}
              className="border-border text-muted-foreground hover:text-cream hover:border-ember/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plan
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-ember hover:bg-ember/90 text-white"
            >
              Back to Home
            </Button>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
