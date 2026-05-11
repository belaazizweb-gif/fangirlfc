"use client";

import { Brain, Zap, BookOpen } from "lucide-react";

interface FootballIqIntroProps {
  isPracticeMode: boolean;
  currentLevel: number;
  totalCorrect: number;
  onStart: () => void;
}

const LEVEL_LABELS = ["Beginner", "Learning", "Getting It", "Sharp", "Tactical", "World Cup Ready"];

export function FootballIqIntro({
  isPracticeMode,
  currentLevel,
  totalCorrect,
  onStart,
}: FootballIqIntroProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <Brain className="h-6 w-6 text-indigo-400" />
          World Cup Ready
        </div>
        <p className="mt-1 text-[13px] text-white/50">
          Learn football in 2 minutes a day.
        </p>
      </div>

      {currentLevel > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-400/20 text-base font-extrabold text-indigo-200">
            {currentLevel}
          </div>
          <div>
            <p className="text-[13px] font-bold text-indigo-100">
              Football IQ Lv.{currentLevel} — {LEVEL_LABELS[currentLevel] ?? "Expert"}
            </p>
            <p className="text-[11px] text-white/40">{totalCorrect} correct answer{totalCorrect !== 1 ? "s" : ""} so far</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-300">
            <span className="text-[11px] font-bold">2</span>
          </div>
          <p className="text-[13px] text-white/70">Quick football questions every day</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
            <Zap className="h-3 w-3" />
          </div>
          <p className="text-[13px] text-white/70">Earn XP and upgrade your Fangirl Card</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-400/20 text-pink-300">
            <BookOpen className="h-3 w-3" />
          </div>
          <p className="text-[13px] text-white/70">Short explanations — no football degree needed</p>
        </div>
      </div>

      {isPracticeMode && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-[12px] text-white/45">
          Practice mode — rewards already claimed today
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3.5 text-center text-sm font-extrabold text-white shadow-lg transition hover:from-indigo-400 hover:to-purple-400 active:scale-[0.98]"
      >
        {isPracticeMode ? "Practice again" : "Start today's IQ"}
      </button>
    </div>
  );
}
