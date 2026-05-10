"use client";

import { useState } from "react";
import type { ShotDirection, ShotStyle, PowerZone } from "@/lib/penaltyEngine";
import { PowerBar } from "./PowerBar";

interface Props {
  attemptIndex: number;
  onShot: (
    direction: ShotDirection,
    style: ShotStyle,
    power: PowerZone,
    timedCorrectly: boolean,
  ) => void;
}

type ControlPhase = "direction" | "style" | "power";

const DIRECTIONS: { id: ShotDirection; label: string; emoji: string }[] = [
  { id: "left",   label: "Left",   emoji: "←" },
  { id: "center", label: "Center", emoji: "↑" },
  { id: "right",  label: "Right",  emoji: "→" },
];

// Safe Shot → "straight" (no curve bonus, safer placement).
// Power Shot → "dipping" (adds +0.04 goal probability).
// Curve Shot → locked, shown as disabled hint only.
const STYLES: {
  id: ShotStyle | "curve";
  label: string;
  sub: string;
  locked: boolean;
}[] = [
  { id: "straight", label: "Safe Shot",  sub: "Accurate placement",    locked: false },
  { id: "dipping",  label: "Power Shot", sub: "Hard and low, riskier",  locked: false },
  { id: "curve",    label: "Curve Shot", sub: "Unlocks later 🔒",       locked: true  },
];

export function ShotControls({ attemptIndex, onShot }: Props) {
  const [phase, setPhase] = useState<ControlPhase>("direction");
  const [direction, setDirection] = useState<ShotDirection | null>(null);
  const [style, setStyle] = useState<ShotStyle | null>(null);

  const handleDirection = (d: ShotDirection) => {
    setDirection(d);
    setPhase("style");
  };

  const handleStyle = (s: ShotStyle) => {
    setStyle(s);
    setPhase("power");
  };

  const handlePower = (zone: PowerZone, _pos: number) => {
    if (!direction || !style) return;
    const timedCorrectly = zone === "perfect" || zone === "strong";
    setTimeout(() => onShot(direction, style, zone, timedCorrectly), 300);
  };

  const chosenDir = DIRECTIONS.find((d) => d.id === direction);

  if (phase === "direction") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm font-semibold text-white/70">
          Pick your direction
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DIRECTIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDirection(d.id)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-6 text-center transition hover:bg-pink-400/20 hover:border-pink-300/40 active:scale-95"
            >
              <span className="text-3xl font-black text-white">{d.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {d.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] uppercase tracking-widest text-white/30">
          Tap a direction to aim
        </p>
      </div>
    );
  }

  if (phase === "style") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
          <span className="text-sm text-white/50">Aiming</span>
          <span className="text-sm font-black text-white">
            {chosenDir?.emoji} {chosenDir?.label}
          </span>
        </div>
        <p className="text-center text-sm font-semibold text-white/70">
          Choose your shot
        </p>
        <div className="flex flex-col gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              disabled={s.locked}
              onClick={() => !s.locked && handleStyle(s.id as ShotStyle)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                s.locked
                  ? "border-white/5 bg-white/3 opacity-40 cursor-not-allowed"
                  : "border-white/10 bg-white/5 hover:bg-pink-400/20 hover:border-pink-300/40 active:scale-[0.98]"
              }`}
            >
              <div>
                <p className={`text-sm font-bold ${s.locked ? "text-white/40" : "text-white"}`}>
                  {s.label}
                </p>
                <p className="text-xs text-white/40">{s.sub}</p>
              </div>
              {!s.locked && (
                <span className="text-white/30 text-lg">→</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const chosenStyle = STYLES.find((s) => s.id === style);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
        <span className="text-sm text-white/50">
          {chosenDir?.emoji} {chosenDir?.label} · {chosenStyle?.label}
        </span>
      </div>
      <PowerBar attemptIndex={attemptIndex} onPower={handlePower} />
    </div>
  );
}
