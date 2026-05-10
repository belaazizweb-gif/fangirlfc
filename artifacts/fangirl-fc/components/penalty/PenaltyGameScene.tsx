"use client";

import { useRef, useCallback, useEffect, useState } from "react";

// ── Normalised scene coordinates (0–1) ──
const GL = 0.125; // goal left post
const GR = 0.875; // goal right post
const GT = 0.04;  // crossbar top
const GB = 0.50;  // goal ground / pitch surface

// Keeper X fraction within goal (0 = left post, 1 = right post)
const K_FRAC: Record<KeeperSide, number> = { left: 0.15, center: 0.50, right: 0.85 };
// Dive rotation (degrees)
const K_ROT: Record<KeeperSide, number>  = { left: -36, center: 0, right: 36 };
// K_Y_FRAC = 1.0 → keeper feet pinned exactly at goal ground line (GB)
const K_Y_FRAC = 1.0;

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

// ── SVG Football ──
function BallSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="bg" cx="37%" cy="31%" r="65%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="78%"  stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#bebebe" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="16.5" fill="url(#bg)" />
      {/* Telstar-style patches */}
      <path d="M18 3 L23.5 9.5 L21 16 L15 16 L12.5 9.5 Z"       fill="#111" />
      <path d="M28 8.5 L32.5 14.5 L29 20 L23 18.5 L23.5 9.5 Z"  fill="#111" />
      <path d="M31 23.5 L25.5 30 L19 29 L18.5 22 L29 20 Z"       fill="#111" />
      <path d="M8 8.5 L3.5 14.5 L7 20 L13 18.5 L12.5 9.5 Z"     fill="#111" />
      <path d="M5 23.5 L10.5 30 L17 29 L17.5 22 L7 20 Z"         fill="#111" />
      <circle cx="18" cy="18" r="16.5" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      {/* Specular highlight */}
      <ellipse cx="13" cy="12" rx="5" ry="3" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

