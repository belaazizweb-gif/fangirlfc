"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FAN_TYPE_LIST } from "@/lib/fanTypes";

export function LandingHero() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
          <Sparkles className="h-3 w-3" /> World Cup 2026
        </span>
        <h1 className="mt-4 text-[40px] font-black leading-[0.95] tracking-tight">
          What kind of <span className="gradient-text">football fangirl</span>{" "}
          are you?
        </h1>
        <p className="mt-3 text-base text-white/70">
          Take a 5-question quiz, unlock your fan identity, and make a card
          worth screenshotting.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-pink-500/30 via-fuchsia-500/20 to-violet-500/30 blur-2xl" />
        <Link
          href="/quiz"
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
        >
          Take the quiz
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-2 text-center text-[11px] text-white/50">
          5 questions · 60 seconds · no signup
        </p>
      </div>

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
