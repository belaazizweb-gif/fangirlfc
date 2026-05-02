"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Share2 } from "lucide-react";
import { FAN_TYPE_LIST, FAN_TYPES } from "@/lib/fanTypes";
import { TEMPLATES } from "@/lib/templates";

const PREVIEW_CARDS = [
  {
    identityId: "princess" as const,
    templateId: "soft-girl",
    name: "Maya",
    team: { flag: "🇧🇷", name: "Brazil" },
    rotate: "-rotate-6",
    z: "z-10",
  },
  {
    identityId: "loyal" as const,
    templateId: "loyal-queen",
    name: "Sana",
    team: { flag: "🇦🇷", name: "Argentina" },
    rotate: "rotate-0",
    z: "z-20",
  },
  {
    identityId: "chaotic" as const,
    templateId: "chaotic-neon",
    name: "Lex",
    team: { flag: "🇪🇸", name: "Spain" },
    rotate: "rotate-6",
    z: "z-10",
  },
];

function MiniCard({
  preview,
}: {
  preview: (typeof PREVIEW_CARDS)[number];
}) {
  const identity = FAN_TYPES[preview.identityId];
  const template =
    TEMPLATES.find((t) => t.id === preview.templateId) ?? TEMPLATES[0]!;

  return (
    <div
      className={`relative h-44 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_40px_-12px_rgba(255,77,191,0.55)] ${preview.rotate} ${preview.z}`}
      style={{ background: template.background }}
    >
      <div className="absolute -right-4 -top-4 text-[90px] leading-none opacity-20">
        {identity.emoji}
      </div>
      <div className="relative flex h-full flex-col p-2.5">
        <div
          className="text-[7px] font-extrabold uppercase tracking-[0.3em]"
          style={{ color: template.accent }}
        >
          Fangirl FC
        </div>
        <div
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border"
          style={{
            borderColor: template.accent,
            background: "rgba(255,255,255,0.18)",
          }}
        >
          <span className="text-base">{identity.emoji}</span>
        </div>
        <div
          className="mt-1.5 truncate text-xs font-black"
          style={{ color: template.text }}
        >
          {preview.name}
        </div>
        <div
          className="text-[8px] font-semibold opacity-80"
          style={{ color: template.text }}
        >
          {preview.team.flag} {preview.team.name}
        </div>
        <div className="mt-auto">
          <div
            className="text-[7px] font-bold uppercase tracking-wider opacity-80"
            style={{ color: template.accent }}
          >
            Identity
          </div>
          <div
            className="text-[10px] font-black leading-tight"
            style={{ color: template.text }}
          >
            {identity.title}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-60 mix-blend-overlay" />
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-pink-300/30 bg-pink-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-200 backdrop-blur">
          <Sparkles className="h-3 w-3" /> World Cup 2026 · for the girls
        </span>
        <h1 className="mt-4 text-[42px] font-black leading-[0.95] tracking-tight">
          Which <span className="gradient-text">football fangirl</span> are you?
        </h1>
        <p className="mt-3 px-2 text-[15px] leading-snug text-white/80">
          Take the 60-second quiz. Get your card. Send it to your bestie.
        </p>
      </div>

      {/* 3 card mockups */}
      <div className="relative -mx-2">
        <div className="absolute inset-x-6 -top-6 -bottom-6 -z-10 rounded-[40px] bg-gradient-to-br from-pink-500/40 via-fuchsia-400/25 to-amber-300/30 blur-3xl" />
        <div className="flex items-end justify-center gap-1.5 px-2">
          {PREVIEW_CARDS.map((p) => (
            <MiniCard key={p.identityId} preview={p} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          <Heart className="h-3 w-3 text-pink-300" />
          <span>1 in 6 identities · totally shareable</span>
          <Share2 className="h-3 w-3 text-pink-300" />
        </div>
      </div>

      {/* CTAs */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-pink-500/30 via-fuchsia-500/20 to-amber-300/25 blur-2xl" />
        <div className="flex flex-col gap-2.5">
          <Link
            href="/quiz"
            className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
          >
            Find my fan type
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/card?id=princess"
            className="flex items-center justify-center gap-2 rounded-full border border-pink-300/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-pink-100 backdrop-blur transition hover:bg-white/10"
          >
            Make my Fangirl Card
          </Link>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/50">
          5 questions · 60 seconds · no signup
        </p>
      </div>

      {/* Identity grid */}
      <div>
        <div className="mb-3 text-center text-[11px] uppercase tracking-[0.25em] text-white/50">
          6 fan identities to unlock
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {FAN_TYPE_LIST.map((f, i) => (
            <div
              key={f.id}
              className="glass animate-float rounded-2xl p-3 text-left"
              style={{ animationDelay: `${(i % 3) * 0.4}s` }}
            >
              <div className="text-2xl">{f.emoji}</div>
              <div className="mt-1 text-sm font-bold">{f.title}</div>
              <div className="line-clamp-2 text-[11px] text-white/60">
                {f.slogan}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote / social proof */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-300/20 bg-gradient-to-br from-pink-400/15 via-fuchsia-400/10 to-amber-200/15 p-5">
        <div className="absolute -right-6 -top-6 text-[120px] leading-none opacity-10">
          💅
        </div>
        <p className="relative text-[15px] font-semibold leading-snug text-white/90">
          "It said I'm a Last Minute Screamer and honestly… accurate."
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-pink-200/70">
          — every group chat, right now
        </p>
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-4 text-xs text-white/70">
        <div className="font-bold text-white/90">How it works</div>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Answer 5 quick questions.</li>
          <li>Get your fan identity + a Fangirl Card you can save.</li>
          <li>Send it to a friend, see how compatible you are.</li>
        </ol>
      </div>
    </div>
  );
}
