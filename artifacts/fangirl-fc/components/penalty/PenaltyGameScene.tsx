"use client";

import { useRef, useCallback } from "react";

// ── Normalized scene coordinates (0–1) ──
const GL = 0.125; // goal left post
const GR = 0.875; // goal right post
const GT = 0.04;  // crossbar
const GB = 0.50;  // goal ground line

// Keeper X fraction within goal (0 = left post, 1 = right post)
const K_FRAC: Record<KeeperSide, number> = { left: 0.12, center: 0.50, right: 0.88 };
// Keeper rotation on dive (degrees)
const K_ROT: Record<KeeperSide, number> = { left: -28, center: 0, right: 28 };
// Keeper vertical position: fraction of goal height (0=crossbar, 1=ground)
const K_Y_FRAC = 0.62;

export type KeeperSide = "left" | "center" | "right";

export type ScenePhase =
  | "tap-to-aim"
  | "ready-to-shoot"
  | "shooting"
  | "result-flash";

interface Props {
  phase: ScenePhase;
  aimX: number | null;
  aimY: number | null;
  keeperSide: KeeperSide;
  isGoal: boolean;
  isPerfect: boolean;
  onSceneTap: (normX: number, normY: number) => void;
}

// ── SVG Football ball ──
function BallSvg({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="ballGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="75%" stopColor="#e2e2e2" />
          <stop offset="100%" stopColor="#c4c4c4" />
        </radialGradient>
      </defs>
      {/* Sphere */}
      <circle cx="18" cy="18" r="16" fill="url(#ballGrad)" />
      {/* Black patches — Telstar-style */}
      <path d="M18 3.5 L23 9.5 L21 15 L15 15 L13 9.5 Z" fill="#141414" />
      <path d="M27.5 8.5 L32 14 L29 19.5 L23 18 L23 9.5 Z" fill="#141414" />
      <path d="M30 23 L25.5 29 L19 28 L18.5 21.5 L29 19.5 Z" fill="#141414" />
      <path d="M8.5 8.5 L4 14 L7 19.5 L13 18 L13 9.5 Z" fill="#141414" />
      <path d="M6 23 L10.5 29 L17 28 L17.5 21.5 L7 19.5 Z" fill="#141414" />
      {/* Outline */}
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* Shine highlight */}
      <ellipse
        cx="13.5"
        cy="12.5"
        rx="4.5"
        ry="2.5"
        fill="rgba(255,255,255,0.65)"
      />
    </svg>
  );
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

  // Pointer tap handler
  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canAim) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      if (
        nx >= GL - 0.02 &&
        nx <= GR + 0.02 &&
        ny >= GT - 0.02 &&
        ny <= GB + 0.04
      ) {
        const cx = Math.max(GL + 0.014, Math.min(GR - 0.014, nx));
        const cy = Math.max(GT + 0.016, Math.min(GB - 0.016, ny));
        onSceneTap(cx, cy);
      }
    },
    [canAim, onSceneTap],
  );

  // Ball
  const ballMoving = isShooting || showResult;
  const ballX = ballMoving && aimX !== null ? aimX : 0.5;
  const ballY = ballMoving && aimY !== null ? aimY : 0.875;
  const ballScale = ballMoving ? 0.58 : 1; // shrinks as it travels toward goal

  // Keeper position (scene-normalized)
  const kxScene = GL + K_FRAC[keeperSide] * (GR - GL);
  const kyScene = GT + K_Y_FRAC * (GB - GT);

  return (
    <div
      ref={sceneRef}
      className="relative w-full select-none overflow-hidden rounded-2xl"
      style={{ height: 272, cursor: canAim ? "crosshair" : "default" }}
      onPointerDown={handlePointer}
    >
      {/* ══ SKY + PITCH BACKGROUND ══ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #03000b 0%, #0c0420 40%, #190838 50%, #083008 50.1%, #062006 100%)",
        }}
      />

      {/* Stadium floodlights */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "14%",
          top: "-4%",
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle, rgba(255,252,210,0.75) 0%, rgba(255,245,150,0.28) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          right: "14%",
          top: "-4%",
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle, rgba(255,252,210,0.75) 0%, rgba(255,245,150,0.28) 40%, transparent 70%)",
        }}
      />

      {/* Crowd silhouette */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: "28%",
          height: "16%",
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 3px, transparent 3px, transparent 9px)",
        }}
      />

      {/* Pitch grass highlight (slight brightness near camera) */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "38%",
          background:
            "linear-gradient(to top, rgba(20,80,20,0.45) 0%, transparent 100%)",
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
          border: "1.5px solid rgba(255,255,255,0.22)",
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
          border: "1.5px solid rgba(255,255,255,0.15)",
          borderBottom: "none",
        }}
      />
      {/* Penalty arc */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "49%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 56,
          height: 28,
          borderRadius: "56px 56px 0 0",
          border: "1.5px solid rgba(255,255,255,0.15)",
          borderBottom: "none",
        }}
      />
      {/* Penalty spot */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "9.5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.8)",
          boxShadow: "0 0 4px rgba(255,255,255,0.4)",
        }}
      />

      {/* ══ GOAL FRAME + NET ══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${GL * 100}%`,
          top: `${GT * 100}%`,
          width: `${(GR - GL) * 100}%`,
          height: `${(GB - GT) * 100}%`,
        }}
      >
        {/* Net fill + grid */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(6, 0, 22, 0.78)",
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.13) 0px, rgba(255,255,255,0.13) 1px,
                transparent 1px, transparent 17px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.13) 0px, rgba(255,255,255,0.13) 1px,
                transparent 1px, transparent 17px
              )
            `,
          }}
        />
        {/* Zone guides: subtle L/C/R */}
        <div className="absolute inset-0 flex" style={{ zIndex: 1 }}>
          {["L", "C", "R"].map((label, i) => (
            <div
              key={label}
              className="flex-1 flex items-end justify-center pb-1"
              style={{
                borderRight: i < 2 ? "1px dashed rgba(255,255,255,0.09)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.2)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* Left post */}
        <div
          className="absolute"
          style={{
            left: 0, top: 0, bottom: 0,
            width: 5,
            background: "linear-gradient(to right, #d0d0d0, #ffffff)",
            boxShadow: "0 0 12px rgba(255,255,255,0.55), inset -1px 0 2px rgba(0,0,0,0.15)",
            zIndex: 3,
          }}
        />
        {/* Right post */}
        <div
          className="absolute"
          style={{
            right: 0, top: 0, bottom: 0,
            width: 5,
            background: "linear-gradient(to left, #d0d0d0, #ffffff)",
            boxShadow: "0 0 12px rgba(255,255,255,0.55), inset 1px 0 2px rgba(0,0,0,0.15)",
            zIndex: 3,
          }}
        />
        {/* Crossbar */}
        <div
          className="absolute"
          style={{
            top: 0, left: 0, right: 0,
            height: 5,
            background: "linear-gradient(to bottom, #d8d8d8, #ffffff)",
            boxShadow: "0 0 12px rgba(255,255,255,0.55), inset 0 -1px 2px rgba(0,0,0,0.15)",
            zIndex: 3,
          }}
        />
        {/* Ground line */}
        <div
          className="absolute"
          style={{
            bottom: 0, left: 0, right: 0,
            height: 2,
            background: "rgba(255,255,255,0.38)",
            zIndex: 3,
          }}
        />
      </div>

      {/* ══ GOALKEEPER ══ */}
      {/* Outer div: horizontal position with transition */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${kxScene * 100}%`,
          top: `${kyScene * 100}%`,
          transition: isShooting ? "left 360ms ease-out" : "none",
          zIndex: 12,
        }}
      >
        {/* Inner div: centre + rotation */}
        <div
          style={{
            transform: `translate(-50%, -100%) rotate(${K_ROT[keeperSide]}deg)`,
            transformOrigin: "50% 100%",
            transition: isShooting ? "transform 360ms ease-out" : "none",
          }}
        >
          {/*
            viewBox="0 0 96 84": keeper is 96 units wide, 84 tall.
            Arms extend from x=0 (left glove centre) to x=96 (right glove).
            overflow="visible" lets gloves render even if they clip the viewBox edge.
          */}
          <svg viewBox="0 0 96 84" width="88" height="77" overflow="visible">
            {/* Keeper shadow on pitch */}
            <ellipse cx="48" cy="82" rx="26" ry="5" fill="rgba(0,0,0,0.32)" />

            {/* Legs */}
            <rect x="28" y="61" width="15" height="22" rx="6" fill="#14532d" />
            <rect x="53" y="61" width="15" height="22" rx="6" fill="#14532d" />
            {/* Boots */}
            <rect x="25" y="78" width="20" height="7" rx="3" fill="#111" />
            <rect x="51" y="78" width="20" height="7" rx="3" fill="#111" />

            {/* Jersey body */}
            <rect x="22" y="25" width="52" height="42" rx="12" fill="#22c55e" />
            {/* Jersey shoulder panels */}
            <rect x="22" y="25" width="52" height="14" rx="12" fill="#16a34a" />
            <rect x="22" y="35" width="52" height="4" rx="0" fill="#15803d" />
            {/* Jersey number */}
            <text
              x="48"
              y="58"
              textAnchor="middle"
              fontSize="14"
              fill="#bbf7d0"
              fontWeight="900"
              fontFamily="Arial, sans-serif"
            >
              1
            </text>

            {/* Head */}
            <circle cx="48" cy="14" r="15" fill="#fbbf24" />
            {/* Hair */}
            <ellipse cx="48" cy="4" rx="15" ry="8" fill="#92400e" />
            {/* Eyebrows (determined look) */}
            <path
              d="M38 9 Q42 7 46 9"
              fill="none"
              stroke="#78350f"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M50 9 Q54 7 58 9"
              fill="none"
              stroke="#78350f"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Eyes */}
            <circle cx="42" cy="13" r="3.5" fill="#1c0c0c" />
            <circle cx="54" cy="13" r="3.5" fill="#1c0c0c" />
            {/* Eye whites/pupils */}
            <circle cx="43" cy="12" r="1.2" fill="rgba(255,255,255,0.4)" />
            <circle cx="55" cy="12" r="1.2" fill="rgba(255,255,255,0.4)" />
            {/* Nose */}
            <ellipse cx="48" cy="18" rx="2" ry="1.5" fill="#d97706" />
            {/* Mouth (focused/set) */}
            <path
              d="M43 22 Q48 20 53 22"
              fill="none"
              stroke="#92400e"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Left arm */}
            <rect x="0" y="30" width="26" height="14" rx="7" fill="#22c55e" />
            {/* Left glove */}
            <circle cx="7" cy="37" r="14" fill="#ea580c" />
            <circle cx="7" cy="37" r="14" fill="none" stroke="white" strokeWidth="2" />
            {/* Glove finger lines */}
            <line x1="0" y1="31" x2="4" y2="44" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="7" y1="23" x2="7" y2="50" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="14" y1="31" x2="10" y2="44" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />

            {/* Right arm */}
            <rect x="70" y="30" width="26" height="14" rx="7" fill="#22c55e" />
            {/* Right glove */}
            <circle cx="89" cy="37" r="14" fill="#ea580c" />
            <circle cx="89" cy="37" r="14" fill="none" stroke="white" strokeWidth="2" />
            {/* Glove finger lines */}
            <line x1="82" y1="31" x2="86" y2="44" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="89" y1="23" x2="89" y2="50" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="96" y1="31" x2="92" y2="44" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
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
          {/* Expanding ping */}
          <div
            className="animate-ping absolute"
            style={{
              top: -9, left: -9, right: -9, bottom: -9,
              borderRadius: "50%",
              border: "2px solid rgba(255,77,191,0.6)",
            }}
          />
          {/* Static ring */}
          <div
            style={{
              width: 26,
              height: 26,
              border: "2.5px solid #ff4dbf",
              borderRadius: "50%",
              boxShadow: "0 0 12px #ff4dbf, 0 0 4px #ff4dbf inset",
            }}
          />
          {/* Crosshair dot */}
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

      {/* ══ BALL SHADOW (on pitch, only when at spot) ══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          bottom: "8%",
          transform: "translateX(-50%)",
          width: 22,
          height: 7,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          filter: "blur(3px)",
          zIndex: 14,
          opacity: ballMoving ? 0 : 1,
          transition: "opacity 160ms",
        }}
      />

      {/* ══ BALL ══ */}
      {/* Outer: moves left/top via transition */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${ballX * 100}%`,
          top: `${ballY * 100}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 15,
          transition: ballMoving
            ? "left 470ms ease-in, top 470ms ease-in"
            : "none",
        }}
      >
        {/* Inner: scales down (perspective) */}
        <div
          style={{
            transform: `scale(${ballScale})`,
            transformOrigin: "center center",
            transition: ballMoving ? "transform 470ms ease-in" : "none",
            filter: isShooting
              ? "drop-shadow(0 0 10px rgba(255,255,255,0.85)) drop-shadow(0 2px 5px rgba(0,0,0,0.7))"
              : "drop-shadow(0 3px 5px rgba(0,0,0,0.6))",
          }}
        >
          <BallSvg size={32} />
        </div>
      </div>

      {/* ══ TAP-TO-AIM HINT ══
          Positioned between goal bottom and penalty spot — NOT inside goal */}
      {phase === "tap-to-aim" && aimX === null && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: `${(GB + 0.065) * 100}%`,
            transform: "translateX(-50%)",
            zIndex: 22,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.62)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: "4px 11px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              🎯 Tap inside the goal to aim
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
              ? "rgba(0,160,70,0.12)"
              : "rgba(190,30,40,0.12)",
            zIndex: 30,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "rgba(4,0,14,0.90)",
              border: `2px solid ${
                isGoal
                  ? "rgba(74,222,128,0.7)"
                  : "rgba(248,113,113,0.6)"
              }`,
              borderRadius: 20,
              padding: "14px 32px",
              textAlign: "center",
              backdropFilter: "blur(14px)",
              boxShadow: isGoal
                ? "0 0 48px rgba(74,222,128,0.22)"
                : "0 0 48px rgba(248,113,113,0.18)",
            }}
          >
            <div style={{ fontSize: 48 }}>
              {isPerfect ? "⚡" : isGoal ? "⚽" : "🧤"}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "0.07em",
                color: isGoal ? "#4ade80" : "#f87171",
                marginTop: 4,
                textShadow: isGoal
                  ? "0 0 28px rgba(74,222,128,0.6)"
                  : "0 0 28px rgba(248,113,113,0.5)",
              }}
            >
              {isPerfect ? "PERFECT!" : isGoal ? "GOAL!" : "SAVED!"}
            </div>
            {isPerfect && (
              <div
                style={{
                  fontSize: 11,
                  color: "#fbbf24",
                  marginTop: 3,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
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
