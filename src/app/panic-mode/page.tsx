"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Target,
  Trophy,
  Clock,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Ripple } from "@/components/ui/ripple";
import { Logo } from "@/components/logo";
import { useAppStore } from "@/lib/store";
import type { TriageResult } from "@/lib/types";

const statusConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "bg-red-500/10 text-red-400",
    progress: "bg-red-500",
    label: "Critical",
  },
  warning: {
    icon: AlertCircle,
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
    badge: "bg-gold/10 text-gold",
    progress: "bg-gold",
    label: "Needs Work",
  },
  "on-track": {
    icon: CheckCircle2,
    color: "text-sage",
    bg: "bg-sage/10",
    border: "border-sage/20",
    badge: "bg-sage/10 text-sage",
    progress: "bg-sage",
    label: "On Track",
  },
};

const ANALYZING_MESSAGES = [
  "Reading your responses...",
  "Analyzing syllabus gaps...",
  "Evaluating subject priorities...",
  "Building your triage...",
];

export default function PanicModePage() {
  const router = useRouter();
  const { onboarding, setTriage } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamPanelRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<
    "analyzing" | "breathing" | "streaming" | "cards" | "done"
  >("analyzing");
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [streamedText, setStreamedText] = useState("");
  const [triageData, setTriageData] = useState<TriageResult | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showQuickWin, setShowQuickWin] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  // ── Phase 0: Analyzing transition (calls triage API) ──
  useEffect(() => {
    if (phase !== "analyzing") return;

    // Start the visual step animation
    const stepInterval = setInterval(() => {
      setAnalyzingStep((prev) => {
        if (prev >= ANALYZING_MESSAGES.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    // Call triage API in parallel with the animation
    const fetchTriage = async () => {
      try {
        const response = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam: onboarding.exam,
            subjects: onboarding.subjects,
            daysAbsent: onboarding.daysMissed,
            absenceReason: onboarding.reason,
            stressLevel: onboarding.stressLevel,
            worryText: onboarding.worryText,
            sessionId: localStorage.getItem("catchup-session-id"),
          }),
        });

        const data = await response.json();
        if (data.success) {
          setTriageData(data.triage);

          // Generate TTS audio from the narrative
          if (data.audio) {
            const audioBlob = new Blob(
              [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
              { type: "audio/wav" }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(audioUrl);
            audioRef.current.volume = 0.85;
          }
        }
      } catch (error) {
        console.error("Triage API failed:", error);
      }

      // Wait for analyzing animation to finish, then transition
      setTimeout(() => setPhase("breathing"), 600);
    };

    fetchTriage();

    return () => clearInterval(stepInterval);
  }, [phase, onboarding]);

  // ── Phase 1: Breathing animation ──
  useEffect(() => {
    if (phase !== "breathing") return;

    const timer = setTimeout(() => {
      setPhase("streaming");
      setIsVoicePlaying(true);

      // Start audio playback from TTS response
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setAudioFailed(true);
        });
        audioRef.current.onended = () => setIsVoicePlaying(false);
      } else {
        setAudioFailed(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [phase]);

  // ── Phase 2: Stream the AI narrative text ──
  const streamText = useCallback(() => {
    if (!triageData?.narrative) return;

    const words = triageData.narrative.split(" ");
    let index = 0;

    setStreamedText("");

    // Sync text streaming with audio duration (~60s)
    const AUDIO_SYNC_MS = 55000;
    const msPerWord = Math.max(Math.floor(AUDIO_SYNC_MS / words.length), 50);

    const interval = setInterval(() => {
      index++;
      if (index <= words.length) {
        setStreamedText(words.slice(0, index).join(" "));

        // Auto-scroll the streaming panel
        if (streamPanelRef.current) {
          streamPanelRef.current.scrollTop =
            streamPanelRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (!audioRef.current || audioRef.current.ended || audioFailed) {
            setIsVoicePlaying(false);
          }
          setPhase("cards");
          setShowSubjects(true);
        }, 800);
      }
    }, msPerWord);

    return () => clearInterval(interval);
  }, [triageData, audioFailed]);

  useEffect(() => {
    if (phase === "streaming") {
      const cleanup = streamText();
      return cleanup;
    }
  }, [phase, streamText]);

  // ── Phase 3: Show subject cards, then quick win ──
  useEffect(() => {
    if (showSubjects && triageData) {
      const timer = setTimeout(() => {
        setShowQuickWin(true);
        setPhase("done");
        setTriage(triageData);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [showSubjects, triageData, setTriage]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-ember/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 max-w-3xl mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo className="h-5 w-5 text-ember" />
          <span className="font-display font-semibold text-sm tracking-tight text-cream">
            CatchUp AI
          </span>
        </Link>
        {isVoicePlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-ember"
          >
            {audioFailed ? (
              <VolumeX className="h-4 w-4 opacity-40" />
            ) : (
              <Volume2 className="h-4 w-4 animate-pulse" />
            )}
            <span className="text-xs font-medium">AI Speaking...</span>
          </motion.div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-32 relative z-10">
        {/* Phase 0: Analyzing transition */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mb-8"
              >
                <Loader2 className="h-10 w-10 text-ember" />
              </motion.div>

              <div className="space-y-3 text-center">
                {ANALYZING_MESSAGES.map((msg, i) => (
                  <motion.p
                    key={msg}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: i <= analyzingStep ? 1 : 0.2,
                      y: i <= analyzingStep ? 0 : 8,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`text-sm font-medium ${
                      i === analyzingStep
                        ? "text-ember"
                        : i < analyzingStep
                        ? "text-muted-foreground"
                        : "text-muted-foreground/30"
                    }`}
                  >
                    {i < analyzingStep && (
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 text-sage" />
                    )}
                    {i === analyzingStep && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember mr-2 animate-pulse" />
                    )}
                    {msg}
                  </motion.p>
                ))}
              </div>

              {onboarding.exam && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-muted-foreground mt-8"
                >
                  {onboarding.exam.toUpperCase()} &middot; {onboarding.daysMissed} days missed &middot; {onboarding.subjects.length} subjects
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1: Breathing with Ripple */}
        <AnimatePresence>
          {phase === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] relative"
            >
              {/* Ripple breathing animation */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <Ripple
                  mainCircleSize={80}
                  mainCircleOpacity={0.15}
                  numCircles={6}
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-16 h-16 rounded-full bg-ember/20 flex items-center justify-center glow-ember"
                >
                  <Logo className="h-8 w-8 text-ember" />
                </motion.div>
              </div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-xl text-muted-foreground font-medium font-display mt-8"
              >
                Take a deep breath...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2+: Streaming Text */}
        {(phase === "streaming" || phase === "cards" || phase === "done") && (
          <div className="mt-8">
            <BlurFade delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-ember flex items-center justify-center">
                  <Logo className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-cream text-sm">CatchUp AI</p>
                  <p className="text-xs text-muted-foreground">
                    Your recovery assistant
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Glassmorphic streaming panel */}
            <div
              ref={streamPanelRef}
              className="glass rounded-2xl p-6 mb-8 max-h-[50vh] overflow-y-auto scrollbar-hide"
            >
              <p className="text-cream/90 leading-relaxed whitespace-pre-line">
                {streamedText}
                {phase === "streaming" && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-5 bg-ember ml-1 align-middle rounded-sm"
                  />
                )}
              </p>
            </div>

            {/* Phase 3: Subject Triage Cards */}
            <AnimatePresence>
              {showSubjects && triageData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-display font-semibold text-lg text-cream mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-ember" />
                    Subject Triage
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 mb-8">
                    {triageData.subjects.map((subject, i) => {
                      const config = statusConfig[subject.status];
                      const StatusIcon = config.icon;
                      return (
                        <motion.div
                          key={subject.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15, duration: 0.4 }}
                        >
                          <Card
                            className={`border ${config.border} bg-surface overflow-hidden`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2 text-cream">
                                  <StatusIcon
                                    className={`h-4 w-4 ${config.color}`}
                                  />
                                  {subject.name}
                                </CardTitle>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${config.badge}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Chapters
                                  </span>
                                  <span className="font-medium text-cream">
                                    {subject.completedChapters}/
                                    {subject.totalChapters}
                                  </span>
                                </div>
                                <div className="w-full bg-surface-raised rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-1000 ${config.progress}`}
                                    style={{
                                      width: `${
                                        (subject.completedChapters /
                                          subject.totalChapters) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Weightage
                                  </span>
                                  <span className="font-medium text-cream">
                                    {subject.weightage}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Hours needed
                                  </span>
                                  <span className="font-medium text-cream">
                                    {subject.hoursNeeded}h
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Win — Gold themed */}
            <AnimatePresence>
              {showQuickWin && triageData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border border-gold/20 bg-gold/5 relative overflow-hidden mb-8">
                    <BorderBeam
                      size={200}
                      duration={6}
                      colorFrom="#D4A853"
                      colorTo="#E8552D"
                    />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-gold">
                        <Trophy className="h-5 w-5 text-gold" />
                        Quick Win — Start Here
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-cream font-medium mb-2">
                        {triageData.quickWin.task}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gold/80">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {triageData.quickWin.timeMinutes} mins
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-gold/10 text-gold border-0"
                        >
                          {triageData.quickWin.subject}
                        </Badge>
                      </div>
                      <p className="text-sm text-gold/70 mt-2">
                        {triageData.quickWin.impact}
                      </p>
                    </CardContent>
                  </Card>

                  {/* CTA */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => router.push("/plan")}
                      size="lg"
                      className="bg-ember hover:bg-ember/90 text-white h-12 px-8"
                    >
                      Build My Recovery Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
