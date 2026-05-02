"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Share2, Camera } from "lucide-react";
import { FAN_TYPE_LIST, FAN_TYPES } from "@/lib/fanTypes";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { FanCard } from "./FanCard";
import { UnlockedIdentities } from "./UnlockedIdentities";
import type { FanIdentityId } from "@/types";

const HERO_PREVIEWS: Array<{
  identityId: FanIdentityId;
  templateId: string;
  name: string;
  team: { code: string; name: string; flag: string };
  rotate: string;
  z: string;
  translate: string;
}> = [
  {
    identityId: "soft",
    templateId: "soft-girl",
    name: "Maya",
    team: { code: "BRA", name: "Brazil", flag: "🇧🇷" },
    rotate: "-rotate-[10deg]",
    z: "z-10",
    translate: "translate-x-3 translate-y-6",
  },
  {
    identityId: "chaotic",
    templateId: "chaotic-neon",
    name: "Lex",
    team: { code: "ESP", name: "Spain", flag: "🇪🇸" },
    rotate: "rotate-0",
    z: "z-30",
    translate: "translate-y-0",
  },
  {
    identityId: "loyal",
    templateId: "loyal-queen",
    name: "Sana",
    team: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
    rotate: "rotate-[10deg]",
    z: "z-10",
    translate: "-translate-x-3 translate-y-6",
  },
];

const PREVIEW_SCALE = 0.38;
const CARD_W = 360;
const CARD_H = 640;
const SCALED_W = CARD_W * PREVIEW_SCALE;
const SCALED_H = CARD_H * PREVIEW_SCALE;

function HeroCard({ preview }: { preview: (typeof HERO_PREVIEWS)[number] }) {
  const identity = FAN_TYPES[preview.identityId];
  const template = getTemplate(preview.templateId);
  return (
    <div
      className={`relative ${preview.rotate} ${preview.z} ${preview.translate}`}
      style={{ width: SCALED_W, height: SCALED_H }}
    >
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: "top left",
        }}
      >
        <FanCard
          identity={identity}
          team={preview.team}
          template={template}
          displayName={preview.name}
          selfieUrl={null}
          stars={3.5}
        />
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="flex flex-col gap-10">
      {/* ---------------- HERO ---------------- */}
      <section className="relative -mx-4 overflow-hidden rounded-b-[40px] px-4 pb-10 pt-2">
        {/* Glossy gradient background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 0%, rgba(255,182,217,0.55) 0%, rgba(255,182,217,0) 55%), radial-gradient(120% 70% at 100% 30%, rgba(246,196,83,0.35) 0%, rgba(246,196,83,0) 55%), radial-gradient(120% 70% at 0% 50%, rgba(183,148,255,0.45) 0%, rgba(183,148,255,0) 55%), linear-gradient(180deg, #1a0c25 0%, #0b0613 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.25), transparent 70%) 50% 8%/220px 220px no-repeat",
          }}
        />

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur">
            <Sparkles className="h-3 w-3" /> World Cup 2026 · for the girls
          </span>
          <h1 className="mt-5 text-[40px] font-black leading-[0.95] tracking-tight">
            Find your{" "}
            <span className="gradient-text">World Cup fan personality</span>
          </h1>
          <p className="mt-3 px-4 text-[15px] leading-snug text-white/85">
            Take the quiz. Get your Fangirl Card. Send it to your bestie.
          </p>
        </div>

        {/* Real big card previews — fanned */}
        <div className="relative mt-8 flex h-[300px] items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-2 -z-10 mx-auto h-[260px] w-[80%] rounded-[40px] bg-gradient-to-br from-pink-400/40 via-fuchsia-400/20 to-amber-300/30 blur-3xl"
          />
          <div className="flex items-center justify-center gap-0">
            {HERO_PREVIEWS.map((p, i) => (
              <div
                key={p.identityId}
                style={{ marginLeft: i === 0 ? 0 : -22 }}
                className="drop-shadow-[0_24px_36px_rgba(255,77,191,0.3)]"
              >
                <HeroCard preview={p} />
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/quiz"
            className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
          >
            Find my fan type
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/card?id=princess"
            className="flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <Camera className="h-4 w-4" /> Make my card
          </Link>
          <p className="mt-1 text-center text-[11px] text-white/60">
            5 questions · 60 seconds · no signup
          </p>
        </div>
      </section>

      {/* ---------------- TAGLINE / SOCIAL FEEL ---------------- */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-pink-400/20 via-fuchsia-400/10 to-amber-200/20 p-6 text-center">
        <div className="absolute -right-6 -top-6 text-[110px] leading-none opacity-10">
          💖
        </div>
        <div className="absolute -left-6 -bottom-6 text-[110px] leading-none opacity-10">
          ⚽
        </div>
        <p className="relative text-[16px] font-bold leading-snug text-white/95">
          Made for girls who watch football for the{" "}
          <span className="gradient-text">vibes, the drama,</span> and the
          memories.
        </p>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section>
        <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
          How it works
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            {
              n: "1",
              title: "Answer 5 questions",
              copy: "Tell us how you really watch football.",
              tint: "from-pink-400/30 to-rose-400/10",
            },
            {
              n: "2",
              title: "Unlock your fan identity",
              copy: "Get your card with vibes, slogan, and a rare drop.",
              tint: "from-fuchsia-400/30 to-violet-400/10",
            },
            {
              n: "3",
              title: "Share & compare with your bestie",
              copy: "Send your card. See if you're a power duo.",
              tint: "from-amber-300/30 to-pink-300/10",
            },
          ].map((s) => (
            <div
              key={s.n}
              className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${s.tint} p-4 backdrop-blur`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-sm font-black text-rose-600 shadow">
                  {s.n}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-white">
                    {s.title}
                  </div>
                  <div className="text-[12.5px] leading-snug text-white/70">
                    {s.copy}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- IDENTITY PREVIEW ---------------- */}
      <section>
        <div className="mb-3 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
            6 fan identities
          </div>
          <div className="mt-1 text-[18px] font-black tracking-tight">
            Which one are you?
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FAN_TYPE_LIST.map((f) => {
            const t = getTemplate(
              {
                soft: "soft-girl",
                chaotic: "chaotic-neon",
                loyal: "loyal-queen",
                princess: "matchday-princess",
                screamer: "last-minute-screamer",
                tactical: "tactical-girl",
              }[f.id] ?? "soft-girl",
            );
            return (
              <Link
                key={f.id}
                href={`/card?id=${f.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/15 p-3.5 transition active:scale-[0.98]"
                style={{ background: t.background }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 mix-blend-overlay"
                />
                <div
                  className="absolute -right-3 -top-3 text-[68px] leading-none opacity-25"
                  aria-hidden
                >
                  {f.emoji}
                </div>
                <div className="relative">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-2xl shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)]"
                  >
                    {f.emoji}
                  </div>
                  <div
                    className="mt-3 text-[15px] font-black leading-tight"
                    style={{ color: t.text }}
                  >
                    {f.title}
                  </div>
                  <div
                    className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug"
                    style={{ color: t.text, opacity: 0.78 }}
                  >
                    {f.slogan}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Unlocked identities (only shows if user has any) */}
      <UnlockedIdentities />

      {/* ---------------- STICKER TEASER (subtle) ---------------- */}
      <section className="text-center">
        <Link
          href="/stickers"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:bg-white/10"
        >
          <Heart className="h-3 w-3 text-pink-300" />
          Sticker tracker · coming soon
        </Link>
      </section>
    </div>
  );
}
