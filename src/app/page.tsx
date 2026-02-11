"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LifeBuoy,
  Map,
  Gauge,
  LayoutDashboard,
  CalendarCheck,
  Siren,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { WordRotate } from "@/components/ui/word-rotate";
import { Particles } from "@/components/ui/particles";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Logo } from "@/components/logo";
import { useAppStore } from "@/lib/store";

const features = [
  {
    icon: LifeBuoy,
    title: "Panic Mode",
    description:
      "Talks you down from exam stress and creates an instant triage of what to study first.",
    accent: "text-ember",
    accentBg: "bg-ember/10",
  },
  {
    icon: Map,
    title: "Smart Recovery Plan",
    description:
      "A 14-day personalized micro-plan that adapts to your exam, missed topics, and energy.",
    accent: "text-gold",
    accentBg: "bg-gold/10",
  },
  {
    icon: Gauge,
    title: "Track Progress",
    description:
      "Visual dashboard showing your recovery score, readiness by subject, and daily wins.",
    accent: "text-sage",
    accentBg: "bg-sage/10",
  },
];

const examTags = [
  "NEET 2025",
  "JEE Main",
  "JEE Advanced",
  "CBSE Class 12",
  "ICSE Boards",
  "College Semesters",
  "NEET PG",
  "CUET",
  "BITSAT",
  "VITEEE",
];

