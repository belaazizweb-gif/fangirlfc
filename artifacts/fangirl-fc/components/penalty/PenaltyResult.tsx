"use client";

import Link from "next/link";
import type { PenaltyAttempt } from "@/lib/penaltyEngine";
import type { PenaltySession } from "@/lib/progression";
import type { FanIdentity } from "@/types";
import { getBadge } from "@/lib/badges";

interface Props {
  attempts: PenaltyAttempt[];
  session: PenaltySession;
  identity: FanIdentity | null;
  onReplay: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 80
      ? "#4ade80"
      : score >= 50
      ? "#f97316"
      : "#f87171";

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="absolute inset-0" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">score</span>
      </div>
    </div>
  );
}

export function PenaltyResult({ attempts, session, identity, onReplay }: Props) {
  const goals = attempts.filter((a) => a.isGoal).length;
  const perfects = attempts.filter((a) => a.isPerfect).length;
  const total = attempts.length;

  const headline =
    goals === 3
      ? "Perfect. Ice Cold Finisher. 🧊"
      : goals === 2
      ? "Penalty Queen unlocked! 👑 2 from 3."
      : goals === 1
      ? "1 goal. The keeper got lucky twice. 🧤"
      : "Rough session — come back stronger. 💗";

  const cardHref = identity ? `/card?id=${identity.id}` : "/quiz";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Session over!</h1>
        <p className="mt-1 text-sm text-white/60">{headline}</p>
      </div>

      <div className="glass rounded-2xl p-5 flex flex-col items-center gap-5">
        <ScoreRing score={session.score} />

        <div className="grid w-full grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-black text-emerald-300">
              {goals}/{total}
            </p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
              Goals
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-black text-amber-300">{perfects}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
              Perfect
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-black text-pink-300">
              +{session.xpEarned}
            </p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
              XP
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          {attempts.map((a, i) => (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 ${
                a.isPerfect
                  ? "bg-amber-400/20"
                  : a.isGoal
                  ? "bg-emerald-400/15"
                  : "bg-red-400/10"
              }`}
            >
              <span className="text-xl">
                {a.isPerfect ? "⚡" : a.isGoal ? "⚽" : "🧤"}
              </span>
              <span className="text-[9px] font-semibold capitalize text-white/40">
                {a.direction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {session.badgesUnlocked.length > 0 && (
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-pink-300">
            🏅 Badges Unlocked
          </p>
          <div className="flex flex-col gap-2">
            {session.badgesUnlocked.map((id) => {
              const def = getBadge(id);
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-2xl">{def.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{def.name}</p>
                    <p className="text-xs text-white/50">{def.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onReplay}
          className="shine-button w-full rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-wider"
        >
          ⚽ Play Again
        </button>
        <Link
          href={cardHref}
          className="flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/80 hover:bg-white/10 transition"
        >
          Make my Fangirl Card →
        </Link>
        <Link
          href="/"
          className="text-center text-xs text-white/40 hover:text-white/60 transition"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
