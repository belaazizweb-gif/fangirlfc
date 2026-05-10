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

function aimToDirection(normX: number): ShotDirection {
  const frac = (normX - GL) / (GR - GL);
  if (frac < 0.36) return "left";
  if (frac > 0.64) return "right";
  return "center";
}

function pickKeeperSide(direction: ShotDirection, isGoal: boolean): KeeperSide {
  if (isGoal) {
    const wrong = (["left", "center", "right"] as KeeperSide[]).filter(
      (s) => s !== direction,
    );
    return wrong[Math.floor(Math.random() * wrong.length)] ?? "center";
  }
  return direction;
}

function getResultReason(
  attempt: PenaltyAttempt,
  power: PowerZone,
  direction: ShotDirection,
): string {
  if (!attempt.isGoal) {
    if (power === "weak") return "Not enough power";
    if (direction === "center") return "No angle — keeper central";
    return "Keeper read it";
  }
  if (attempt.isPerfect) return "Unstoppable!";
  return "Keeper went the wrong way";
}

const SHOT_OPTIONS = [
  {
    id: "safe" as const,
    icon: "🛡️",
    label: "Safe",
    sub: "Controlled · lower risk",
  },
  {
    id: "power" as const,
    icon: "⚡",
    label: "Power",
    sub: "High risk · high reward",
  },
] as const;

interface Props {
  onComplete: (attempts: PenaltyAttempt[]) => void;
}

export function PenaltyGame({ onComplete }: Props) {
  const [scenePhase, setScenePhase]     = useState<ScenePhase>("tap-to-aim");
  const [aimPos, setAimPos]             = useState<{ x: number; y: number } | null>(null);
  const [shotStyle, setShotStyle]       = useState<"safe" | "power">("safe");
  const [keeperSide, setKeeperSide]     = useState<KeeperSide>("center");
  const [lastAttempt, setLastAttempt]   = useState<PenaltyAttempt | null>(null);
  const [resultReason, setResultReason] = useState<string>("");
  const [attempts, setAttempts]         = useState<PenaltyAttempt[]>([]);

  const goals      = attempts.filter((a) => a.isGoal).length;
  const shotsDone  = attempts.length;
  const isFinalShot = shotsDone === TOTAL_SHOTS - 1;

  const handleAim = (normX: number, normY: number) => {
    setAimPos({ x: normX, y: normY });
    setScenePhase("ready-to-shoot");
  };

  const handlePower = (zone: PowerZone) => {
    if (!aimPos || scenePhase !== "ready-to-shoot") return;

    const direction      = aimToDirection(aimPos.x);
    const style: ShotStyle = shotStyle === "power" ? "dipping" : "straight";
    const timedCorrectly = zone === "perfect" || zone === "strong";

    const attempt = calculatePenaltyResult(direction, zone, style, timedCorrectly);
    const keeper  = pickKeeperSide(direction, attempt.isGoal);

    setKeeperSide(keeper);
    setLastAttempt(attempt);
    setResultReason(getResultReason(attempt, zone, direction));
    setScenePhase("shooting");

    setTimeout(() => {
      setScenePhase("result-flash");

      setTimeout(() => {
        const newAttempts = [...attempts, attempt];
        setAttempts(newAttempts);

        if (newAttempts.length >= TOTAL_SHOTS) {
          onComplete(newAttempts);
        } else {
          setAimPos(null);
          setKeeperSide("center");
          setLastAttempt(null);
          setResultReason("");
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

        {/* Score pill */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            padding: "7px 14px",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 900, color: "white", lineHeight: 1 }}>
            {goals}
            <span style={{ color: "rgba(255,255,255,0.32)", fontWeight: 400 }}>/3</span>
          </span>
          <div
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.32)",
              marginTop: 2,
            }}
          >
            Goals
          </div>
        </div>
      </div>

      {/* ── Shot progress bar ── */}
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_SHOTS }).map((_, i) => {
          const a = attempts[i];
          return (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-colors"
              style={{
                background: a
                  ? a.isGoal
                    ? a.isPerfect
                      ? "linear-gradient(90deg,#fbbf24,#f472b6)"
                      : "#34d399"
                    : "rgba(248,113,113,0.50)"
                  : i === shotsDone
                  ? "rgba(255,255,255,0.28)"
                  : "rgba(255,255,255,0.08)",
              }}
            />
          );
        })}
      </div>

      {/* ── Game scene (3rd shot → subtle pressure border) ── */}
      <div
        style={{
          borderRadius: 16,
          transition: "box-shadow 500ms",
          boxShadow:
            isFinalShot && scenePhase === "tap-to-aim"
              ? "0 0 0 1.5px rgba(239,68,68,0.38), 0 0 28px rgba(239,68,68,0.12)"
              : "none",
        }}
      >
        <PenaltyGameScene
          phase={scenePhase}
          aimX={aimPos?.x ?? null}
          aimY={aimPos?.y ?? null}
          keeperSide={keeperSide}
          isGoal={lastAttempt?.isGoal ?? false}
          isPerfect={lastAttempt?.isPerfect ?? false}
          resultReason={resultReason}
          onSceneTap={handleAim}
        />
      </div>

      {/* ── Controls (visible only when ready to shoot) ── */}
      {scenePhase === "ready-to-shoot" && (
        <div className="flex flex-col gap-2.5">
          {/* Shot style toggle */}
          <div className="flex gap-2">
            {SHOT_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setShotStyle(s.id)}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  border: `1.5px solid ${
                    shotStyle === s.id
                      ? s.id === "power"
                        ? "rgba(245,158,11,0.65)"
                        : "rgba(236,72,153,0.60)"
                      : "rgba(255,255,255,0.08)"
                  }`,
                  background:
                    shotStyle === s.id
                      ? s.id === "power"
                        ? "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.14))"
                        : "linear-gradient(135deg,rgba(147,51,234,0.18),rgba(236,72,153,0.14))"
                      : "rgba(255,255,255,0.04)",
                  padding: "10px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 200ms",
                  boxShadow:
                    shotStyle === s.id
                      ? s.id === "power"
                        ? "0 0 18px rgba(245,158,11,0.16)"
                        : "0 0 18px rgba(236,72,153,0.16)"
                      : "none",
                }}
              >
                <div style={{ fontSize: 14, lineHeight: 1, marginBottom: 3 }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: shotStyle === s.id ? "white" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color:
                      shotStyle === s.id
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(255,255,255,0.28)",
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
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
          {isFinalShot
            ? "Final shot — make it count"
            : "Tap inside the goal to choose where to shoot"}
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
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              background: a.isPerfect
                ? "linear-gradient(135deg,rgba(251,191,36,0.28),rgba(244,114,182,0.20))"
                : a.isGoal
                ? "rgba(52,211,153,0.18)"
                : "rgba(248,113,113,0.14)",
              border: `1px solid ${
                a.isPerfect
                  ? "rgba(251,191,36,0.40)"
                  : a.isGoal
                  ? "rgba(52,211,153,0.30)"
                  : "rgba(248,113,113,0.20)"
              }`,
            }}
            title={a.isPerfect ? "Perfect!" : a.isGoal ? "Goal" : "Saved"}
          >
            {a.isPerfect ? "⚡" : a.isGoal ? "⚽" : "🧤"}
          </div>
        ))}
        {Array.from({ length: TOTAL_SHOTS - attempts.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            {shotsDone + i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
