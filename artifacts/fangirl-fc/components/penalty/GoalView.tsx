"use client";

import { useEffect, useState } from "react";
import type { PenaltyAttempt } from "@/lib/penaltyEngine";

interface Props {
  attempt: PenaltyAttempt;
  shotNumber: number;
  totalShots: number;
}

const DIRECTION_LABEL: Record<string, string> = {
  left: "← Left",
  center: "Center",
  right: "Right →",
};

const DIRECTION_COL: Record<string, number> = {
  left: 0,
  center: 1,
  right: 2,
};

export function GoalView({ attempt, shotNumber, totalShots }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const col = DIRECTION_COL[attempt.direction] ?? 1;

  return (
    <div
      className={`flex flex-col items-center gap-5 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
          Shot {shotNumber} of {totalShots}
        </span>
      </div>

      <div
        className={`w-full rounded-2xl border-2 p-1 transition-colors duration-300 ${
          attempt.isGoal
            ? "border-emerald-400/60 bg-emerald-500/10"
            : "border-red-400/40 bg-red-500/10"
        }`}
      >
        <div className="relative grid h-28 grid-cols-3 overflow-hidden rounded-xl border border-white/10">
          {[0, 1, 2].map((c) => (
            <div
              key={c}
              className={`flex items-center justify-center border-r border-white/10 last:border-r-0 ${
                c === col && attempt.isGoal
                  ? "bg-emerald-400/20"
                  : c === col && !attempt.isGoal
                  ? "bg-red-400/10"
                  : ""
              }`}
            >
              {c === col && (
                <span className="text-4xl drop-shadow-lg">
                  {attempt.isGoal
                    ? attempt.isPerfect
                      ? "⚡"
                      : "⚽"
                    : "🧤"}
                </span>
              )}
            </div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 flex border-t border-white/10">
            {["← Left", "Center", "Right →"].map((label, i) => (
              <div
                key={i}
                className={`flex-1 py-1 text-center text-[10px] font-semibold ${
                  i === col ? "text-white/80" : "text-white/20"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        {attempt.isGoal ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-2xl font-black text-emerald-300">
              {attempt.isPerfect ? "⚡ Perfect Shot!" : "GOAL! ⚽"}
            </p>
            <p className="text-xs text-white/50">
              {DIRECTION_LABEL[attempt.direction]} ·{" "}
              <span className="capitalize">{attempt.power}</span> power
              {attempt.isPerfect && " · +30 XP"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-2xl font-black text-red-300">Saved! 🧤</p>
            <p className="text-xs text-white/50">
              {DIRECTION_LABEL[attempt.direction]} ·{" "}
              <span className="capitalize">{attempt.power}</span> power
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
