"use client";

import { useState } from "react";
import type { ShotDirection, PowerZone } from "@/lib/penaltyEngine";
import { PowerBar } from "./PowerBar";

interface Props {
  attemptIndex: number;
  onShot: (direction: ShotDirection, power: PowerZone, timedCorrectly: boolean) => void;
}

const DIRECTIONS: { id: ShotDirection; label: string; emoji: string }[] = [
  { id: "left",   label: "Left",   emoji: "←" },
  { id: "center", label: "Center", emoji: "↑" },
  { id: "right",  label: "Right",  emoji: "→" },
];

export function ShotControls({ attemptIndex, onShot }: Props) {
  const [direction, setDirection] = useState<ShotDirection | null>(null);

  const handleDirection = (d: ShotDirection) => {
    setDirection(d);
  };

  const handlePower = (zone: PowerZone, _pos: number) => {
    if (!direction) return;
    const timedCorrectly = zone === "perfect" || zone === "strong";
    setTimeout(() => onShot(direction, zone, timedCorrectly), 300);
  };

  if (!direction) {
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
        <div className="text-center">
          <span className="text-[11px] text-white/30 uppercase tracking-widest">
            Tap a direction to aim
          </span>
        </div>
      </div>
    );
  }

  const chosen = DIRECTIONS.find((d) => d.id === direction)!;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
        <span className="text-sm text-white/50">Aiming</span>
        <span className="text-sm font-black text-white">
          {chosen.emoji} {chosen.label}
        </span>
      </div>
      <PowerBar attemptIndex={attemptIndex} onPower={handlePower} />
    </div>
  );
}