export default function LandingPage() {
  const reset = useAppStore((s) => s.reset);

  // Clean slate every time user visits landing
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background layers */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={40}
        color="#E8552D"
        ease={80}
        size={0.4}
        staticity={50}
      />
      <DotPattern
        className="opacity-[0.03] z-0"
        cr={0.8}
        width={24}
        height={24}
        glow={false}
      />

      {/* Ambient glow blobs — static, no float animation */}
      <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-ember/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <Logo className="h-5 w-5 text-ember" />
              <span className="font-display font-semibold text-base tracking-tight text-cream">
                CatchUp AI
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-cream transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <Link
                href="/plan"
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-cream transition-colors"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                Plan
              </Link>
              <Link
                href="/panic-mode"
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ember transition-colors"
              >
                <Siren className="h-3.5 w-3.5" />
                Panic
              </Link>
              <Link
                href="/onboarding"
                className="text-sm font-medium text-ember hover:text-ember/80 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero — Full-width Editorial Layout ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-20">
        {/* Subtle radial glow behind hero text */}
        <div
          className="absolute top-16 left-0 w-[700px] h-[400px] pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(232, 85, 45, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Stacked headline — each line is a natural block, no inline nesting issues */}
        <div aria-label="Every backlog deserves a smart plan">
          <BlurFade delay={0.15}>
            <div
              className="font-display font-bold tracking-tight text-cream leading-[1.08]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Every
            </div>
          </BlurFade>

          {/* WordRotate renders <div overflow-hidden py-2><motion.h1>word</motion.h1></div>
              Wrapping div inherits font-size; -mt-2 cancels top py-2, bottom kept for descenders (g,y,p) */}
          <div style={{ fontSize: "var(--text-hero)" }} className="-mt-2">
            <WordRotate
              words={["backlog", "missed class", "lost week", "gap"]}
              className="gradient-text font-display font-bold tracking-tight leading-[1.15]"
              duration={3000}
            />
          </div>

          <BlurFade delay={0.3}>
            <div
              className="font-display font-bold tracking-tight text-cream leading-[1.08]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              deserves a{" "}
              <span className="gradient-text">smart plan</span>.
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.4}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-8 leading-relaxed">
            AI-powered recovery that understands your stress, not just your
            syllabus. Built for NEET, JEE, Boards & college semesters.
          </p>
        </BlurFade>

        <BlurFade delay={0.5}>
          <div className="mt-10 flex flex-col sm:flex-row items-start gap-5">
            <Link href="/onboarding">
              <ShimmerButton
                className="h-12 px-8 text-base font-semibold"
                shimmerColor="#D4A853"
                shimmerSize="0.1em"
                background="#E8552D"
              >
                Start Your Recovery
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors pt-3"
            >
              View your dashboard &rarr;
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* ── Marquee Social Proof Strip ── */}
      <section className="relative z-10 border-y border-border/50 py-1">
        <Marquee className="[--duration:30s]" pauseOnHover>
          {examTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-muted-foreground"
            >
              <span className="w-1 h-1 rounded-full bg-ember/50" />
              {tag}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Wave Divider ── */}
      <div className="relative z-10">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-auto fill-surface"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>

      {/* ── Feature Cards — Asymmetric Bento Grid ── */}
      <section className="relative z-10 bg-surface py-20">
        <div className="max-w-5xl mx-auto px-6">
          <BlurFade delay={0.1}>
            <h2
              className="font-display font-bold text-cream tracking-tight mb-3"
              style={{ fontSize: "var(--text-display)" }}
            >
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mb-12">
              Three steps from panic to progress. No fluff, no generic advice —
              just a system that works with your brain.
            </p>
          </BlurFade>

          <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:grid-rows-[1fr_1fr]">
            {/* Left: Large feature card spanning 2 rows */}
            <BlurFade delay={0.2}>
              <MagicCard
                className="rounded-2xl h-full"
                gradientFrom="#E8552D"
                gradientTo="#D4A853"
                gradientColor="#1C1917"
                gradientOpacity={0.15}
              >
                <div className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <div
                      className={`w-14 h-14 rounded-xl ${features[0].accentBg} flex items-center justify-center mb-6`}
                    >
                      <LifeBuoy
                        className={`h-7 w-7 ${features[0].accent}`}
                      />
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-cream mb-3">
                      {features[0].title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {features[0].description}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-ember text-sm font-medium">
                    <span>Breathe. Triage. Act.</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </MagicCard>
            </BlurFade>

            {/* Right top */}
            <BlurFade delay={0.35}>
              <MagicCard
                className="rounded-2xl"
                gradientFrom="#D4A853"
                gradientTo="#E8552D"
                gradientColor="#1C1917"
                gradientOpacity={0.15}
              >
                <div className="p-6 relative overflow-hidden">
                  <div
                    className={`w-12 h-12 rounded-xl ${features[1].accentBg} flex items-center justify-center mb-4`}
                  >
                    <Map className={`h-6 w-6 ${features[1].accent}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-cream mb-2">
                    {features[1].title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {features[1].description}
                  </p>
                </div>
              </MagicCard>
            </BlurFade>

            {/* Right bottom */}
            <BlurFade delay={0.5}>
              <MagicCard
                className="rounded-2xl"
                gradientFrom="#4A7C59"
                gradientTo="#D4A853"
                gradientColor="#1C1917"
                gradientOpacity={0.15}
              >
                <div className="p-6 relative overflow-hidden">
                  <div
                    className={`w-12 h-12 rounded-xl ${features[2].accentBg} flex items-center justify-center mb-4`}
                  >
                    <Gauge className={`h-6 w-6 ${features[2].accent}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-cream mb-2">
                    {features[2].title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {features[2].description}
                  </p>
                </div>
              </MagicCard>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* ── Wave Divider (inverted) ── */}
      <div className="relative z-10 bg-surface">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-auto fill-background"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L0,40 C360,0 720,80 1080,40 C1260,20 1380,60 1440,40 L1440,0 Z" />
        </svg>
      </div>

      {/* ── Editorial Footer ── */}
      <footer className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <BlurFade delay={0.1}>
            <p className="font-display text-2xl md:text-3xl font-semibold text-cream/80 leading-relaxed mb-12">
              &ldquo;Falling behind shouldn&apos;t mean{" "}
              <span className="gradient-text">falling out</span>.&rdquo;
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="pt-8 border-t border-border/50 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Logo className="h-4 w-4 text-ember/60" />
                <p className="text-sm text-muted-foreground">CatchUp AI</p>
              </Link>
              <p className="text-sm text-muted-foreground">
                Built for AMU Hacks 5.0
              </p>
            </div>
          </BlurFade>
        </div>
      </footer>
    </div>
  );
}