// ── Premium goalkeeper SVG ──
// viewBox="0 0 100 100": y=100 is the pitch/ground line. overflow="visible" for gloves.
function KeeperSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="108"
      height="108"
      overflow="visible"
      style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.6))" }}
    >
      {/* ── Ground shadow ── */}
      <ellipse cx="50" cy="99" rx="30" ry="4.5" fill="rgba(0,0,0,0.38)" />

      {/* ── Boots ── */}
      <rect x="52" y="91" width="23" height="10" rx="4" fill="#7c3aed" />
      <rect x="50" y="96" width="28" height="5"  rx="2" fill="#6d28d9" />
      <rect x="26" y="91" width="23" height="10" rx="4" fill="#7c3aed" />
      <rect x="23" y="96" width="28" height="5"  rx="2" fill="#6d28d9" />

      {/* ── Socks ── */}
      <rect x="54" y="78" width="18" height="17" rx="3" fill="#374151" />
      <rect x="54" y="78" width="18" height="5"  rx="2" fill="#4b5563" />
      <rect x="28" y="78" width="18" height="17" rx="3" fill="#374151" />
      <rect x="28" y="78" width="18" height="5"  rx="2" fill="#4b5563" />

      {/* ── Shorts ── */}
      <ellipse cx="50" cy="78" rx="12" ry="7" fill="#14532d" />
      <rect x="27" y="69" width="22" height="16" rx="6" fill="#14532d" />
      <rect x="51" y="69" width="22" height="16" rx="6" fill="#14532d" />

      {/* ── Jersey body ── */}
      {/* Main torso */}
      <rect x="26" y="22" width="48" height="52" rx="10" fill="#166534" />
      {/* Shoulder wings (wider silhouette) */}
      <rect x="17" y="22" width="66" height="24" rx="10" fill="#1a7a40" />
      {/* Central chest yoke */}
      <rect x="30" y="28" width="40" height="20" rx="6" fill="#155e34" />
      {/* Lime accent stripe */}
      <rect x="32" y="35" width="36" height="5" rx="2" fill="rgba(74,222,128,0.42)" />
      {/* Side performance panels */}
      <rect x="17" y="36" width="10" height="30" rx="4" fill="#15803d" />
      <rect x="73" y="36" width="10" height="30" rx="4" fill="#15803d" />
      {/* Jersey number */}
      <text
        x="50" y="65"
        textAnchor="middle"
        fontSize="17"
        fill="#bbf7d0"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="-1"
      >
        1
      </text>

      {/* ── Head ── */}
      {/* Neck */}
      <rect x="44" y="18" width="12" height="8" rx="5" fill="#d97706" />
      {/* Head circle */}
      <circle cx="50" cy="11" r="12" fill="#d97706" />
      {/* Keeper cap dome (covers top ~55% of head) */}
      <ellipse cx="50" cy="8" rx="12.5" ry="8" fill="#15803d" />
      {/* Cap brim shadow line */}
      <rect x="36" y="13" width="28" height="4" rx="1.5" fill="#0f4b1e" />
      {/* Minimal eye slits — determined expression, no cartoon */}
      <rect x="42" y="15.5" width="5"  height="1.5" rx="0.75" fill="rgba(30,8,0,0.65)" />
      <rect x="53" y="15.5" width="5"  height="1.5" rx="0.75" fill="rgba(30,8,0,0.65)" />

      {/* ── Left arm + glove ── */}
      {/* Sleeve */}
      <rect x="-14" y="26" width="44" height="14" rx="7" fill="#1a7a40" />
      {/* Glove — large rectangular keeper glove */}
      <rect x="-28" y="17" width="27" height="32" rx="6" fill="#f97316" />
      {/* Palm ridge highlight */}
      <rect x="-26" y="19" width="23" height="13" rx="4" fill="rgba(255,255,255,0.26)" />
      {/* Finger zone (darker) */}
      <rect x="-26" y="34" width="23" height="13" rx="4" fill="#c2410c" />
      {/* Finger dividers */}
      <line x1="-18" y1="34" x2="-18" y2="47" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      <line x1="-10" y1="34" x2="-10" y2="47" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      {/* Wrist strap */}
      <rect x="-26" y="43" width="23" height="6"  rx="2.5" fill="#fde68a" />
      {/* Glove outline */}
      <rect x="-28" y="17" width="27" height="32" rx="6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />

      {/* ── Right arm + glove ── */}
      <rect x="70" y="26" width="44" height="14" rx="7" fill="#1a7a40" />
      <rect x="101" y="17" width="27" height="32" rx="6" fill="#f97316" />
      <rect x="103" y="19" width="23" height="13" rx="4" fill="rgba(255,255,255,0.26)" />
      <rect x="103" y="34" width="23" height="13" rx="4" fill="#c2410c" />
      <line x1="111" y1="34" x2="111" y2="47" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      <line x1="119" y1="34" x2="119" y2="47" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      <rect x="103" y="43" width="23" height="6"  rx="2.5" fill="#fde68a" />
      <rect x="101" y="17" width="27" height="32" rx="6" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
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

  const canAim    = phase === "tap-to-aim" || phase === "ready-to-shoot";
  const isShooting = phase === "shooting";
  const showResult = phase === "result-flash";

  // Ball-trail ghost: fades from spot when shot fires
  const [trailFading, setTrailFading] = useState(false);
  useEffect(() => {
    if (isShooting) {
      setTrailFading(false);
      const id = requestAnimationFrame(() => setTrailFading(true));
      return () => cancelAnimationFrame(id);
    } else {
      setTrailFading(false);
    }
  }, [isShooting]);

  // Pointer handler — converts screen coords to scene-normalised
  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canAim) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left)  / rect.width;
      const ny = (e.clientY - rect.top)   / rect.height;
      if (
        nx >= GL - 0.02 && nx <= GR + 0.02 &&
        ny >= GT - 0.02 && ny <= GB + 0.04
      ) {
        const cx = Math.max(GL + 0.015, Math.min(GR - 0.015, nx));
        const cy = Math.max(GT + 0.018, Math.min(GB - 0.018, ny));
        onSceneTap(cx, cy);
      }
    },
    [canAim, onSceneTap],
  );

  // Ball
  const ballMoving = isShooting || showResult;
  const ballX      = ballMoving && aimX !== null ? aimX : 0.5;
  const ballY      = ballMoving && aimY !== null ? aimY : 0.875;
  const ballScale  = ballMoving ? 0.55 : 1;

  // Keeper (feet pinned at GB)
  const kxScene = GL + K_FRAC[keeperSide] * (GR - GL);
  const kyScene = GT + K_Y_FRAC * (GB - GT); // = GB exactly

  return (
    <div
      ref={sceneRef}
      className="relative w-full select-none overflow-hidden rounded-2xl"
      style={{ height: 290, cursor: canAim ? "crosshair" : "default" }}
      onPointerDown={handlePointer}
    >
      {/* ══ NIGHT SKY ══ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #020008 0%, #09021a 35%, #130530 50%, #071c07 50.2%, #041404 100%)",
        }}
      />

      {/* Stadium floodlights — warm glow cones */}
      {[{ l: "11%" }, { r: "11%" }].map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...(pos.l ? { left: pos.l } : { right: pos.r }),
            top: "-8%",
            width: 130,
            height: 130,
            background:
              "radial-gradient(circle, rgba(255,252,210,0.82) 0%, rgba(255,245,160,0.32) 38%, transparent 68%)",
          }}
        />
      ))}
      {/* Lens-flare centre burst */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "-2%",
          transform: "translateX(-50%)",
          width: 200,
          height: 60,
          background:
            "radial-gradient(ellipse, rgba(255,252,230,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Crowd silhouette band */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: "26%",
          height: "17%",
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 3px, transparent 3px, transparent 10px)",
        }}
      />
      {/* Crowd colour blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: "27%",
          height: "10%",
          background:
            "repeating-linear-gradient(90deg, rgba(255,77,191,0.06) 0px, rgba(255,77,191,0.06) 18px, rgba(183,148,255,0.05) 18px, rgba(183,148,255,0.05) 36px, transparent 36px, transparent 54px)",
        }}
      />

      {/* ══ PITCH ══ */}
      {/* Alternating mow stripes */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: "50%", bottom: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 22px, transparent 22px, transparent 44px)",
        }}
      />
      {/* Perspective brightness — lighter near camera */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: "50%", bottom: 0,
          background:
            "linear-gradient(to bottom, rgba(0,60,0,0) 0%, rgba(20,80,20,0.5) 100%)",
        }}
      />
      {/* Subtle radial pitch centre-glow (vanishing point) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "30%",
          background:
            "radial-gradient(ellipse, rgba(60,160,60,0.14) 0%, transparent 70%)",
        }}
      />

      {/* ══ PITCH MARKINGS ══ */}
      {/* Penalty area */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "84%", height: "51%",
          border: "1.5px solid rgba(255,255,255,0.24)",
          borderBottom: "none",
        }}
      />
      {/* 6-yard box */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "42%", height: "25%",
          border: "1.5px solid rgba(255,255,255,0.16)",
          borderBottom: "none",
        }}
      />
      {/* Penalty arc */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "49%", left: "50%",
          transform: "translateX(-50%)",
          width: 56, height: 28,
          borderRadius: "56px 56px 0 0",
          border: "1.5px solid rgba(255,255,255,0.16)",
          borderBottom: "none",
        }}
      />
      {/* Penalty spot */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "9.5%", left: "50%",
          transform: "translateX(-50%)",
          width: 8, height: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 0 5px rgba(255,255,255,0.5)",
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
        {/* Net — slightly bluish-dark, with depth vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(4,0,18,0.85) 0%, rgba(6,2,22,0.72) 100%)",
            backgroundImage: `
              linear-gradient(to bottom, rgba(4,0,18,0.85), rgba(6,2,22,0.72)),
              repeating-linear-gradient(0deg,   rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 16px),
              repeating-linear-gradient(90deg,  rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 16px)
            `,
          }}
        />
        {/* Inner back-net shadow (depth) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 10%, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {/* Zone labels L / C / R */}
        <div className="absolute inset-0 flex" style={{ zIndex: 1 }}>
          {["L", "C", "R"].map((lbl, i) => (
            <div
              key={lbl}
              className="flex-1 flex items-end justify-center pb-1"
              style={{ borderRight: i < 2 ? "1px dashed rgba(255,255,255,0.08)" : "none" }}
            >
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.18)", fontWeight: 700, letterSpacing: "0.1em" }}>
                {lbl}
              </span>
            </div>
          ))}
        </div>
        {/* Left post */}
        <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 5, background: "linear-gradient(to right, #c8c8c8, #ffffff)", boxShadow: "0 0 14px rgba(255,255,255,0.6)", zIndex: 3 }} />
        {/* Right post */}
        <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: 5, background: "linear-gradient(to left, #c8c8c8, #ffffff)", boxShadow: "0 0 14px rgba(255,255,255,0.6)", zIndex: 3 }} />
        {/* Crossbar */}
        <div className="absolute" style={{ top: 0, left: 0, right: 0, height: 5, background: "linear-gradient(to bottom, #c8c8c8, #ffffff)", boxShadow: "0 0 14px rgba(255,255,255,0.6)", zIndex: 3 }} />
        {/* Ground line */}
        <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.42)", zIndex: 3 }} />
      </div>

      {/* ══ GOALKEEPER ══ */}
      {/* Outer: horizontal position — reacts AFTER ball starts (120ms delay) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${kxScene * 100}%`,
          top: `${kyScene * 100}%`,
          zIndex: 12,
          transition: isShooting ? "left 300ms ease-out 120ms" : "none",
        }}
      >
        {/* Inner: centre + rotation */}
        <div
          style={{
            transform: `translate(-50%, -100%) rotate(${K_ROT[keeperSide]}deg)`,
            transformOrigin: "50% 100%",
            transition: isShooting ? "transform 300ms ease-out 120ms" : "none",
          }}
        >
          <KeeperSvg />
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
          <div
            className="animate-ping absolute"
            style={{ top: -10, left: -10, right: -10, bottom: -10, borderRadius: "50%", border: "2px solid rgba(255,77,191,0.55)" }}
          />
          <div
            style={{ width: 26, height: 26, border: "2.5px solid #ff4dbf", borderRadius: "50%", boxShadow: "0 0 14px #ff4dbf, 0 0 4px #ff4dbf inset" }}
          />
          <div
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 5, height: 5, borderRadius: "50%", background: "#ff4dbf", boxShadow: "0 0 6px #ff4dbf" }}
          />
        </div>
      )}

      {/* ══ BALL SHADOW (pitch spot; hides when ball flies) ══ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          bottom: "8.2%",
          transform: "translateX(-50%)",
          width: 24, height: 7,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.38)",
          filter: "blur(3px)",
          zIndex: 14,
          opacity: ballMoving ? 0 : 1,
          transition: "opacity 140ms",
        }}
      />

      {/* ══ BALL TRAIL (ghost at penalty spot fades when shot fires) ══ */}
      {isShooting && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: `${0.875 * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 13,
            opacity: trailFading ? 0 : 0.55,
            filter: "blur(2.5px)",
            transition: "opacity 380ms ease-out",
          }}
        >
          <BallSvg size={26} />
        </div>
      )}

      {/* ══ BALL ══ */}
      {/* Outer: moves via CSS transition */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${ballX * 100}%`,
          top: `${ballY * 100}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 15,
          transition: ballMoving ? "left 470ms ease-in, top 470ms ease-in" : "none",
        }}
      >
        {/* Inner: scales down as ball travels (perspective) */}
        <div
          style={{
            transform: `scale(${ballScale})`,
            transformOrigin: "center center",
            transition: ballMoving ? "transform 470ms ease-in" : "none",
            filter: isShooting
              ? "drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 2px 6px rgba(0,0,0,0.8))"
              : "drop-shadow(0 3px 6px rgba(0,0,0,0.65))",
          }}
        >
          <BallSvg size={34} />
        </div>
      </div>

      {/* ══ IMPACT EFFECTS (result-flash only) ══ */}
      {/* Goal: green burst at aim target */}
      {showResult && isGoal && aimX !== null && aimY !== null && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${aimX * 100}%`,
            top: `${aimY * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 80, height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.88) 0%, rgba(74,222,128,0.4) 45%, transparent 70%)",
            boxShadow: "0 0 36px rgba(74,222,128,0.65)",
            zIndex: 18,
          }}
        />
      )}
      {/* Save: orange burst at keeper glove area */}
      {showResult && !isGoal && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${kxScene * 100}%`,
            top: `${(kyScene - 0.12) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 64, height: 64,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.9) 0%, rgba(249,115,22,0.4) 45%, transparent 70%)",
            boxShadow: "0 0 28px rgba(249,115,22,0.6)",
            zIndex: 18,
          }}
        />
      )}

      {/* ══ TAP-TO-AIM HINT ══ (below goal, above ball — disappears once aimed) */}
      {phase === "tap-to-aim" && aimX === null && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: `${(GB + 0.06) * 100}%`,
            transform: "translateX(-50%)",
            zIndex: 22,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.52)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "3px 9px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.07em",
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
            background: isGoal ? "rgba(0,140,60,0.10)" : "rgba(180,20,30,0.10)",
            zIndex: 30,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "rgba(3,0,12,0.92)",
              border: `2px solid ${isGoal ? "rgba(74,222,128,0.72)" : "rgba(248,113,113,0.62)"}`,
              borderRadius: 20,
              padding: "12px 30px",
              textAlign: "center",
              backdropFilter: "blur(16px)",
              boxShadow: isGoal
                ? "0 0 52px rgba(74,222,128,0.24)"
                : "0 0 52px rgba(248,113,113,0.2)",
            }}
          >
            <div style={{ fontSize: 46 }}>
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
                  ? "0 0 30px rgba(74,222,128,0.65)"
                  : "0 0 30px rgba(248,113,113,0.55)",
              }}
            >
              {isPerfect ? "PERFECT!" : isGoal ? "GOAL!" : "SAVED!"}
            </div>
            {isPerfect && (
              <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 3, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                +30 XP
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
