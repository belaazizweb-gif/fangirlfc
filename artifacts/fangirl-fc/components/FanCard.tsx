"use client";

import { forwardRef } from "react";
import type {
  FanIdentity,
  SelfieAdjust,
  SelfieFit,
  Team,
  Template,
} from "@/types";

interface Props {
  identity: FanIdentity;
  team: Team;
  template: Template;
  displayName: string;
  selfieUrl: string | null;
  stars: number;
  selfieAdjust?: SelfieAdjust;
}

const CARD_W = 360;
const CARD_H = 640;
const DEFAULT_ADJUST: SelfieAdjust = { fit: "portrait", zoom: 1 };

type Theme = {
  bg: string;
  photoBg: string;
  text: string;
  textMuted: string;
  accent: string;
  accentInk: string;
  ambient: string;
  crowdShadow: string;
  light: boolean;
};

const TEMPLATE_TO_THEME: Record<string, string> = {
  "soft-girl": "soft",
  "chaotic-neon": "chaotic",
  "loyal-queen": "loyal",
  "matchday-princess": "princess",
  "last-minute-screamer": "screamer",
  "tactical-girl": "tactical",
};

const THEMES: Record<string, Theme> = {
  chaotic: {
    bg: "linear-gradient(170deg, #160628 0%, #2c0a52 55%, #1a0735 100%)",
    photoBg: "#0d0420",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.78)",
    accent: "#ff5cc4",
    accentInk: "#1a0735",
    ambient: "rgba(255, 92, 196, 0.34)",
    crowdShadow: "rgba(0,0,0,0.55)",
    light: false,
  },
  loyal: {
    bg: "linear-gradient(170deg, #050505 0%, #1a1306 55%, #0a0905 100%)",
    photoBg: "#000000",
    text: "#fde68a",
    textMuted: "rgba(253,230,138,0.78)",
    accent: "#facc15",
    accentInk: "#0a0905",
    ambient: "rgba(250, 204, 21, 0.30)",
    crowdShadow: "rgba(0,0,0,0.6)",
    light: false,
  },
  soft: {
    bg: "linear-gradient(170deg, #fff5f9 0%, #fce7f3 50%, #f5d0fe 100%)",
    photoBg: "#fdf2f8",
    text: "#831843",
    textMuted: "rgba(131,24,67,0.78)",
    accent: "#db2777",
    accentInk: "#ffffff",
    ambient: "rgba(219, 39, 119, 0.18)",
    crowdShadow: "rgba(131,24,67,0.32)",
    light: true,
  },
  princess: {
    bg: "linear-gradient(170deg, #fff1f2 0%, #ffd1dc 50%, #fecaca 100%)",
    photoBg: "#fff5f5",
    text: "#881337",
    textMuted: "rgba(136,19,55,0.78)",
    accent: "#e11d48",
    accentInk: "#ffffff",
    ambient: "rgba(225, 29, 72, 0.20)",
    crowdShadow: "rgba(136,19,55,0.32)",
    light: true,
  },
  screamer: {
    bg: "linear-gradient(170deg, #1a0908 0%, #5a1810 55%, #2c0d07 100%)",
    photoBg: "#0d0302",
    text: "#fed7aa",
    textMuted: "rgba(254,215,170,0.80)",
    accent: "#fb923c",
    accentInk: "#1a0908",
    ambient: "rgba(251, 146, 60, 0.34)",
    crowdShadow: "rgba(0,0,0,0.6)",
    light: false,
  },
  tactical: {
    bg: "linear-gradient(170deg, #050b18 0%, #0c1a30 55%, #050b18 100%)",
    photoBg: "#020610",
    text: "#e0f7ff",
    textMuted: "rgba(224,247,255,0.78)",
    accent: "#22d3ee",
    accentInk: "#020610",
    ambient: "rgba(34, 211, 238, 0.28)",
    crowdShadow: "rgba(0,0,0,0.6)",
    light: false,
  },
};

function getTheme(templateId: string, identityId: string): Theme {
  const fromTemplate = TEMPLATE_TO_THEME[templateId];
  return THEMES[fromTemplate ?? identityId] ?? THEMES.chaotic!;
}

function fitToCss(fit: SelfieFit): {
  objectFit: "cover" | "contain";
  objectPosition: string;
} {
  switch (fit) {
    case "fit":
      return { objectFit: "contain", objectPosition: "center" };
    case "portrait":
      return { objectFit: "cover", objectPosition: "50% 22%" };
    case "fill":
      return { objectFit: "cover", objectPosition: "center" };
  }
}

