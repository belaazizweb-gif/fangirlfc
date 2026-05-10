"use client";

import type { FanIdentity } from "@/types";

interface Props {
  identity: FanIdentity | null;
  onStart: () => void;
}

const RULES = [
  { emoji: "🎯", label: "Aim", desc: "Pick your direction — left, center, or right." },
  { emoji: "⚡", label: "Power", desc: "Tap the bar at the right moment. Hit the golden zone for max power." },
  { emoji: "⚽", label: "Score", desc: "5 shots. Score as many as you can. No pressure… okay, a lot of pressure." },
];

export function PenaltyIntro({ identity, onStart }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {identity && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg">{identity.emoji}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {identity.title}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-black leading-tight">
          Penalty{" "}
          <span className="gradient-text">Queen</span>
          {" "}Challenge
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Think you can handle the pressure? Prove it on the spot.
        </p>
      </div>

      <div className="glass rounded-2xl divide-y divide-white/8">
        {RULES.map((r) => (
          <div key={r.label} className="flex items-start gap-3 px-4 py-3.5">
            <span className="text-xl mt-0.5">{r.emoji}</span>
            <div>
              <p className="text-[13px] font-bold text-white">{r.label}</p>
              <p className="text-xs text-white/55">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">👑</span>
        <div>
          <p className="text-sm font-bold text-white">Score 5/5 to unlock</p>
          <p className="text-xs text-white/50">
            Penalty Queen badge + bonus XP
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="shine-button w-full rounded-2xl px-6 py-4 text-base font-black uppercase tracking-wider"
      >
        ⚽ Start Challenge
      </button>

      <p className="text-center text-[11px] text-white/30">
        5 shots · results saved locally · no account needed
      </p>
    </div>
  );
}
