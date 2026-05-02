"use client";

import { forwardRef } from "react";
import type { FanIdentity, Team, Template } from "@/types";
import { Star } from "lucide-react";

interface Props {
  identity: FanIdentity;
  team: Team;
  template: Template;
  displayName: string;
  selfieUrl: string | null;
  stars: number;
}

const CARD_W = 360;
const CARD_H = 640;

export const FanCard = forwardRef<HTMLDivElement, Props>(function FanCard(
  props,
  ref,
) {
  const { template } = props;
  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        height: CARD_H,
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
      className="relative overflow-hidden rounded-[36px]"
    >
      {renderTemplate(template.id, props)}
    </div>
  );
});

function renderTemplate(id: string, props: Props) {
  switch (id) {
    case "soft-girl":
      return <SoftGirlCard {...props} />;
    case "chaotic-neon":
      return <ChaoticNeonCard {...props} />;
    case "loyal-queen":
      return <LoyalQueenCard {...props} />;
    case "matchday-princess":
      return <MatchdayPrincessCard {...props} />;
    case "last-minute-screamer":
      return <ScreamerCard {...props} />;
    case "tactical-girl":
      return <TacticalGirlCard {...props} />;
    default:
      return <SoftGirlCard {...props} />;
  }
}

/* ------------------------------- shared bits ------------------------------ */

