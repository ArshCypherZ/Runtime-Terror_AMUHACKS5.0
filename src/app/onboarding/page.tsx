"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Atom,
  Heart,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { Logo } from "@/components/logo";
import { useAppStore } from "@/lib/store";
import {
  EXAM_OPTIONS,
  SUBJECTS_BY_EXAM,
  ABSENCE_REASONS,
  STRESS_EMOJIS,
} from "@/lib/constants";
import type { ExamType } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  BookOpen,
  Atom,
  Heart,
  Building,
};

export default function OnboardingPage() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useAppStore();
  const [step, setStep] = useState(1);

  const canProceedStep1 = onboarding.exam !== null;
  const canProceedStep2 =
    onboarding.reason !== "" && onboarding.subjects.length > 0;

  const handleExamSelect = (exam: ExamType) => {
    setOnboarding({ exam, subjects: [] });
  };

  const handleSubjectToggle = (subject: string) => {
    const current = onboarding.subjects;
    if (current.includes(subject)) {
      setOnboarding({ subjects: current.filter((s) => s !== subject) });
    } else {
      setOnboarding({ subjects: [...current, subject] });
    }
  };

  const handleSubmit = () => {
    router.push("/panic-mode");
  };

  const availableSubjects = onboarding.exam
    ? SUBJECTS_BY_EXAM[onboarding.exam]
    : [];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-ember/5 blur-[100px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gold/5 blur-[80px] animate-float pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 max-w-3xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="h-5 w-5 text-ember" />
            <span className="font-display font-semibold text-sm tracking-tight text-cream">
              CatchUp AI
            </span>
          </Link>
        </div>

        {/* Orbital progress indicator */}
        <div className="flex items-center gap-4 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  s < step
                    ? "bg-ember text-white"
                    : s === step
                    ? "glass-strong border-ember/30 text-ember glow-ember"
                    : "glass text-muted-foreground"
                }`}
              >
                {s < step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-display font-semibold">{s}</span>
                )}
                {s === step && (
                  <div className="absolute inset-0 rounded-full border border-ember/20 animate-glow-pulse" />
                )}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-px transition-colors duration-500 ${
                    s < step ? "bg-ember/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">
          Step {step} of 3
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 max-w-3xl mx-auto w-full pb-28 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <BlurFade delay={0.05}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-cream mb-2">
                  What exam are you preparing for?
                </h2>
                <p className="text-muted-foreground mb-8">
                  This helps us tailor your recovery plan to the right syllabus
                  and weightage.
                </p>
              </BlurFade>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXAM_OPTIONS.map((exam, i) => {
                  const Icon = iconMap[exam.icon] || GraduationCap;
                  const isSelected = onboarding.exam === exam.id;
                  return (
                    <BlurFade key={exam.id} delay={0.1 + i * 0.05}>
                      <MagicCard
                        className="rounded-xl cursor-pointer"
                        gradientFrom={isSelected ? "#E8552D" : "#292524"}
                        gradientTo={isSelected ? "#D4A853" : "#292524"}
                        gradientColor="#1C1917"
                        gradientOpacity={isSelected ? 0.2 : 0.1}
                      >
                        <button
                          onClick={() => handleExamSelect(exam.id)}
                          className={`w-full text-left p-5 rounded-xl transition-all duration-200 ${
                            isSelected
                              ? "ring-1 ring-ember/30"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-ember text-white"
                                  : "bg-surface-raised text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-cream">
                                {exam.label}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {exam.description}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="ml-auto h-5 w-5 text-ember" />
                            )}
                          </div>
                        </button>
                      </MagicCard>
                    </BlurFade>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <BlurFade delay={0.05}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-cream mb-2">
                  Tell us what happened
                </h2>
                <p className="text-muted-foreground mb-8">
                  No judgment — we just need context to build the right plan.
                </p>
              </BlurFade>

              {/* Reason pills */}
              <BlurFade delay={0.1}>
                <div className="mb-8">
                  <label className="text-sm font-medium text-cream/80 mb-3 block">
                    Why did you fall behind?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ABSENCE_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setOnboarding({ reason })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          onboarding.reason === reason
                            ? "bg-ember text-white"
                            : "glass text-muted-foreground hover:text-cream hover:border-ember/20"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </BlurFade>

              {/* Days missed slider */}
              <BlurFade delay={0.15}>
                <div className="mb-8">
                  <label className="text-sm font-medium text-cream/80 mb-1 block">
                    How many days did you miss?
                  </label>
                  <p className="text-3xl font-bold text-ember mb-3 font-display">
                    {onboarding.daysMissed} days
                  </p>
                  <Slider
                    value={[onboarding.daysMissed]}
                    onValueChange={([v]) => setOnboarding({ daysMissed: v })}
                    min={1}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 day</span>
                    <span>60 days</span>
                  </div>
                </div>
              </BlurFade>

              {/* Subjects */}
              <BlurFade delay={0.2}>
                <div>
                  <label className="text-sm font-medium text-cream/80 mb-3 block">
                    Which subjects need recovery?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((subject) => {
                      const isSelected = onboarding.subjects.includes(subject);
                      return (
                        <Badge
                          key={subject}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                            isSelected
                              ? "bg-ember hover:bg-ember/90 text-white"
                              : "border-border text-muted-foreground hover:border-ember/30 hover:text-cream"
                          }`}
                          onClick={() => handleSubjectToggle(subject)}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {subject}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </BlurFade>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <BlurFade delay={0.05}>
                <h2 className="font-display text-2xl font-bold tracking-tight text-cream mb-2">
                  How are you feeling?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Be honest — this helps our AI calibrate the tone and urgency
                  of your plan.
                </p>
              </BlurFade>

              {/* Stress level */}
              <BlurFade delay={0.1}>
                <div className="mb-8">
                  <label className="text-sm font-medium text-cream/80 mb-1 block">
                    Stress Level
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-5xl">
                      {STRESS_EMOJIS[onboarding.stressLevel] || ""}
                    </span>
                    <span className="text-4xl font-bold text-cream font-display">
                      {onboarding.stressLevel}/10
                    </span>
                  </div>
                  <Slider
                    value={[onboarding.stressLevel]}
                    onValueChange={([v]) => setOnboarding({ stressLevel: v })}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Calm</span>
                    <span>Extremely stressed</span>
                  </div>
                </div>
              </BlurFade>

              {/* Worry text */}
              <BlurFade delay={0.15}>
                <div>
                  <label className="text-sm font-medium text-cream/80 mb-2 block">
                    What&apos;s your biggest worry right now?{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    value={onboarding.worry}
                    onChange={(e) => setOnboarding({ worry: e.target.value })}
                    placeholder="e.g., I'm scared I'll fail Physics and won't get into any medical college..."
                    className="min-h-[120px] bg-surface border-border resize-none text-cream placeholder:text-muted-foreground"
                  />
                </div>
              </BlurFade>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar — glassmorphic */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong z-20 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="text-muted-foreground hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="bg-ember hover:bg-ember/90 text-white"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-ember hover:bg-ember/90 text-white"
            >
              <Logo className="h-4 w-4 mr-2" />
              Activate Panic Mode
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
