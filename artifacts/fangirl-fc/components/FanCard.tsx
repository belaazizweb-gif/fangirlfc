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
          <div key={i} className="relative h-3.5 w-3.5">
            <Star
              className="absolute inset-0 h-3.5 w-3.5"
              strokeWidth={2}
              style={{ color, opacity: 0.25 }}
            />
            {(full || halfStar) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: halfStar ? "50%" : "100%" }}
              >
                <Star
                  className="h-3.5 w-3.5"
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
}: {
  selfieUrl: string | null;
  emoji: string;
  size: number;
  ring: string;
  shape?: "circle" | "square";
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "9999px" : "20px",
        background: "rgba(255,255,255,0.18)",
        boxShadow: `0 0 0 3px ${ring}, 0 14px 28px -10px rgba(0,0,0,0.55)`,
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
        <div className="flex h-full w-full items-center justify-center text-[44px]">
          {emoji}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)",
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
      {/* sparkles */}
      <Sparkle x={32} y={48} size={18} color="#fff" />
      <Sparkle x={300} y={70} size={14} color="#ffd6e7" />
      <Sparkle x={56} y={420} size={12} color="#ffe7b3" />
      <Sparkle x={310} y={520} size={20} color="#fff" />
      <Sparkle x={180} y={28} size={10} color="#fff" />
      <Sparkle x={260} y={300} size={9} color="#ffd6e7" />

      {/* hearts watermark */}
      <div className="pointer-events-none absolute -right-4 top-32 text-[160px] leading-none opacity-15">
        🌸
      </div>

      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-rose-700">
              ✿ Fangirl FC
            </span>
          </div>
          <StarRow stars={stars} color="#be185d" />
        </div>

        {/* Polaroid */}
        <div className="mt-3 flex justify-center">
          <div
            className="rounded-[20px] bg-white p-3 shadow-[0_18px_30px_-12px_rgba(190,24,93,0.45)]"
            style={{ transform: "rotate(-3deg)" }}
          >
            <Selfie
              selfieUrl={selfieUrl}
              emoji={identity.emoji}
              size={150}
              ring="#fff"
              shape="square"
            />
            <div
              className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-rose-700"
              style={{ fontFamily: "cursive" }}
            >
              {team.flag} {team.name}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 text-center">
          <div className="text-[42px] font-black leading-[0.95] tracking-tight text-rose-900">
            {identity.title}
          </div>
          <div className="mt-1 text-sm font-bold text-rose-700">
            {displayName || "Anonymous Fan"}
          </div>
        </div>

        {/* Slogan ribbon */}
        <div
          className="mt-3 self-center rounded-full bg-white/80 px-4 py-1.5 text-center text-[12px] font-bold italic text-rose-800 backdrop-blur"
          style={{ boxShadow: "0 6px 14px -6px rgba(190,24,93,0.35)" }}
        >
          "{identity.slogan}"
        </div>

        {/* Stats */}
        <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
          {identity.defaultStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/70 px-2 py-2 text-center backdrop-blur"
              style={{ boxShadow: "inset 0 0 0 1px rgba(190,24,93,0.18)" }}
            >
              <div className="text-[8px] font-bold uppercase tracking-wider text-rose-500">
                {s.label}
              </div>
              <div className="mt-0.5 text-[13px] font-black leading-tight text-rose-900">
                {s.value}
              </div>
            </div>
          ))}
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
      {/* grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(94,234,212,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.25) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 40%, transparent 100%)",
        }}
      />
      {/* glitch bars */}
      <div className="pointer-events-none absolute inset-x-0 top-12 h-1.5 bg-cyan-300/80" />
      <div className="pointer-events-none absolute inset-x-0 top-[14px] h-[2px] bg-pink-400/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-20 h-1.5 bg-yellow-300/70" />

      {/* corner tag */}
      <div className="absolute right-3 top-3 rotate-3 rounded-md bg-yellow-300 px-2 py-0.5 text-[9px] font-black uppercase text-black shadow-md">
        ★ Rare Drop
      </div>

      <div className="relative flex h-full flex-col p-6 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">
            FANGIRL FC // 404
          </span>
          <StarRow stars={stars} color="#5eead4" />
        </div>

        {/* Title — duplicated for glitch effect */}
        <div className="relative mt-4">
          <div
            className="absolute inset-0 text-[48px] font-black uppercase leading-[0.9] tracking-tight text-cyan-300"
            style={{ transform: "translate(-2px, 1px)", mixBlendMode: "screen" }}
          >
            {identity.title}
          </div>
          <div
            className="absolute inset-0 text-[48px] font-black uppercase leading-[0.9] tracking-tight text-pink-400"
            style={{ transform: "translate(2px, -1px)", mixBlendMode: "screen" }}
          >
            {identity.title}
          </div>
          <div className="relative text-[48px] font-black uppercase leading-[0.9] tracking-tight text-white">
            {identity.title}
          </div>
        </div>

        {/* Selfie + name */}
        <div className="mt-5 flex items-center gap-3">
          <div className="relative">
            <Selfie
              selfieUrl={selfieUrl}
              emoji={identity.emoji}
              size={92}
              ring="#5eead4"
              shape="square"
            />
            <div className="absolute -bottom-2 -right-2 rotate-6 rounded-md bg-pink-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-lg">
              CHAOS
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              @{(displayName || "anonymous").replace(/\s+/g, "_").toLowerCase()}
            </div>
            <div className="mt-0.5 truncate text-2xl font-black">
              {displayName || "Anonymous"}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-sm bg-black/50 px-1.5 py-0.5 text-[11px] font-bold">
              {team.flag} {team.name}
            </div>
          </div>
        </div>

        {/* Slogan */}
        <div className="mt-4 border-l-4 border-cyan-300 bg-black/40 px-3 py-2 text-[14px] font-bold italic text-cyan-100">
          "{identity.slogan}"
        </div>

        {/* Stats — terminal style */}
        <div className="mt-auto grid grid-cols-3 gap-1.5 pt-4">
          {identity.defaultStats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-md border border-cyan-300/40 bg-black/55 px-2 py-2"
            >
              <div className="text-[8px] font-black uppercase text-cyan-300">
                ▸ {s.label}
              </div>
              <div className="mt-0.5 text-[14px] font-black leading-tight text-yellow-300">
                {s.value}
              </div>
              <div
                className="mt-1 h-1 w-full rounded-full bg-pink-500/30"
                style={{ boxShadow: `inset ${4 + i * 6}px 0 0 #ff00d4` }}
              />
            </div>
          ))}
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
      {/* gold ornamental border */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[28px]"
        style={{ border: "1px solid rgba(250,204,21,0.55)" }}
      />
      <div
        className="pointer-events-none absolute inset-5 rounded-[24px]"
        style={{ border: "1px solid rgba(250,204,21,0.25)" }}
      />
      {/* shimmer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg, rgba(250,204,21,0.18) 0%, transparent 35%)",
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative flex h-full flex-col items-center px-7 py-8 text-amber-100">
        {/* Crest */}
        <div className="text-3xl text-amber-300">♛</div>
        <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.5em] text-amber-300">
          Fangirl FC
        </div>
        <div
          className="mt-1 h-[1px] w-32"
          style={{
            background:
              "linear-gradient(90deg, transparent, #facc15, transparent)",
          }}
        />

        {/* Title */}
        <div className="mt-4 text-center">
          <div className="text-[40px] font-black uppercase leading-[0.95] tracking-tight text-amber-200">
            {identity.title}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/80">
            {identity.rarity}
          </div>
        </div>

        {/* Medallion selfie */}
        <div className="relative mt-5">
          <div
            className="absolute -inset-3 rounded-full"
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
              size={140}
              ring="#facc15"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-3 py-0.5 text-[10px] font-black text-black shadow-lg">
            ROYAL · 24K
          </div>
        </div>

        {/* Name + team */}
        <div className="mt-7 text-center">
          <div className="text-xl font-black tracking-wide text-amber-100">
            {displayName || "Anonymous Fan"}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80">
            {team.flag} House of {team.name}
          </div>
        </div>

        {/* Slogan */}
        <div className="mt-3 text-center text-[13px] italic text-amber-200/80">
          "{identity.slogan}"
        </div>

        {/* Stats */}
        <div className="mt-auto w-full">
          <div className="mb-2 flex justify-center">
            <StarRow stars={stars} color="#facc15" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {identity.defaultStats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-amber-400/25 bg-amber-400/5 px-2 py-2 text-center"
              >
                <div className="text-[8px] font-bold uppercase tracking-wider text-amber-400/80">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[13px] font-black leading-tight text-amber-100">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.4em] text-amber-400/60">
            World Cup '26 · Limited Edition
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
      {/* IG-story top progress bars */}
      <div className="absolute inset-x-4 top-3 flex gap-1">
        {[1, 0.7, 0.3, 0, 0].map((p, i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/40"
          >
            <div
              className="h-full bg-white"
              style={{ width: `${p * 100}%` }}
            />
          </div>
        ))}
      </div>

      {/* Profile-bar header */}
      <div className="absolute inset-x-5 top-7 flex items-center gap-2">
        <div className="h-7 w-7 overflow-hidden rounded-full ring-2 ring-white">
          {selfieUrl ? (
            <img src={selfieUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/60 text-sm">
              {identity.emoji}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-black text-rose-900">
            {(displayName || "anonymous").toLowerCase().replace(/\s+/g, "_")}
          </div>
          <div className="text-[9px] font-bold text-rose-800/80">
            matchday · just now
          </div>
        </div>
        <div className="text-[11px] font-black text-rose-900">⋯</div>
      </div>

      {/* Big selfie */}
      <div className="relative mx-5 mt-20 h-[270px] overflow-hidden rounded-[28px] shadow-[0_22px_40px_-18px_rgba(162,21,103,0.45)]">
        {selfieUrl ? (
          <img
            src={selfieUrl}
            alt=""
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[120px]"
            style={{
              background:
                "linear-gradient(160deg, #ffb6d5 0%, #ff8fc3 50%, #ffd58a 100%)",
            }}
          >
            {identity.emoji}
          </div>
        )}
        {/* sticker badges */}
        <div className="absolute left-3 top-3 rotate-[-6deg] rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase text-rose-700 shadow">
          {team.flag} {team.name}
        </div>
        <div className="absolute right-3 top-3 rotate-[5deg] rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow">
          MATCHDAY 💖
        </div>
        <div
          className="absolute bottom-3 left-3 rounded-2xl bg-black/55 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur"
          style={{ fontStyle: "italic" }}
        >
          "{identity.slogan}"
        </div>
      </div>

      {/* Title */}
      <div className="mx-5 mt-3">
        <div className="text-[32px] font-black leading-[0.95] tracking-tight text-rose-900">
          {identity.title}
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[11px] font-bold text-rose-800/80">
          <span>♡ 14.2k · 💬 312 · ↗ share</span>
          <StarRow stars={stars} color="#a21567" />
        </div>
      </div>

      {/* Stats pills */}
      <div className="mx-5 mt-3 flex flex-wrap gap-1.5">
        {identity.defaultStats.map((s) => (
          <div
            key={s.label}
            className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-rose-900"
          >
            {s.label}: <span className="text-rose-600">{s.value}</span>
          </div>
        ))}
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
      {/* caution stripes */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0 18px, #ffd400 18px 36px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #000 0 18px, #ffd400 18px 36px)",
        }}
      />
      {/* stamp */}
      <div className="absolute right-4 top-12 rotate-12 rounded-md border-[3px] border-black px-3 py-1 text-[14px] font-black uppercase tracking-wider text-black">
        CERTIFIED
        <div className="text-[9px] font-black leading-none">menace</div>
      </div>

      <div className="relative flex h-full flex-col px-6 pb-12 pt-12">
        {/* meme top text */}
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70">
            POV: stoppage time
          </div>
        </div>

        {/* HUGE meme title */}
        <div className="mt-2 text-center">
          <div
            className="font-black uppercase leading-[0.85] tracking-tight text-black"
            style={{
              fontSize: big.length > 16 ? 46 : 56,
              WebkitTextStroke: "2px #fff",
              textShadow:
                "4px 4px 0 #fff, -1px -1px 0 #000, 0 8px 0 rgba(0,0,0,0.25)",
            }}
          >
            {big}
          </div>
        </div>

        {/* selfie with screaming border */}
        <div className="mt-3 flex justify-center">
          <div
            className="rotate-[-3deg] border-[6px] border-black bg-white p-1"
            style={{ boxShadow: "8px 8px 0 #000" }}
          >
            <div className="relative">
              <Selfie
                selfieUrl={selfieUrl}
                emoji={identity.emoji}
                size={130}
                ring="#000"
                shape="square"
              />
              <div className="absolute -bottom-2 -right-3 rotate-12 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow">
                AAAAAA
              </div>
            </div>
          </div>
        </div>

        {/* meme bottom text */}
        <div className="mt-3 text-center">
          <div
            className="font-black uppercase leading-tight text-black"
            style={{
              fontSize: 22,
              WebkitTextStroke: "1.5px #fff",
              textShadow: "3px 3px 0 #fff",
            }}
          >
            "{identity.slogan}"
          </div>
        </div>

        {/* footer chaos */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-[10px] font-black uppercase text-black/80">
              Player
            </div>
            <div className="text-base font-black uppercase text-black">
              {displayName || "Anonymous"}
            </div>
            <div className="text-[11px] font-bold text-black/70">
              {team.flag} {team.name}
            </div>
          </div>
          <div className="text-right">
            <div className="rounded-md bg-black px-2 py-1 text-[10px] font-black uppercase text-yellow-300">
              Screams: {identity.defaultStats[1]?.value ?? "MAX"}
            </div>
            <div className="mt-1 rounded-md bg-black px-2 py-1 text-[10px] font-black uppercase text-yellow-300">
              Tears: GUARANTEED
            </div>
            <div className="mt-1 flex justify-end">
              <StarRow stars={stars} color="#000" />
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
      {/* faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-full flex-col p-6 text-white">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300">
              fangirlfc · v26
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              report · player profile
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[9px] uppercase text-white/40">match form</div>
            <StarRow stars={stars} color="#22d3ee" />
          </div>
        </div>

        {/* identity strip */}
        <div className="mt-5 flex items-center gap-4">
          <Selfie
            selfieUrl={selfieUrl}
            emoji={identity.emoji}
            size={84}
            ring="#22d3ee"
            shape="square"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">
              identity / 06
            </div>
            <div className="mt-0.5 truncate text-[28px] font-black leading-[0.95] tracking-tight text-white">
              {identity.title}
            </div>
            <div className="mt-1 text-xs text-white/60">
              {displayName || "Anonymous"} · {team.flag} {team.name}
            </div>
          </div>
        </div>

        {/* stat bars */}
        <div className="mt-5 flex flex-col gap-3">
          {identity.defaultStats.map((s, i) => {
            const pct = parseStatPercent(s.value, i);
            return (
              <div key={s.label}>
                <div className="flex items-baseline justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    {s.label}
                  </div>
                  <div className="text-xs font-black text-cyan-300">
                    {s.value}
                  </div>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, #22d3ee, #6366f1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* mini chart */}
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/60">
              shot map · last 5
            </div>
            <div className="text-[9px] font-black text-cyan-300">xG 2.34</div>
          </div>
          <div className="mt-2 flex h-12 items-end gap-1">
            {[40, 70, 55, 90, 65, 80, 35, 95, 50, 72].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i % 3 === 0
                      ? "#22d3ee"
                      : "rgba(34,211,238,0.35)",
                }}
              />
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
          <div className="max-w-[200px] text-[11px] italic text-white/70">
            "{identity.slogan}"
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase text-white/40">edition</div>
            <div className="text-xs font-black text-cyan-300">WC '26 · 001</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseStatPercent(value: string, fallbackIdx: number): number {
  const m = value.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1]!, 10);
    if (n > 0 && n <= 100) return n;
  }
  return [78, 88, 92][fallbackIdx % 3]!;
}