function StarRow({ stars, color }: { stars: number; color: string }) {
  const filled = Math.floor(stars);
  const half = stars - filled >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i < filled;
        const halfStar = !full && i === filled && half;
        return (
          <div key={i} className="relative h-3 w-3">
            <Star
              className="absolute inset-0 h-3 w-3"
              strokeWidth={2}
              style={{ color, opacity: 0.25 }}
            />
            {(full || halfStar) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: halfStar ? "50%" : "100%" }}
              >
                <Star
                  className="h-3 w-3"
                  strokeWidth={2}
                  style={{ color, fill: color }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Selfie({
  selfieUrl,
  emoji,
  size,
  ring,
  shape = "circle",
  bg = "rgba(255,255,255,0.18)",
}: {
  selfieUrl: string | null;
  emoji: string;
  size: number;
  ring: string;
  shape?: "circle" | "square";
  bg?: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "9999px" : "24px",
        background: bg,
        boxShadow: `0 0 0 4px ${ring}, 0 18px 36px -12px rgba(0,0,0,0.55)`,
      }}
    >
      {selfieUrl ? (
        <img
          src={selfieUrl}
          alt=""
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ fontSize: size * 0.55 }}
        >
          {emoji}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

/* --------------------------------- SOFT ----------------------------------- */

function SoftGirlCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, #ffe4f1 0%, transparent 55%), radial-gradient(120% 80% at 80% 100%, #fff0c4 0%, transparent 55%), linear-gradient(160deg, #ffe4ec 0%, #f3d7ff 55%, #fff1c4 100%)",
      }}
    >
      <Sparkle x={28} y={56} size={20} color="#fff" />
      <Sparkle x={310} y={84} size={16} color="#ffd6e7" />
      <Sparkle x={36} y={520} size={14} color="#ffe7b3" />
      <Sparkle x={314} y={560} size={22} color="#fff" />

      <div className="relative flex h-full flex-col items-center px-7 py-7">
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-rose-700">
            ✿ Fangirl FC
          </span>
          <StarRow stars={stars} color="#be185d" />
        </div>

        {/* Big polaroid selfie */}
        <div
          className="mt-3 rounded-[20px] bg-white p-3 shadow-[0_24px_40px_-16px_rgba(190,24,93,0.55)]"
          style={{ transform: "rotate(-3deg)" }}
        >
          <Selfie
            selfieUrl={selfieUrl}
            emoji={identity.emoji}
            size={220}
            ring="#ffffff"
            shape="square"
            bg="linear-gradient(160deg,#ffe4ec,#f3d7ff)"
          />
        </div>

        {/* Title */}
        <div className="mt-5 text-center">
          <div className="text-[52px] font-black leading-[0.9] tracking-tight text-rose-900">
            {identity.title}
          </div>
          <div className="mt-1 text-sm font-bold text-rose-700">
            {displayName || "Anonymous"} · {team.flag} {team.name}
          </div>
        </div>

        {/* Vibes — emotional one-liners */}
        <div className="mt-auto w-full pt-4">
          <div className="flex flex-col items-center gap-1.5">
            {identity.vibes.map((v) => (
              <div
                key={v}
                className="rounded-full bg-white/85 px-4 py-1.5 text-center text-[13px] font-bold text-rose-800 shadow-[0_4px_10px_-4px_rgba(190,24,93,0.3)]"
              >
                {v}
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-rose-600/80">
            ✿ {identity.shareTrigger}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkle({
  x,
  y,
  size,
  color,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
      </svg>
    </div>
  );
}

/* -------------------------------- CHAOTIC --------------------------------- */

function ChaoticNeonCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(160deg, #1b0033 0%, #5b00b3 45%, #ff00d4 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-12 h-1 bg-cyan-300/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-16 h-1 bg-yellow-300/70" />
      <div className="absolute right-3 top-3 rotate-3 rounded-md bg-yellow-300 px-2 py-0.5 text-[9px] font-black uppercase text-black shadow-md">
        ★ Rare Drop
      </div>

      <div className="relative flex h-full flex-col items-center p-6 text-white">
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">
            FANGIRL FC // 404
          </span>
          <StarRow stars={stars} color="#5eead4" />
        </div>

        {/* Big selfie */}
        <div className="mt-4">
          <Selfie
            selfieUrl={selfieUrl}
            emoji={identity.emoji}
            size={210}
            ring="#5eead4"
            shape="square"
            bg="linear-gradient(160deg,#1b0033,#5b00b3)"
          />
        </div>

        {/* Glitched HUGE title */}
        <div className="relative mt-5 text-center">
          <div
            className="absolute inset-0 text-[54px] font-black uppercase leading-[0.85] tracking-tight text-cyan-300"
            style={{ transform: "translate(-2px, 1px)", mixBlendMode: "screen" }}
          >
            {identity.title}
          </div>
          <div
            className="absolute inset-0 text-[54px] font-black uppercase leading-[0.85] tracking-tight text-pink-400"
            style={{ transform: "translate(2px, -1px)", mixBlendMode: "screen" }}
          >
            {identity.title}
          </div>
          <div className="relative text-[54px] font-black uppercase leading-[0.85] tracking-tight text-white">
            {identity.title}
          </div>
        </div>
        <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-cyan-300">
          @{(displayName || "anonymous").replace(/\s+/g, "_").toLowerCase()} ·{" "}
          {team.flag} {team.name}
        </div>

        {/* Vibes */}
        <div className="mt-auto w-full pt-4">
          <div className="flex flex-col gap-1.5">
            {identity.vibes.map((v) => (
              <div
                key={v}
                className="border-l-4 border-cyan-300 bg-black/55 px-3 py-2 text-[14px] font-black uppercase tracking-tight text-yellow-300"
              >
                ▸ {v}
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">
            ★ {identity.shareTrigger}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- LOYAL ---------------------------------- */

function LoyalQueenCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 0%, #3d2c0a 0%, #050505 70%), linear-gradient(180deg, #050505 0%, #1a1306 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-[28px]"
        style={{ border: "1px solid rgba(250,204,21,0.55)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg, rgba(250,204,21,0.18) 0%, transparent 35%)",
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative flex h-full flex-col items-center px-7 py-8 text-amber-100">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.5em] text-amber-300">
          ♛ Fangirl FC
        </div>

        {/* Big medallion */}
        <div className="relative mt-4">
          <div
            className="absolute -inset-4 rounded-full"
            style={{
              background:
                "conic-gradient(from 90deg, #facc15, #fde68a, #92400e, #facc15)",
              filter: "blur(2px)",
              opacity: 0.85,
            }}
          />
          <div className="relative">
            <Selfie
              selfieUrl={selfieUrl}
              emoji={identity.emoji}
              size={210}
              ring="#facc15"
            />
          </div>
        </div>

        {/* Title */}
        <div className="mt-5 text-center">
          <div className="text-[48px] font-black uppercase leading-[0.9] tracking-tight text-amber-200">
            {identity.title}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.4em] text-amber-400/80">
            {displayName || "Anonymous"} · {team.flag} {team.name}
          </div>
        </div>

        {/* Vibes */}
        <div className="mt-auto w-full pt-4">
          <div className="mb-3 flex justify-center">
            <StarRow stars={stars} color="#facc15" />
          </div>
          <div className="flex flex-col gap-1.5">
            {identity.vibes.map((v) => (
              <div
                key={v}
                className="rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-center text-[13px] font-bold text-amber-100"
              >
                {v}
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/80">
            ♛ {identity.shareTrigger}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- PRINCESS -------------------------------- */

function MatchdayPrincessCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(160deg, #ffd2e5 0%, #ff8fc3 55%, #ffe7a8 100%)",
      }}
    >
      <div className="absolute inset-x-4 top-3 flex gap-1">
        {[1, 0.7, 0.3, 0, 0].map((p, i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/40"
          >
            <div className="h-full bg-white" style={{ width: `${p * 100}%` }} />
          </div>
        ))}
      </div>

      {/* Huge hero selfie */}
      <div className="relative mx-5 mt-7 h-[400px] overflow-hidden rounded-[28px] shadow-[0_22px_40px_-18px_rgba(162,21,103,0.45)]">
        {selfieUrl ? (
          <img
            src={selfieUrl}
            alt=""
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[180px]"
            style={{
              background:
                "linear-gradient(160deg, #ffb6d5 0%, #ff8fc3 50%, #ffd58a 100%)",
            }}
          >
            {identity.emoji}
          </div>
        )}
        <div className="absolute right-3 top-3 rotate-[5deg] rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow">
          MATCHDAY 💖
        </div>

        {/* Title overlaid for instant readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="text-[36px] font-black leading-[0.95] tracking-tight text-white drop-shadow">
            {identity.title}
          </div>
          <div className="mt-0.5 text-[11px] font-bold text-white/90">
            {displayName || "Anonymous"} · {team.flag} {team.name}
          </div>
        </div>
      </div>

      {/* Vibes */}
      <div className="mx-5 mt-3 flex flex-col gap-1">
        {identity.vibes.map((v) => (
          <div
            key={v}
            className="rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-black text-rose-900"
          >
            ♡ {v}
          </div>
        ))}
      </div>

      <div className="mx-5 mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-rose-800/80">
        <span>💅 {identity.shareTrigger}</span>
        <StarRow stars={stars} color="#a21567" />
      </div>
    </div>
  );
}

/* -------------------------------- SCREAMER -------------------------------- */

function ScreamerCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  const big = identity.title.toUpperCase();
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(160deg, #ffef3a 0%, #ff6f3a 55%, #c9001a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0 18px, #ffd400 18px 36px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0 18px, #ffd400 18px 36px)",
        }}
      />
      <div className="absolute right-4 top-9 rotate-12 rounded-md border-[3px] border-black px-3 py-1 text-center text-[14px] font-black uppercase tracking-wider text-black">
        CERTIFIED
        <div className="text-[9px] font-black leading-none">menace</div>
      </div>

      <div className="relative flex h-full flex-col items-center px-6 pb-10 pt-9">
        {/* HUGE meme title */}
        <div className="text-center">
          <div
            className="font-black uppercase leading-[0.85] tracking-tight text-black"
            style={{
              fontSize: big.length > 16 ? 50 : 60,
              WebkitTextStroke: "2px #fff",
              textShadow:
                "4px 4px 0 #fff, -1px -1px 0 #000, 0 8px 0 rgba(0,0,0,0.25)",
            }}
          >
            {big}
          </div>
        </div>

        {/* Big selfie with shouting border */}
        <div
          className="mt-4 rotate-[-3deg] border-[6px] border-black bg-white p-1"
          style={{ boxShadow: "8px 8px 0 #000" }}
        >
          <Selfie
            selfieUrl={selfieUrl}
            emoji={identity.emoji}
            size={210}
            ring="#000"
            shape="square"
          />
        </div>

        {/* Vibes — meme bottom text */}
        <div className="mt-auto w-full pt-4">
          <div className="flex flex-col gap-1">
            {identity.vibes.map((v) => (
              <div
                key={v}
                className="text-center font-black uppercase leading-tight text-black"
                style={{
                  fontSize: 18,
                  WebkitTextStroke: "1.2px #fff",
                  textShadow: "2.5px 2.5px 0 #fff",
                }}
              >
                "{v}"
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="rounded-md bg-black px-2 py-1 text-[10px] font-black uppercase text-yellow-300">
              {(displayName || "Anon").toUpperCase()} · {team.flag} {team.name}
            </div>
            <div className="rounded-md bg-black px-2 py-1 text-[10px] font-black uppercase text-yellow-300">
              ★ {identity.shareTrigger}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- TACTICAL -------------------------------- */

function TacticalGirlCard({
  identity,
  team,
  displayName,
  selfieUrl,
  stars,
}: Props) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(160deg, #0b0f17 0%, #0f172a 55%, #0b0f17 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-full flex-col items-center px-7 py-7 text-white">
        <div className="flex w-full items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">
            fangirlfc · v26
          </div>
          <StarRow stars={stars} color="#22d3ee" />
        </div>

        {/* Big square selfie */}
        <div className="mt-5">
          <Selfie
            selfieUrl={selfieUrl}
            emoji={identity.emoji}
            size={220}
            ring="#22d3ee"
            shape="square"
            bg="linear-gradient(160deg,#0f172a,#0b0f17)"
          />
        </div>

        {/* Title */}
        <div className="mt-5 text-center">
          <div className="text-[44px] font-black leading-[0.9] tracking-tight text-white">
            {identity.title}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-300">
            {displayName || "Anonymous"} · {team.flag} {team.name}
          </div>
        </div>

        {/* Vibes as data rows */}
        <div className="mt-auto w-full pt-5">
          <div className="flex flex-col gap-2">
            {identity.vibes.map((v, i) => (
              <div
                key={v}
                className="flex items-center gap-2 border-b border-white/10 pb-1.5 text-sm font-bold text-white/95"
              >
                <span className="text-[10px] font-black text-cyan-300">
                  0{i + 1}
                </span>
                <span className="flex-1">{v}</span>
                <span className="text-cyan-300">▸</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">
            ◆ {identity.shareTrigger}
          </div>
        </div>
      </div>
    </div>
  );
}
