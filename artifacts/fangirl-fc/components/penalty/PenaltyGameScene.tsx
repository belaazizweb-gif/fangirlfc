"use client";

import { useRef, useCallback } from "react";
import type { PowerZone } from "@/lib/penaltyEngine";

// ── Normalized scene coordinates (0–1, where 1 = full scene width/height) ──
// Goal frame bounds
const GL = 0.125; // left post
const GR = 0.875; // right post
const GT = 0.04;  // crossbar
const GB = 0.50;  // ground line

// Keeper position within goal frame (fraction of goal width, 0=left post, 1=right post)
const K_FRAC: Record<KeeperSide, number> = { left: 0.10, center: 0.50, right: 0.90 };
// Keeper rotation (degrees) when diving
const K_ROT: Record<KeeperSide, number> = { left: -32, center: 0, right: 32 };
// Keeper vertical position (fraction of goal height, from top)
const K_Y_FRAC = 0.80;

export type KeeperSide = "left" | "center" | "right";

export type ScenePhase =
  | "tap-to-aim"
  | "ready-to-shoot"
  | "shooting"
  | "result-flash";

interface Props {
  phase: ScenePhase;
  aimX: number | null; // scene-normalized, null = not yet aimed
  aimY: number | null;
  keeperSide: KeeperSide;
  isGoal: boolean;
  isPerfect: boolean;
  onSceneTap: (normX: number, normY: number) => void;
}

