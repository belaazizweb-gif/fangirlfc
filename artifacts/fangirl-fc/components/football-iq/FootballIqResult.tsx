"use client";

import Link from "next/link";
import { Zap, RefreshCw, LayoutDashboard } from "lucide-react";
import { getBadge } from "@/lib/badges";
import type { BadgeId } from "@/lib/badges";
import { SaveProgressBanner } from "@/components/SaveProgressBanner";

interface FootballIqResultProps {
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  badgesUnlocked: BadgeId[];
  footballIQLevel: number;
  isPracticeMode: boolean;
  lastIdentityId: string;
  onPlayAgain: () => void;
}

const LEVEL_LABELS = ["Beginner", "Learning", "Getting It", "Sharp", "Tactical", "World Cup Ready"];

const SCORE_CONFIG = {
  0: { emoji: "💪", label: "Keep going — every question counts!", color: "text-white/60" },
  1: { emoji: "⚽", label: "Getting there!", color: "text-amber-200" },
  2: { emoji: "🧠", label: "Perfect score!", color: "text-emerald-200" },
} as const;

export function FootballIqResult({
  correctCount,
  totalCount,
  xpEarned,
  badgesUnlocked,
  footballIQLevel,
  isPracticeMode,
  lastIdentityId,
  onPlayAgain,
}: FootballIqResultProps) {
  const cfg = SCORE_CONFIG[correctCount as 0 | 1 | 2] ?? SCORE_CONFIG[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-7 text-center">
        <span className="text-4xl">{cfg.emoji}</span>
        <p className={`text-2xl font-extrabold ${cfg.color}`}>
          {correctCount}/{totalCount}
        </p>
        <p className="text-[13px] text-white/50">{cfg.label}</p>
      </div>

      {!isPracticeMode && xpEarned > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
          <p className="text-sm font-extrabold text-amber-200">+{xpEarned} XP earned</p>
        </div>
      )}

      {isPracticeMode && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-[12px] text-white/40">
          Practice mode — rewards already claimed today. Come back tomorrow for more XP.
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-indigo-400/25 bg-indigo-400/8 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-400/25 text-sm font-extrabold text-indigo-200">
          {footballIQLevel}
        </div>
        <div>
          <p className="text-[13px] font-bold text-indigo-100">
            Football IQ Lv.{footballIQLevel}
          </p>
          <p className="text-[11px] text-white/40">
            {LEVEL_LABELS[footballIQLevel] ?? "Expert"}
          </p>
        </div>
      </div>

      {badgesUnlocked.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Badge{badgesUnlocked.length > 1 ? "s" : ""} unlocked
          </p>
          {badgesUnlocked.map((id) => {
            const b = getBadge(id);
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-xl border border-pink-300/25 bg-pink-400/8 px-4 py-2.5"
              >
                <span className="text-xl">{b.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold text-white">{b.name}</p>
                  <p className="text-[11px] text-white/45">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SaveProgressBanner
        title="Keep your progress"
        message="Sign in to save your IQ level, stars and badges."
      />

      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-2xl border border-pink-300/35 bg-gradient-to-br from-pink-400/15 via-pink-400/8 to-purple-400/8 px-5 py-3.5 text-center transition hover:from-pink-400/25 active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4 text-pink-200" />
          <span className="text-sm font-bold text-pink-100">Go to dashboard</span>
        </Link>

        <Link
          href="/penalty"
          className="flex flex-col items-center gap-0.5 rounded-2xl border border-amber-300/35 bg-gradient-to-br from-amber-300/12 via-orange-400/8 to-pink-400/8 px-5 py-3.5 text-center transition hover:from-amber-300/20 active:scale-[0.98]"
        >
          <span className="text-sm font-bold text-amber-100">⚽ Play Penalty Queen</span>
          <span className="text-[11px] text-white/45">Earn more stars and badges</span>
        </Link>

        <Link
          href={`/card?id=${lastIdentityId}`}
          className="flex flex-col items-center gap-0.5 rounded-2xl border border-indigo-300/30 bg-gradient-to-br from-indigo-400/10 via-purple-400/8 to-pink-400/8 px-5 py-3.5 text-center transition hover:from-indigo-400/18 active:scale-[0.98]"
        >
          <span className="text-sm font-bold text-indigo-100">🃏 Update my card</span>
          <span className="text-[11px] text-white/45">Your IQ level is now on your card</span>
        </Link>

        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[12px] font-semibold text-white/50 transition hover:bg-white/10 active:scale-[0.98]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Practice again (no XP)
        </button>
      </div>
    </div>
  );
}
