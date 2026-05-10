"use client";

import { useState, useCallback } from "react";
import type { PenaltyAttempt, ShotDirection, PowerZone, ShotStyle } from "@/lib/penaltyEngine";
import { calculatePenaltyResult } from "@/lib/penaltyEngine";
import { ShotControls } from "./ShotControls";
import { GoalView } from "./GoalView";

const TOTAL_SHOTS = 5;

type ShotPhase = "aiming" | "reveal";

interface GameState {
  attempts: PenaltyAttempt[];
  phase: ShotPhase;
  latest: PenaltyAttempt | null;
}

interface Props {
  onComplete: (attempts: PenaltyAttempt[]) => void;
}

function styleFromDirection(d: ShotDirection): ShotStyle {
  if (d === "left") return "curve-right";
  if (d === "right") return "curve-left";
  return "straight";
}

export function PenaltyGame({ onComplete }: Props) {
  const [state, setState] = useState<GameState>({
    attempts: [],
    phase: "aiming",
    latest: null,
  });

  const attemptIndex = state.attempts.length;
  const goals = state.attempts.filter((a) => a.isGoal).length;

  const handleShot = useCallback(
    (direction: ShotDirection, power: PowerZone, timedCorrectly: boolean) => {
      const style = styleFromDirection(direction);
      const attempt = calculatePenaltyResult(direction, power, style, timedCorrectly);

      setState((prev) => ({
        ...prev,
        phase: "reveal",
        latest: attempt,
        attempts: [...prev.attempts, attempt],
      }));

      const newAttempts = [...state.attempts, attempt];

      setTimeout(() => {
        if (newAttempts.length >= TOTAL_SHOTS) {
          onComplete(newAttempts);
        } else {
          setState({
            attempts: newAttempts,
            phase: "aiming",
            latest: null,
          });
        }
      }, 2000);
    },
    [state.attempts, onComplete],
  );

  const shotsDone = state.attempts.length;
  const isLastShot = shotsDone === TOTAL_SHOTS;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Penalty Queen</h1>
          <p className="text-xs text-white/50">
            Shot {Math.min(shotsDone + (state.phase === "reveal" ? 0 : 1), TOTAL_SHOTS)} of {TOTAL_SHOTS}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
          <span className="text-sm">⚽</span>
          <span className="text-sm font-black text-white">
            {goals}
            <span className="font-normal text-white/40">/{shotsDone}</span>
          </span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_SHOTS }).map((_, i) => {
          const done = state.attempts[i];
          return (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                done
                  ? done.isGoal
                    ? "bg-emerald-400"
                    : "bg-red-400/60"
                  : i === shotsDone
                  ? "bg-white/30"
                  : "bg-white/10"
              }`}
            />
          );
        })}
      </div>

      <div className="glass rounded-2xl p-5 min-h-[260px] flex flex-col justify-center">
        {state.phase === "aiming" && !isLastShot && (
          <ShotControls
            key={shotsDone}
            attemptIndex={shotsDone}
            onShot={handleShot}
          />
        )}
        {state.phase === "reveal" && state.latest && (
          <GoalView
            key={`reveal-${shotsDone}`}
            attempt={state.latest}
            shotNumber={shotsDone}
            totalShots={TOTAL_SHOTS}
          />
        )}
      </div>

      <div className="flex gap-2">
        {state.attempts.map((a, i) => (
          <div
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
              a.isPerfect
                ? "bg-amber-400/30 text-amber-300"
                : a.isGoal
                ? "bg-emerald-400/20 text-emerald-300"
                : "bg-red-400/15 text-red-400"
            }`}
            title={a.isGoal ? (a.isPerfect ? "Perfect!" : "Goal") : "Saved"}
          >
            {a.isPerfect ? "⚡" : a.isGoal ? "⚽" : "🧤"}
          </div>
        ))}
        {Array.from({ length: TOTAL_SHOTS - state.attempts.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm text-white/20"
          >
            ·
          </div>
        ))}
      </div>
    </div>
  );
}
