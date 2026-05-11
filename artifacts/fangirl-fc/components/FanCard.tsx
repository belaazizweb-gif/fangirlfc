"use client";

import { forwardRef } from "react";
import { Crown, Heart, Sparkles } from "lucide-react";
import type {
  FanIdentity,
  SelfieAdjust,
  SelfieFit,
  Team,
  Template,
} from "@/types";
import type { CardProgressDisplay } from "@/lib/cardProgressAdapter";

const MAX_STARS = 5;

interface Props {
  identity: FanIdentity;
  team: Team;
  template: Template;
  displayName: string;
  selfieUrl: string | null;
  stars: number;
  selfieAdjust?: SelfieAdjust;
  /** Optional matchday headline, e.g. "Tonight: Brazil vs France". */
  matchContext?: string;
  /** Optional prediction line, e.g. "Brazil wins". */
  prediction?: string;
  /** Optional progression proof block shown inside the card (and included in export). */
  progressProof?: CardProgressDisplay;
}

const CARD_W = 360;
const CARD_H = 640;
const DEFAULT_ADJUST: SelfieAdjust = { fit: "portrait", zoom: 1 };

const FONT_SERIF =
  "var(--font-playfair), 'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT =
  "var(--font-dancing), 'Dancing Script', 'Brush Script MT', cursive";

// Rating gold — matches the StarProgress widget (amber-300 / #fcd34d)
const RATING_GOLD = "#fcd34d";
const RATING_GOLD_DEEP = "#b8860b";
const RATING_GOLD_DIM = "rgba(252, 211, 77, 0.28)";

type Theme = {
  bg: string;
  frameInk: string;
  frameInkSoft: string;
  accent: string;
  accentDeep: string;
  text: string;
  textMuted: string;
  photoBg: string;
  photoBorder: string;
  sparkle: string;
};

const THEMES: Record<string, Theme> = {
  princess: {
    bg: "linear-gradient(165deg, #ffe4ec 0%, #ffd1dc 45%, #ffe9d6 100%)",
    frameInk: "#c79454",
    frameInkSoft: "#ecd0a0",
    accent: "#d6336c",
    accentDeep: "#7a1330",
    text: "#7a1330",
    textMuted: "rgba(122,19,48,0.72)",
    photoBg: "#fff5f5",
    photoBorder: "#c79454",
    sparkle: "#d4a574",
  },
  soft: {
    bg: "linear-gradient(165deg, #fff0f6 0%, #f9d6e5 45%, #ead6f5 100%)",
    frameInk: "#b88a55",
    frameInkSoft: "#e6c994",
    accent: "#be185d",
    accentDeep: "#5e0d2f",
    text: "#5e0d2f",
    textMuted: "rgba(94,13,47,0.72)",
    photoBg: "#fff5fa",
    photoBorder: "#b88a55",
    sparkle: "#d4a574",
  },
  chaotic: {
    bg: "linear-gradient(165deg, #fce4ff 0%, #e9c2ff 45%, #ffd9ec 100%)",
    frameInk: "#a06b3a",
    frameInkSoft: "#dab07a",
    accent: "#9333ea",
    accentDeep: "#3a0a55",
    text: "#3a0a55",
    textMuted: "rgba(58,10,85,0.72)",
    photoBg: "#fce8ff",
    photoBorder: "#a06b3a",
    sparkle: "#c89a5e",
  },
  loyal: {
    bg: "linear-gradient(165deg, #fff4d6 0%, #ffe4a8 45%, #ffd9c0 100%)",
    frameInk: "#8a5a1a",
    frameInkSoft: "#d4a574",
    accent: "#b45309",
    accentDeep: "#3b1e05",
    text: "#3b1e05",
    textMuted: "rgba(59,30,5,0.72)",
    photoBg: "#fff8e6",
    photoBorder: "#8a5a1a",
    sparkle: "#b88a3a",
  },
  screamer: {
    bg: "linear-gradient(165deg, #ffe4d6 0%, #ffc6c0 45%, #ffd1dc 100%)",
    frameInk: "#a85a2a",
    frameInkSoft: "#d4a574",
    accent: "#c2410c",
    accentDeep: "#5e1a0a",
    text: "#5e1a0a",
    textMuted: "rgba(94,26,10,0.72)",
    photoBg: "#fff0e8",
    photoBorder: "#a85a2a",
    sparkle: "#c89a5e",
  },
  tactical: {
    bg: "linear-gradient(165deg, #e0e8ff 0%, #c8d4f0 45%, #e8d4f0 100%)",
    frameInk: "#5a4a7a",
    frameInkSoft: "#9b8ab8",
    accent: "#4338ca",
    accentDeep: "#1e1747",
    text: "#1e1747",
    textMuted: "rgba(30,23,71,0.72)",
    photoBg: "#eef2ff",
    photoBorder: "#5a4a7a",
    sparkle: "#9b8ab8",
  },
};

