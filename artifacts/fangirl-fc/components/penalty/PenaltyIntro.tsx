"use client";

import type { FanIdentity } from "@/types";

interface Props {
  identity: FanIdentity | null;
  onStart: () => void;
  onShowHowTo?: () => void;
}

const RULES = [
  {
    emoji: "🎯",
    label: "Aim",
    desc: "Tap inside the goal to place your shot.",
  },
  {
    emoji: "🦵",
    label: "Shot type",
    desc: "Choose Safe or Power. Curve Shot unlocks later.",
  },
  {
    emoji: "⚡",
    label: "Shoot",
    desc: "Tap the power bar at the right moment. Hit the golden zone for max power.",
  },
  {
    emoji: "⚽",
    label: "Score",
    desc: "3 penalties. Score as many as you can. No pressure… okay, a lot of pressure.",
  },
];

export function PenaltyIntro({ identity, onStart, onShowHowTo }: Props) {
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

      <div className="glass rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-sm font-bold text-white">
              Score 2/3 to unlock Penalty Queen
            </p>
            <p className="text-xs text-white/50">
              Score 3/3 to unlock Ice Cold Finisher
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="shine-button w-full rounded-2xl px-6 py-4 text-base font-black uppercase tracking-wider"
      >
        ⚽ Start Challenge
      </button>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/30">
          3 penalties · results saved locally · no account needed
        </p>
        {onShowHowTo && (
          <button
            onClick={onShowHowTo}
            className="text-[11px] font-semibold text-pink-300/60 hover:text-pink-200 transition"
          >
            How to play ?
          </button>
        )}
      </div>
    </div>
  );
}