export function PenaltyGameScene({
  phase,
  aimX,
  aimY,
  keeperSide,
  isGoal,
  isPerfect,
  onSceneTap,
}: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);

  const canAim = phase === "tap-to-aim" || phase === "ready-to-shoot";
  const isShooting = phase === "shooting";
  const showResult = phase === "result-flash";

  // Tap / pointer handler — converts screen coords to scene-normalized coords
  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canAim) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      // Accept only taps within goal area (with small margin for usability)
      if (
        nx >= GL - 0.02 &&
        nx <= GR + 0.02 &&
        ny >= GT - 0.02 &&
        ny <= GB + 0.04
      ) {
        const cx = Math.max(GL + 0.014, Math.min(GR - 0.014, nx));
        const cy = Math.max(GT + 0.018, Math.min(GB - 0.018, ny));
        onSceneTap(cx, cy);
      }
    },
    [canAim, onSceneTap],
  );

  // ── Ball position & size ──
  const ballMoving = isShooting || showResult;
  const ballX = ballMoving && aimX !== null ? aimX : 0.5;
  const ballY = ballMoving && aimY !== null ? aimY : 0.875;
  // Ball shrinks as it moves away (perspective)
  const ballEm = ballMoving ? 0.9 : 1.5;

  // ── Keeper position (scene-normalized) ──
  const kxScene = GL + K_FRAC[keeperSide] * (GR - GL);
  const kyScene = GT + K_Y_FRAC * (GB - GT);

  // Goal dimensions for labels
  const goalW = (GR - GL) * 100; // % of scene

  return (
    <div
      ref={sceneRef}
      className="relative w-full select-none overflow-hidden rounded-2xl"
      style={{ height: 264, cursor: canAim ? "crosshair" : "default" }}
      onPointerDown={handlePointer}
    >
      {/* ══ BACKGROUND ══ */}
      {/* Night sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #04000d 0%, #0e0520 38%, #1c0a3a 50%, #0a360a 50.1%, #072507 100%)",
        }}
      />

      {/* Stadium floodlights — two warm glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "16%",
          top: "-6%",
          width: 90,
          height: 90,
          background:
            "radial-gradient(circle, rgba(255,250,200,0.7) 0%, rgba(255,240,140,0.3) 35%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          right: "16%",
          top: "-6%",
          width: 90,
          height: 90,
          background:
            "radial-gradient(circle, rgba(255,250,200,0.7) 0%, rgba(255,240,140,0.3) 35%, transparent 70%)",
        }}
      />

      {/* Crowd silhouette — subtle band */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: "30%",
          height: "14%",
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 3px, transparent 3px, transparent 8px)",
          opacity: 0.6,
        }}
      />

      {/* ══ PITCH MARKINGS ══ */}
      {/* Penalty area box */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "84%",
          height: "51%",
          border: "1.5px solid rgba(255,255,255,0.2)",
          borderBottom: "none",
        }}
      />
      {/* 6-yard box */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "42%",
          height: "25%",
          border: "1.5px solid rgba(255,255,255,0.14)",
          borderBottom: "none",
        }}
      />
      {/* Penalty arc (partial circle behind penalty area) */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "49%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 52,
          height: 26,
          borderRadius: "52px 52px 0 0",
          border: "1.5px solid rgba(255,255,255,0.14)",
          borderBottom: "none",
        }}
      />
      {/* Penalty spot */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "9%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
        }}
      />

      {/* ══ GOAL FRAME + NET ══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${GL * 100}%`,
          top: `${GT * 100}%`,
          width: `${goalW}%`,
          height: `${(GB - GT) * 100}%`,
        }}
      >
        {/* Net background */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(5, 0, 18, 0.72)",
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px,
                transparent 1px, transparent 16px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px,
                transparent 1px, transparent 16px
              )
            `,
          }}
        />

        {/* Subtle zone dividers inside goal */}
        <div className="absolute inset-0 flex" style={{ zIndex: 1 }}>
          <div
            className="flex-1 flex items-end justify-center pb-1"
            style={{ borderRight: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.18)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              L
            </span>
          </div>
          <div
            className="flex-1 flex items-end justify-center pb-1"
            style={{ borderRight: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.18)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              C
            </span>
          </div>
          <div className="flex-1 flex items-end justify-center pb-1">
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.18)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              R
            </span>
          </div>
        </div>

        {/* Left post */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "#ffffff",
            boxShadow: "0 0 10px rgba(255,255,255,0.5)",
            zIndex: 2,
          }}
        />
        {/* Right post */}
        <div
          className="absolute"
          style={{
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "#ffffff",
            boxShadow: "0 0 10px rgba(255,255,255,0.5)",
            zIndex: 2,
          }}
        />
        {/* Crossbar */}
        <div
          className="absolute"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#ffffff",
            boxShadow: "0 0 10px rgba(255,255,255,0.5)",
            zIndex: 2,
          }}
        />
        {/* Ground line */}
        <div
          className="absolute"
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.35)",
            zIndex: 2,
          }}
        />
      </div>

      {/* ══ GOALKEEPER ══ */}
      {/* Outer div: handles horizontal position (transitions on shooting) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${kxScene * 100}%`,
          top: `${kyScene * 100}%`,
          transition: isShooting ? "left 370ms ease-out" : "none",
          zIndex: 12,
        }}
      >
        {/* Inner div: handles centering + rotation */}
        <div
          style={{
            transform: `translate(-50%, -100%) rotate(${K_ROT[keeperSide]}deg)`,
            transformOrigin: "50% 100%",
            transition: isShooting ? "transform 370ms ease-out" : "none",
          }}
        >
          <svg
            viewBox="-22 -2 88 76"
            width="52"
            height="58"
            overflow="visible"
          >
            {/* Shadow */}
            <ellipse cx="22" cy="73" rx="20" ry="4" fill="rgba(0,0,0,0.4)" />
            {/* Legs */}
            <rect x="8" y="52" width="11" height="19" rx="5" fill="#15803d" />
            <rect x="25" y="52" width="11" height="19" rx="5" fill="#15803d" />
            {/* Jersey */}
            <rect x="5" y="20" width="34" height="36" rx="9" fill="#22c55e" />
            {/* Jersey stripe */}
            <rect x="5" y="30" width="34" height="8" rx="0" fill="#16a34a" />
            {/* Jersey number */}
            <text
              x="22"
              y="45"
              textAnchor="middle"
              fontSize="10"
              fill="#4ade80"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              1
            </text>
            {/* Head */}
            <circle cx="22" cy="12" r="13" fill="#fbbf24" />
            {/* Hair */}
            <ellipse cx="22" cy="2" rx="13" ry="6" fill="#92400e" />
            {/* Eyes */}
            <circle cx="17" cy="12" r="2.5" fill="#1c1010" />
            <circle cx="27" cy="12" r="2.5" fill="#1c1010" />
            {/* Focused expression */}
            <path
              d="M 16 19 Q 22 21 28 19"
              fill="none"
              stroke="#92400e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Left arm */}
            <rect x="-20" y="23" width="27" height="11" rx="5.5" fill="#22c55e" />
            {/* Left glove */}
            <circle
              cx="-18"
              cy="28"
              r="10"
              fill="#f97316"
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Right arm */}
            <rect x="37" y="23" width="27" height="11" rx="5.5" fill="#22c55e" />
            {/* Right glove */}
            <circle
              cx="62"
              cy="28"
              r="10"
              fill="#f97316"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* ══ AIM RETICLE ══ */}
      {canAim && aimX !== null && aimY !== null && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${aimX * 100}%`,
            top: `${aimY * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          {/* Expanding ping ring */}
          <div
            className="animate-ping absolute"
            style={{
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: "50%",
              border: "2px solid rgba(255,77,191,0.65)",
            }}
          />
          {/* Static ring */}
          <div
            style={{
              width: 24,
              height: 24,
              border: "2.5px solid #ff4dbf",
              borderRadius: "50%",
              boxShadow: "0 0 10px #ff4dbf, 0 0 4px #ff4dbf inset",
            }}
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ff4dbf",
              boxShadow: "0 0 6px #ff4dbf",
            }}
          />
        </div>
      )}

      {/* ══ BALL ══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${ballX * 100}%`,
          top: `${ballY * 100}%`,
          transform: "translate(-50%, -50%)",
          fontSize: `${ballEm}rem`,
          lineHeight: 1,
          zIndex: 15,
          transition: ballMoving
            ? "left 470ms ease-in, top 470ms ease-in, font-size 470ms ease-in"
            : "none",
          filter: isShooting
            ? "drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
            : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }}
      >
        ⚽
      </div>

      {/* ══ TAP-TO-AIM HINT (shown before first aim) ══ */}
      {phase === "tap-to-aim" && aimX === null && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${((GL + GR) / 2) * 100}%`,
            top: `${((GT + GB) / 2) * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 22,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 10,
              padding: "5px 11px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.88)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🎯 Tap to aim
            </span>
          </div>
        </div>
      )}

      {/* ══ RESULT OVERLAY ══ */}
      {showResult && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: isGoal
              ? "rgba(0,180,80,0.13)"
              : "rgba(200,30,40,0.13)",
            zIndex: 30,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "rgba(4,0,14,0.88)",
              border: `2px solid ${
                isGoal
                  ? "rgba(74,222,128,0.65)"
                  : "rgba(248,113,113,0.55)"
              }`,
              borderRadius: 20,
              padding: "14px 30px",
              textAlign: "center",
              backdropFilter: "blur(12px)",
              boxShadow: isGoal
                ? "0 0 40px rgba(74,222,128,0.2)"
                : "0 0 40px rgba(248,113,113,0.15)",
            }}
          >
            <div style={{ fontSize: 44 }}>
              {isPerfect ? "⚡" : isGoal ? "⚽" : "🧤"}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: isGoal ? "#4ade80" : "#f87171",
                marginTop: 4,
                textShadow: isGoal
                  ? "0 0 24px rgba(74,222,128,0.55)"
                  : "0 0 24px rgba(248,113,113,0.45)",
              }}
            >
              {isPerfect ? "PERFECT!" : isGoal ? "GOAL!" : "SAVED!"}
            </div>
            {isPerfect && (
              <div
                style={{
                  fontSize: 11,
                  color: "#fbbf24",
                  marginTop: 2,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                +30 XP
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