const TEMPLATE_TO_THEME: Record<string, string> = {
  "soft-girl": "soft",
  "chaotic-neon": "chaotic",
  "loyal-queen": "loyal",
  "matchday-princess": "princess",
  "last-minute-screamer": "screamer",
  "tactical-girl": "tactical",
};

function getTheme(templateId: string, identityId: string): Theme {
  const fromTemplate = TEMPLATE_TO_THEME[templateId];
  return THEMES[fromTemplate ?? identityId] ?? THEMES.princess!;
}

function fitToCss(fit: SelfieFit) {
  switch (fit) {
    case "fit":
      return { objectFit: "contain" as const, objectPosition: "center" };
    case "portrait":
      return { objectFit: "cover" as const, objectPosition: "50% 22%" };
    case "fill":
      return { objectFit: "cover" as const, objectPosition: "center" };
  }
}

function pickTitleSize(title: string): number {
  const len = title.length;
  if (len <= 9) return 38;
  if (len <= 12) return 32;
  if (len <= 16) return 26;
  return 22;
}

function ratingFromStars(stars: number): number {
  const clamped = Math.max(0, Math.min(5, stars));
  return Math.round(75 + (clamped / 5) * 24);
}

export const FanCard = forwardRef<HTMLDivElement, Props>(function FanCard(
  {
    identity,
    team,
    displayName,
    selfieUrl,
    stars,
    template,
    selfieAdjust = DEFAULT_ADJUST,
    matchContext,
    prediction,
    progressProof,
  },
  ref,
) {
  const theme = getTheme(template.id, identity.id);
  const css = fitToCss(selfieAdjust.fit);
  const starsValue = Math.max(0, Math.min(MAX_STARS, stars));
  const rating = ratingFromStars(starsValue);
  const filledStars = Math.floor(starsValue);
  const halfStar = starsValue - filledStars >= 0.5;

  // When progressProof is present, use progression engine stars as the single source of truth
  const proofStars = progressProof
    ? Math.max(0, Math.min(MAX_STARS, progressProof.starsDisplay))
    : starsValue;
  const proofFilledStars = Math.floor(proofStars);
  const proofHalfStar = proofStars - proofFilledStars >= 0.25;
  const titleSize = pickTitleSize(identity.title);
  const handle = displayName
    ? `@${displayName.toLowerCase().replace(/\s+/g, "")}`
    : "@FANGIRL.FC";

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: theme.bg,
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.5)",
      }}
      className="relative overflow-hidden rounded-[28px]"
    >
      {/* Background sparkle pattern */}
      <SparklePattern color={theme.sparkle} />

      {/* Outer ornate gold frame (double line) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10px] rounded-[22px]"
        style={{
          border: `2px solid ${theme.frameInk}`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[15px] rounded-[18px]"
        style={{
          border: `1px solid ${theme.frameInkSoft}`,
        }}
      />

      {/* Corner ornaments */}
      <CornerOrnament position="tl" color={theme.frameInk} />
      <CornerOrnament position="tr" color={theme.frameInk} />
      <CornerOrnament position="bl" color={theme.frameInk} />
      <CornerOrnament position="br" color={theme.frameInk} />

      {/* Decorative butterflies */}
      <Butterfly className="absolute right-3.5 top-16 h-7 w-7 opacity-60" color={theme.frameInk} />
      <Butterfly className="absolute bottom-24 left-3 h-6 w-6 -scale-x-100 opacity-50" color={theme.frameInk} />

      {/* Content */}
      <div className="relative flex h-full flex-col px-5 pb-4 pt-5">
        {/* Optional matchday chip */}
        {matchContext && (
          <div className="text-center">
            <span
              className="inline-block rounded-full px-2 py-[2px] text-[8.5px] font-extrabold uppercase tracking-[0.28em]"
              style={{
                background: theme.accent,
                color: "#fff",
              }}
            >
              {matchContext}
            </span>
          </div>
        )}

        {/* WC header */}
        <div className="text-center">
          <div
            className="text-[9px] font-extrabold uppercase tracking-[0.4em]"
            style={{ color: theme.accent }}
          >
            ⚽ FIFA World Cup
          </div>
          <div
            className="text-[20px] font-black leading-tight"
            style={{
              color: theme.accentDeep,
              fontFamily: FONT_SERIF,
              letterSpacing: "0.08em",
            }}
          >
            2026
          </div>
        </div>

        {/* Top row: rating | photo arch | side cursive */}
        <div className="mt-1 grid grid-cols-[58px_1fr_58px] items-start gap-1.5">
          {/* LEFT: rating + stars + heart + cursive */}
          <div className="flex flex-col items-center">
            <div
              className="text-[56px] font-black leading-[0.85]"
              style={{
                color: RATING_GOLD,
                fontFamily: FONT_SERIF,
                textShadow: `0 1px 0 ${RATING_GOLD_DEEP}, 0 0 12px ${RATING_GOLD}66`,
                WebkitTextStroke: `0.5px ${RATING_GOLD_DEEP}`,
              }}
            >
              {rating}
            </div>
            <div
              className="mt-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
              style={{ color: RATING_GOLD_DEEP }}
            >
              Fangirl
            </div>
            <Heart
              className="mt-2 h-4 w-4"
              style={{ color: theme.accent, fill: theme.accent }}
            />
            <div
              className="mt-1 text-center text-[12px] italic leading-[1.0]"
              style={{ color: theme.textMuted, fontFamily: FONT_SCRIPT }}
            >
              Football is
              <br />
              my love
              <br />
              language
            </div>
          </div>

          {/* CENTER: arched photo with gold border */}
          <div
            className="relative mx-auto h-[222px] w-full overflow-hidden"
            style={{
              borderRadius: "114px 114px 16px 16px",
              border: `2.5px solid ${theme.photoBorder}`,
              background: theme.photoBg,
              boxShadow: `inset 0 0 0 1.5px ${theme.frameInkSoft}, 0 8px 22px -8px rgba(0,0,0,0.22)`,
            }}
          >
            {selfieUrl ? (
              <img
                src={selfieUrl}
                alt=""
                crossOrigin="anonymous"
                className="absolute inset-0 h-full w-full"
                style={{
                  objectFit: css.objectFit,
                  objectPosition: css.objectPosition,
                  transform:
                    selfieAdjust.zoom !== 1
                      ? `scale(${selfieAdjust.zoom})`
                      : undefined,
                  transformOrigin: "center",
                }}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  fontSize: 110,
                  opacity: 0.55,
                  color: theme.accent,
                }}
              >
                {identity.emoji}
              </div>
            )}
            {/* Soft floodlight inside photo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${theme.frameInkSoft}66, transparent 60%)`,
                mixBlendMode: "screen",
              }}
            />
          </div>

          {/* RIGHT: Girl Power cursive + sparkles + stars */}
          <div className="flex flex-col items-center pt-2">
            <div
              className="text-center text-[20px] italic leading-[0.95]"
              style={{ color: theme.accent, fontFamily: FONT_SCRIPT }}
            >
              Girl
              <br />
              Power
            </div>
            <Heart
              className="mt-1 h-3.5 w-3.5"
              style={{ color: theme.accent, fill: theme.accent }}
            />
            <Sparkles
              className="mt-2 h-5 w-5"
              style={{ color: theme.frameInk }}
            />
            <div
              className="mt-1.5 text-[14px] leading-none"
              style={{ color: theme.frameInk }}
            >
              ✦
            </div>
          </div>
        </div>

        {/* BIG STARS ROW — the core gamification signal */}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.28em]"
            style={{ color: RATING_GOLD_DEEP }}
          >
            ★
          </span>
          <div
            className="flex items-end gap-[3px]"
            aria-label={`${proofStars}/${MAX_STARS} stars earned`}
          >
            {Array.from({ length: MAX_STARS }).map((_, i) => {
              const isFilled = i < proofFilledStars;
              const isHalf = !isFilled && i === proofFilledStars && proofHalfStar;
              const active = isFilled || isHalf;
              return (
                <div
                  key={i}
                  className="relative leading-none"
                  style={{ width: 26, height: 26 }}
                >
                  {/* Empty star outline */}
                  <span
                    className="absolute inset-0 text-[26px] leading-none"
                    style={{
                      color: RATING_GOLD_DIM,
                      WebkitTextStroke: `1px ${RATING_GOLD_DEEP}66`,
                    }}
                  >
                    ★
                  </span>
                  {active && (
                    <span
                      className="absolute inset-0 overflow-hidden text-[26px] leading-none"
                      style={{
                        width: isHalf ? "50%" : "100%",
                        color: RATING_GOLD,
                        WebkitTextStroke: `1px ${RATING_GOLD_DEEP}`,
                        textShadow: `0 0 8px ${RATING_GOLD}cc, 0 1px 0 ${RATING_GOLD_DEEP}`,
                      }}
                    >
                      ★
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.28em]"
            style={{ color: RATING_GOLD_DEEP }}
          >
            ★
          </span>
        </div>
        <div
          className="mt-0.5 text-center text-[8.5px] font-extrabold uppercase tracking-[0.32em]"
          style={{ color: RATING_GOLD_DEEP }}
        >
          {proofStars.toFixed(proofStars % 1 === 0 ? 0 : 1)} / {MAX_STARS} fangirl level
        </div>

        {/* Crown + identity title */}
        <div className="mt-2 text-center">
          <Crown
            className="mx-auto h-5 w-5"
            style={{ color: theme.frameInk, fill: theme.frameInk }}
          />
          <h2
            className="mt-0.5 font-black uppercase leading-[0.95]"
            style={{
              color: theme.accentDeep,
              fontSize: titleSize,
              letterSpacing: "0.005em",
              fontFamily: FONT_SERIF,
            }}
          >
            {identity.title}
          </h2>
          <div
            className="mt-1 flex items-center justify-center gap-2 text-[16px] italic leading-none"
            style={{ color: theme.accent, fontFamily: FONT_SCRIPT }}
          >
            <span style={{ color: theme.frameInk }}>♡</span>
            <span>World Cup 2026</span>
            <span style={{ color: theme.frameInk }}>♡</span>
          </div>
        </div>

        {/* Team line */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ color: theme.accentDeep }}
          >
            Team:
          </span>
          <span
            className="text-[16px] italic leading-none"
            style={{ color: theme.accent, fontFamily: FONT_SCRIPT }}
          >
            {team.name}
          </span>
          <span className="text-[16px] leading-none">{team.flag}</span>
        </div>

        {/* Progress proof pill — badge + penalty, one line, below team */}
        {progressProof && (progressProof.topBadge !== null || progressProof.latestPenaltyGoals !== null) && (
          <div className="mt-1.5 flex items-center justify-center">
            <div
              className="rounded-full px-3 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.22em] text-center"
              style={{
                background: `${theme.accentDeep}14`,
                color: theme.accentDeep,
                border: `1px solid ${theme.accentDeep}2a`,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {progressProof.topBadge
                ? `${progressProof.topBadge.emoji} ${progressProof.topBadge.name}  •  ⚽ ${progressProof.latestPenaltyGoals ?? "—"}/${progressProof.latestPenaltyAttempts ?? "—"}`
                : `⚽ Penalty: ${progressProof.latestPenaltyGoals !== null ? `${progressProof.latestPenaltyGoals}/${progressProof.latestPenaltyAttempts}` : "—"}`}
            </div>
          </div>
        )}

        {/* Optional prediction line */}
        {prediction && (
          <div
            className="mt-1 text-center text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ color: theme.accent }}
          >
            🔮 Prediction · {prediction}
          </div>
        )}

        {/* 3 viral vibe lines */}
        <div className="mt-2 flex flex-col gap-[4px] px-1">
          {identity.vibes.map((v) => (
            <div
              key={v}
              className="flex items-start gap-1.5 text-[12.5px] font-medium leading-[1.22]"
              style={{ color: theme.text }}
            >
              <Heart
                className="mt-[3px] h-2.5 w-2.5 shrink-0"
                style={{ color: theme.accent, fill: theme.accent }}
              />
              <span className="flex-1">{v}</span>
            </div>
          ))}
        </div>

        {/* Slogan in script */}
        <p
          className="mt-2 text-center italic leading-tight"
          style={{
            color: theme.accentDeep,
            fontFamily: FONT_SCRIPT,
            fontSize: 18,
          }}
        >
          “{identity.slogan}”
        </p>

        {/* CTA */}
        <div
          className="mt-1.5 text-center text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: theme.accent }}
        >
          → {identity.shareTrigger}
        </div>

        {/* Footer signature */}
        <div className="mt-auto pt-1">
          <div
            className="text-center text-[10px] font-extrabold uppercase tracking-[0.34em]"
            style={{ color: theme.accentDeep }}
          >
            Football · Friends · Forever
          </div>
          <div
            className="mt-1 flex items-center justify-center gap-1.5 text-[12px] italic leading-none"
            style={{ color: theme.frameInk, fontFamily: FONT_SCRIPT }}
          >
            <Heart
              className="h-2.5 w-2.5"
              style={{ color: theme.accent, fill: theme.accent }}
            />
            Fangirl forever
            <Heart
              className="h-2.5 w-2.5"
              style={{ color: theme.accent, fill: theme.accent }}
            />
          </div>
          <div
            className="mt-1.5 flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.22em]"
            style={{ color: theme.textMuted }}
          >
            <span>#WC2026</span>
            <span className="truncate">{handle}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ---------- Small decorative components ---------- */

function SparklePattern({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at 18% 12%, ${color}33 1.4px, transparent 2px), radial-gradient(circle at 82% 22%, ${color}28 1.4px, transparent 2px), radial-gradient(circle at 28% 72%, ${color}28 1.2px, transparent 2px), radial-gradient(circle at 78% 86%, ${color}33 1.4px, transparent 2px), radial-gradient(circle at 50% 48%, ${color}1c 1px, transparent 2px), radial-gradient(circle at 8% 50%, ${color}22 1.2px, transparent 2px), radial-gradient(circle at 92% 60%, ${color}22 1.2px, transparent 2px)`,
        backgroundSize: "180px 180px",
      }}
    />
  );
}

function CornerOrnament({
  position,
  color,
}: {
  position: "tl" | "tr" | "bl" | "br";
  color: string;
}) {
  const map: Record<string, string> = {
    tl: "left-3 top-3",
    tr: "right-3 top-3 rotate-90",
    bl: "left-3 bottom-3 -rotate-90",
    br: "right-3 bottom-3 rotate-180",
  };
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute h-7 w-7 ${map[position]}`}
      viewBox="0 0 28 28"
      fill="none"
    >
      <path
        d="M2 26 Q2 10 14 6"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M26 2 Q10 2 6 14"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="3" cy="3" r="1.5" fill={color} />
      <circle cx="3" cy="3" r="0.5" fill="#fff" opacity="0.6" />
    </svg>
  );
}

function Butterfly({
  className = "",
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className={`pointer-events-none ${className}`}
      fill={color}
    >
      <path
        d="M16 16 C 9 9, 2 11, 4 19 C 6 25, 13 22, 16 16 Z"
        opacity="0.75"
      />
      <path
        d="M16 16 C 23 9, 30 11, 28 19 C 26 25, 19 22, 16 16 Z"
        opacity="0.75"
      />
      <path
        d="M16 16 C 11 21, 7 26, 11 28 C 15 28, 16 22, 16 16 Z"
        opacity="0.6"
      />
      <path
        d="M16 16 C 21 21, 25 26, 21 28 C 17 28, 16 22, 16 16 Z"
        opacity="0.6"
      />
      <ellipse cx="16" cy="16" rx="0.9" ry="6" fill={color} />
      <circle cx="16" cy="9.5" r="1" fill={color} />
    </svg>
  );
}