function pickTitleSize(title: string): number {
  const len = title.length;
  if (len <= 9) return 60;
  if (len <= 12) return 54;
  if (len <= 15) return 46;
  return 40;
}

export const FanCard = forwardRef<HTMLDivElement, Props>(function FanCard(
  {
    identity,
    team,
    template,
    displayName,
    selfieUrl,
    selfieAdjust = DEFAULT_ADJUST,
  },
  ref,
) {
  const theme = getTheme(template.id, identity.id);
  const css = fitToCss(selfieAdjust.fit);
  const big = identity.title.toUpperCase();
  const titleSize = pickTitleSize(big);

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: theme.bg,
        color: theme.text,
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
      className="relative overflow-hidden rounded-[36px]"
    >
      {/* Floodlight halos from top corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 45% at 12% -8%, ${theme.ambient}, transparent 65%), radial-gradient(ellipse 70% 45% at 88% -8%, ${theme.ambient}, transparent 65%)`,
        }}
      />

      {/* Subtle vertical jersey-stripe texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: theme.light
            ? "repeating-linear-gradient(90deg, rgba(0,0,0,0.022) 0 22px, transparent 22px 44px)"
            : "repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0 22px, transparent 22px 44px)",
        }}
      />

      <div className="relative flex h-full flex-col px-6 pb-6 pt-5">
        {/* TOP: thin meta + BIG title */}
        <div
          className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-[0.32em]"
          style={{ color: theme.accent, opacity: 0.9 }}
        >
          <span>Fangirl FC · 26</span>
          <span className="max-w-[55%] truncate">
            {team.flag} {team.name}
          </span>
        </div>

        <h2
          className="mt-2 font-black uppercase"
          style={{
            fontSize: titleSize,
            lineHeight: 0.88,
            letterSpacing: "-0.025em",
            color: theme.text,
          }}
        >
          {big}
        </h2>

        {/* CENTER: dominant photo */}
        <div
          className="relative mt-3 flex-1 overflow-hidden rounded-[20px]"
          style={{
            background: theme.photoBg,
            boxShadow: `inset 0 0 0 1px ${theme.accent}33, 0 18px 40px -16px rgba(0,0,0,0.55)`,
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
                fontSize: 170,
                opacity: theme.light ? 0.55 : 0.8,
                color: theme.accent,
              }}
            >
              {identity.emoji}
            </div>
          )}

          {/* Floodlight beam from top-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 22% -10%, ${theme.ambient}, transparent 60%)`,
              mixBlendMode: theme.light ? "multiply" : "screen",
            }}
          />

          {/* Crowd silhouette darken at the bottom of the photo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background: `linear-gradient(to top, ${theme.crowdShadow} 0%, transparent 100%)`,
            }}
          />

          {/* Tiny matchday tag */}
          <div
            className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase tracking-[0.18em]"
            style={{
              background: theme.accent,
              color: theme.accentInk,
            }}
          >
            ⚽ MD · 26
          </div>

          {/* Display name strip — minimal, on the photo */}
          {displayName && (
            <div
              className="absolute inset-x-3 bottom-2.5 truncate text-center text-[11px] font-extrabold uppercase tracking-[0.22em]"
              style={{
                color: "#fff",
                textShadow: "0 1px 6px rgba(0,0,0,0.7)",
              }}
            >
              {displayName}
            </div>
          )}
        </div>

        {/* BOTTOM: 3 short behavior lines + strong quote */}
        <div className="mt-3.5 flex flex-col gap-[3px]">
          {identity.vibes.map((v) => (
            <div
              key={v}
              className="flex gap-2 text-[12.5px] leading-[1.25]"
              style={{ color: theme.text, opacity: 0.92 }}
            >
              <span
                className="font-black"
                style={{ color: theme.accent }}
              >
                —
              </span>
              <span className="flex-1">{v}</span>
            </div>
          ))}
        </div>

        <p
          className="mt-2.5 text-[13px] font-semibold italic leading-snug"
          style={{ color: theme.text, opacity: 0.96 }}
        >
          “{identity.slogan}”
        </p>

        {/* CTA: short shareable line that begs to be sent */}
        <div
          className="mt-2 text-[10.5px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: theme.accent, opacity: 0.95 }}
        >
          → {identity.shareTrigger}
        </div>
      </div>
    </div>
  );
});
