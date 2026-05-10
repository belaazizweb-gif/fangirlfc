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
  color: string;
  textColor: string;
}

const ZONES: Zone[] = [
  { id: "weak",    label: "Weak",    min: 0,  max: 30, color: "bg-white/15",        textColor: "text-white/40" },
  { id: "normal",  label: "Good",    min: 30, max: 66, color: "bg-emerald-500/40",   textColor: "text-emerald-300" },
  { id: "strong",  label: "Power",   min: 66, max: 85, color: "bg-orange-400/50",    textColor: "text-orange-300" },
  { id: "perfect", label: "Perfect", min: 85, max: 100, color: "bg-amber-400/70",   textColor: "text-amber-200" },
];

function getZone(pos: number): PowerZone {
  if (pos >= 85) return "perfect";
  if (pos >= 66) return "strong";
  if (pos >= 30) return "normal";
  return "weak";
}

const BASE_SPEED = 55;
const SPEED_INCREMENT = 12;

export function PowerBar({ attemptIndex, onPower }: Props) {
  const posRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  const frozenRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [displayPos, setDisplayPos] = useState(0);
  const [tapped, setTapped] = useState(false);

  const speed = BASE_SPEED + attemptIndex * SPEED_INCREMENT;

  useEffect(() => {
    posRef.current = 0;
    dirRef.current = 1;
    frozenRef.current = false;
    lastTimeRef.current = 0;
    setDisplayPos(0);
    setTapped(false);

    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!frozenRef.current) {
        posRef.current += dirRef.current * speed * delta;
        if (posRef.current >= 100) {
          posRef.current = 100;
          dirRef.current = -1;
        }
        if (posRef.current <= 0) {
          posRef.current = 0;
          dirRef.current = 1;
        }
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

  const zone = getZone(displayPos);
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
        <div className="relative h-14 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {ZONES.map((z) => (
            <div
              key={z.id}
              className={`absolute top-0 h-full ${z.color}`}
              style={{ left: `${z.min}%`, width: `${z.max - z.min}%` }}
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

          <div
            className="absolute top-0 h-full w-1 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.6)] transition-none"
            style={{ left: `calc(${displayPos}% - 2px)` }}
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
