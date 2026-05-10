"use client";

import { useEffect, useRef, useState } from "react";
import type { PowerZone } from "@/lib/penaltyEngine";

interface Props {
  attemptIndex: number;
  onPower: (zone: PowerZone, position: number) => void;
}

interface Zone {
  id: PowerZone;
  label: string;
  min: number;
  max: number;
  colorClass?: string;
  gradient?: string;
  textColor: string;
}

// Perfect zone: 91–100 (9 units) — tighter window makes it more rewarding
const ZONES: Zone[] = [
  { id: "weak",    label: "Weak",    min: 0,  max: 30,  colorClass: "bg-white/10",       textColor: "text-white/28" },
  { id: "normal",  label: "Good",    min: 30, max: 68,  colorClass: "bg-emerald-600/50", textColor: "text-emerald-300" },
  { id: "strong",  label: "Power",   min: 68, max: 91,  colorClass: "bg-amber-500/55",   textColor: "text-amber-300" },
  {
    id: "perfect", label: "PERFECT", min: 91, max: 100,
    gradient: "linear-gradient(to right, #db277770, #f59e0bc0)",
    textColor: "text-pink-100",
  },
];

function getZone(pos: number): PowerZone {
  if (pos >= 91) return "perfect";
  if (pos >= 68) return "strong";
  if (pos >= 30) return "normal";
  return "weak";
}

// Shot 1 = 55 %/s · Shot 2 = 70 %/s · Shot 3 = 85 %/s (pressure builds)
const BASE_SPEED = 55;
const SPEED_INCREMENT = 15;

export function PowerBar({ attemptIndex, onPower }: Props) {
  const posRef      = useRef(0);
  const dirRef      = useRef<1 | -1>(1);
  const frozenRef   = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const rafRef      = useRef<number>(0);
  const [displayPos, setDisplayPos] = useState(0);
  const [tapped, setTapped]         = useState(false);

  const speed = BASE_SPEED + attemptIndex * SPEED_INCREMENT;

  useEffect(() => {
    posRef.current      = 0;
    dirRef.current      = 1;
    frozenRef.current   = false;
    lastTimeRef.current = 0;
    setDisplayPos(0);
    setTapped(false);

    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!frozenRef.current) {
        posRef.current += dirRef.current * speed * delta;
        if (posRef.current >= 100) { posRef.current = 100; dirRef.current = -1; }
        if (posRef.current <= 0)   { posRef.current = 0;   dirRef.current =  1; }
        setDisplayPos(Math.round(posRef.current));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [attemptIndex, speed]);

  const handleTap = () => {
    if (frozenRef.current) return;
    frozenRef.current = true;
    setTapped(true);
    const pos = posRef.current;
    onPower(getZone(pos), pos);
  };

  const zone           = getZone(displayPos);
  const currentZoneDef = ZONES.find((z) => z.id === zone)!;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-semibold text-white/70">
        {tapped ? "Shot fired!" : "Tap to shoot!"}
      </p>

      <button
        onClick={handleTap}
        disabled={tapped}
        className="w-full focus:outline-none"
        aria-label="Tap to shoot"
      >
        <div className="relative h-16 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {ZONES.map((z) => (
            <div
              key={z.id}
              className={`absolute top-0 h-full ${z.colorClass ?? ""}`}
              style={{
                left: `${z.min}%`,
                width: `${z.max - z.min}%`,
                ...(z.gradient ? { background: z.gradient } : {}),
              }}
            />
          ))}

          <div className="absolute bottom-0 left-0 top-0 flex items-center">
            {ZONES.map((z) => (
              <div
                key={z.id}
                className={`flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${z.textColor}`}
                style={{ width: `${z.max - z.min}%` }}
              >
                {z.label}
              </div>
            ))}
          </div>

          {/* Cursor needle — warm white glow */}
          <div
            className="absolute top-0 h-full"
            style={{
              width: 3,
              left: `calc(${displayPos}% - 1.5px)`,
              background: "white",
              borderRadius: 2,
              boxShadow:
                "0 0 12px 3px rgba(255,255,255,0.65), 0 0 22px 6px rgba(255,200,80,0.35)",
              transition: "none",
            }}
          />
        </div>
      </button>

      <div className={`text-sm font-black uppercase tracking-wider ${currentZoneDef.textColor}`}>
        {tapped
          ? `${currentZoneDef.label} shot!`
          : "← tap anywhere on the bar →"}
      </div>
    </div>
  );
}
