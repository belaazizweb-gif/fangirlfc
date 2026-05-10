"use client";

import { useState } from "react";
import type {
  PenaltyAttempt,
  ShotDirection,
  ShotStyle,
  PowerZone,
} from "@/lib/penaltyEngine";
import { calculatePenaltyResult } from "@/lib/penaltyEngine";
import { PenaltyGameScene, type KeeperSide, type ScenePhase } from "./PenaltyGameScene";
import { PowerBar } from "./PowerBar";

const TOTAL_SHOTS = 3;

// Goal bounds (must match PenaltyGameScene constants)
const GL = 0.125;
const GR = 0.875;

// Map scene-normalized X to a shot direction
function aimToDirection(normX: number): ShotDirection {
  const frac = (normX - GL) / (GR - GL); // 0–1 within goal
  if (frac < 0.36) return "left";
  if (frac > 0.64) return "right";
  return "center";
}

// Decide which way the keeper dives based on result
function pickKeeperSide(direction: ShotDirection, isGoal: boolean): KeeperSide {
  if (isGoal) {
    // Keeper commits the wrong way
    const wrong = (["left", "center", "right"] as KeeperSide[]).filter(
      (s) => s !== direction,
    );
    return wrong[Math.floor(Math.random() * wrong.length)] ?? "center";
  }
  // Keeper reads it correctly → save
  return direction;
}

interface Props {
  onComplete: (attempts: PenaltyAttempt[]) => void;
}

export function PenaltyGame({ onComplete }: Props) {
  const [scenePhase, setScenePhase] = useState<ScenePhase>("tap-to-aim");
  const [aimPos, setAimPos] = useState<{ x: number; y: number } | null>(null);
  const [shotStyle, setShotStyle] = useState<"safe" | "power">("safe");
  const [keeperSide, setKeeperSide] = useState<KeeperSide>("center");
  const [lastAttempt, setLastAttempt] = useState<PenaltyAttempt | null>(null);
  const [attempts, setAttempts] = useState<PenaltyAttempt[]>([]);

  const goals = attempts.filter((a) => a.isGoal).length;
  const shotsDone = attempts.length;

  // Called when user taps inside the goal scene
  const handleAim = (normX: number, normY: number) => {
    setAimPos({ x: normX, y: normY });
    setScenePhase("ready-to-shoot");
  };

  // Called when user taps the power bar
  const handlePower = (zone: PowerZone) => {
    if (!aimPos || scenePhase !== "ready-to-shoot") return;

    const direction = aimToDirection(aimPos.x);
    const style: ShotStyle = shotStyle === "power" ? "dipping" : "straight";
    const timedCorrectly = zone === "perfect" || zone === "strong";

    const attempt = calculatePenaltyResult(direction, zone, style, timedCorrectly);
    const keeper = pickKeeperSide(direction, attempt.isGoal);

    // Update visual state — React batches these in one render
    setKeeperSide(keeper);
    setLastAttempt(attempt);
    setScenePhase("shooting");

    // Show result overlay after ball animation
    setTimeout(() => {
      setScenePhase("result-flash");

      // Advance to next attempt or finish
      setTimeout(() => {
        const newAttempts = [...attempts, attempt];
        setAttempts(newAttempts);

        if (newAttempts.length >= TOTAL_SHOTS) {
          onComplete(newAttempts);
        } else {
          // Reset for next penalty
          setAimPos(null);
          setKeeperSide("center");
          setLastAttempt(null);
          setScenePhase("tap-to-aim");
        }
      }, 1300);
    }, 560);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Penalty Queen</h1>
          <p className="text-xs text-white/50">
            Penalty {Math.min(shotsDone + 1, TOTAL_SHOTS)} of {TOTAL_SHOTS}
          </p>
        </div>
        <div className="flex flex-col items-end rounded-xl bg-white/5 px-3 py-1.5">
          <span className="text-sm font-black text-white leading-none">
            {goals}<span className="text-white/40 font-normal">/3</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-white/40 mt-0.5">
            Goals
          </span>
        </div>
      </div>

      {/* ── Shot progress bar ── */}
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_SHOTS }).map((_, i) => {
          const a = attempts[i];
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                a
                  ? a.isGoal
                    ? "bg-emerald-400"
                    : "bg-red-400/60"
                  : i === shotsDone
                  ? "bg-white/35"
                  : "bg-white/10"
              }`}
            />
          );
        })}
      </div>

      {/* ── Game scene ── */}
      <PenaltyGameScene
        phase={scenePhase}
        aimX={aimPos?.x ?? null}
        aimY={aimPos?.y ?? null}
        keeperSide={keeperSide}
        isGoal={lastAttempt?.isGoal ?? false}
        isPerfect={lastAttempt?.isPerfect ?? false}
        onSceneTap={handleAim}
      />

      {/* ── Controls (visible only when ready to shoot) ── */}
      {scenePhase === "ready-to-shoot" && (
        <div className="flex flex-col gap-2.5">
          {/* Shot style toggle */}
          <div className="flex gap-2">
            {(
              [
                { id: "safe", label: "Safe Shot", sub: "Accurate" },
                { id: "power", label: "Power Shot", sub: "+% chance" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setShotStyle(s.id)}
                className={`flex-1 rounded-xl border py-2.5 text-center transition ${
                  shotStyle === s.id
                    ? "border-pink-400/60 bg-pink-400/20 text-pink-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="text-sm font-bold">{s.label}</div>
                <div className="text-[10px] text-white/40">{s.sub}</div>
              </button>
            ))}
          </div>

          {/* Power bar */}
          <PowerBar
            key={shotsDone}
            attemptIndex={shotsDone}
            onPower={(zone) => handlePower(zone)}
          />
        </div>
      )}

      {/* ── Contextual hint text ── */}
      {scenePhase === "tap-to-aim" && (
        <p className="text-center text-xs text-white/45">
          Tap inside the goal to choose where to shoot
        </p>
      )}
      {scenePhase === "ready-to-shoot" && (
        <p className="text-center text-xs text-white/45">
          Pick your shot style, then tap the power bar ↑
        </p>
      )}

      {/* ── Shot history chips ── */}
      <div className="flex gap-3">
        {attempts.map((a, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-base ${
              a.isPerfect
                ? "bg-amber-400/30"
                : a.isGoal
                ? "bg-emerald-400/20"
                : "bg-red-400/15"
            }`}
            title={a.isPerfect ? "Perfect!" : a.isGoal ? "Goal" : "Saved"}
          >
            {a.isPerfect ? "⚡" : a.isGoal ? "⚽" : "🧤"}
          </div>
        ))}
        {Array.from({ length: TOTAL_SHOTS - attempts.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-white/25"
          >
            {shotsDone + i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
