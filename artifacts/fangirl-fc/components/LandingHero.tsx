"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Heart, Camera, LogIn, ShieldCheck } from "lucide-react";
import { FAN_TYPE_LIST, FAN_TYPES } from "@/lib/fanTypes";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { FanCard } from "./FanCard";
import { UnlockedIdentities } from "./UnlockedIdentities";
import { AuthModal } from "./AuthModal";
import { useAuth } from "./AuthProvider";
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
    rotate: "-rotate-[7deg]",
    z: "z-10",
    translate: "translate-x-6 translate-y-6",
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
    rotate: "rotate-[7deg]",
    z: "z-10",
    translate: "-translate-x-6 translate-y-6",
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

const STEPS = [
  {
    n: "1",
    emoji: "🎯",
    title: "Take the quiz",
    copy: "5 questions to find your football fan personality.",
    tint: "from-pink-400/30 to-rose-400/10",
    href: "/quiz",
  },
  {
    n: "2",
    emoji: "🃏",
    title: "Create your Fan Card",
    copy: "Turn your result into a card with your photo and team.",
    tint: "from-fuchsia-400/30 to-violet-400/10",
    href: null,
  },
  {
    n: "3",
    emoji: "✨",
    title: "Sign in to make it official",
    copy: "Save your card, keep your stars, and unlock your full profile.",
    tint: "from-violet-400/30 to-indigo-400/10",
    href: null,
    isSignIn: true,
  },
  {
    n: "4",
    emoji: "🧠",
    title: "Learn football with Football IQ",
    copy: "Answer 2 daily questions and level up your knowledge.",
    tint: "from-indigo-400/30 to-purple-400/10",
    href: "/football-iq",
  },
  {
    n: "5",
    emoji: "⚽",
    title: "Play Penalty Queen & upgrade",
    copy: "Score penalties, unlock badges, and share your upgraded card.",
    tint: "from-amber-300/30 to-orange-400/10",
    href: "/penalty",
  },
];

export function LandingHero() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          <h1 className="mt-5 text-[38px] font-black leading-[0.95] tracking-tight">
            Get World Cup{" "}
            <span className="gradient-text">Ready</span>
          </h1>
          <p className="mt-2 text-[22px] font-black leading-tight tracking-tight text-white/90">
            Find your Fangirl Type
          </p>
          <p className="mt-3 px-4 text-[15px] leading-snug text-white/80">
            Take the quiz, create your Fan Card, learn football, play Penalty Queen, and upgrade your level.
          </p>
        </div>

        {/* Card preview label */}
        <p className="mt-6 text-center text-[11px] font-semibold text-white/40 uppercase tracking-[0.22em]">
          Your result will look like this 👇
        </p>

        {/* Real big card previews — fanned */}
        <div className="relative mt-3 flex h-[300px] items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-2 -z-10 mx-auto h-[260px] w-[80%] rounded-[40px] bg-gradient-to-br from-pink-400/40 via-fuchsia-400/20 to-amber-300/30 blur-3xl"
          />
          <div className="flex items-center justify-center gap-0">
            {HERO_PREVIEWS.map((p, i) => (
              <div
                key={p.identityId}
                style={{ marginLeft: i === 0 ? 0 : -14 }}
                className="drop-shadow-[0_24px_36px_rgba(255,77,191,0.3)]"
              >
                <HeroCard preview={p} />
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2.5">
          {/* Primary CTA */}
          <Link
            href="/quiz"
            className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
          >
            Start free — Take the quiz
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Sign In CTA — only shown to guests */}
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-400/10 px-6 py-3 text-[13px] font-bold text-violet-200 backdrop-blur transition hover:bg-violet-400/20"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in to save my official card
            </button>
          )}

          {/* Already played — visually tertiary */}
          <Link
            href="/card?id=princess"
            className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-[11px] font-semibold text-white/40 backdrop-blur transition hover:bg-white/10 hover:text-white/60"
          >
            <Camera className="h-3 w-3" />
            Already played? Continue to my card
          </Link>

          {/* Trust / friction line */}
          <p className="mt-0.5 text-center text-[11px] text-white/45">
            No signup &nbsp;·&nbsp; 5 football questions &nbsp;·&nbsp; Just for fun
          </p>
        </div>
      </section>

      {/* ---------------- MAKE IT OFFICIAL BOX ---------------- */}
      {!user && (
        <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-500/15 via-fuchsia-400/10 to-indigo-400/10 p-5">
          <div className="absolute -right-4 -top-4 text-[90px] leading-none opacity-[0.07]">
            ✨
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-400/20">
              <ShieldCheck className="h-4 w-4 text-violet-300" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-black text-white">Make it official</p>
              <p className="mt-1 text-[12.5px] leading-snug text-white/65">
                You can play first. Sign in when you want to save your official card, keep your stars, and share your progress.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-3 flex items-center gap-1.5 rounded-full bg-violet-500/25 px-4 py-2 text-[12px] font-bold text-violet-200 transition hover:bg-violet-500/35"
              >
                <LogIn className="h-3 w-3" />
                Sign in to save progress
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- TAGLINE / SOCIAL FEEL ---------------- */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-pink-400/20 via-fuchsia-400/10 to-amber-200/20 p-6 text-center">
        <div className="absolute -right-6 -top-6 text-[110px] leading-none opacity-10">
          💖
        </div>
        <div className="absolute -left-6 -bottom-6 text-[110px] leading-none opacity-10">
          ⚽
        </div>
        <p className="relative text-[16px] font-bold leading-snug text-white/95">
          Made for girls turning football into{" "}
          <span className="gradient-text">vibes, drama, predictions,</span> and
          memories.
        </p>
      </section>

      {/* ---------------- IDENTITY PREVIEW — moved above How It Works ---------------- */}
      <section>
        <div className="mb-3 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
            {FAN_TYPE_LIST.length} fan identities
          </div>
          <div className="mt-1 text-[18px] font-black tracking-tight">
            Which fangirl type are you?
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
                href="/quiz"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-2xl shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)]">
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
        {/* Quiz nudge below the grid */}
        <Link
          href="/quiz"
          className="mt-4 flex items-center justify-center gap-2 rounded-full border border-pink-300/30 bg-pink-400/10 px-5 py-2.5 text-[13px] font-bold text-pink-100 transition hover:bg-pink-400/20"
        >
          Take the quiz to find yours <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* ---------------- HOW IT WORKS — 5-step flow ---------------- */}
      <section>
        <div className="mb-4 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
            How Fangirl FC works
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${s.tint} p-4 backdrop-blur`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-sm font-black text-rose-600 shadow">
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-[15px] font-bold text-white">
                    <span>{s.emoji}</span>
                    <span>{s.title}</span>
                  </div>
                  <div className="text-[12.5px] leading-snug text-white/70">
                    {s.copy}
                  </div>
                </div>
                {s.isSignIn && !user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 hover:bg-white/20"
                  >
                    Sign in →
                  </button>
                ) : s.href ? (
                  <Link
                    href={s.href}
                    className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 hover:bg-white/20"
                  >
                    Start →
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- UNLOCKED IDENTITIES — lower, with context ---------------- */}
      <section>
        <p className="mb-2 text-center text-[11px] text-white/35">
          Take the quiz to start unlocking fan identities.
        </p>
        <UnlockedIdentities />
      </section>

      {/* ---------------- REVIEWS ---------------- */}
      <section>
        <div className="mb-4 text-center">
          <div className="mt-1 text-[18px] font-black tracking-tight">
            What girls are saying 💬
          </div>
        </div>
        {/* Horizontal scroll — bleed to screen edges */}
        <div className="-mx-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 px-4" style={{ width: "max-content" }}>
            {[
              {
                name: "Chloe",
                flag: "🇫🇷",
                handle: "@chloe.fc",
                photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face&auto=format",
                stars: 5,
                text: "I sent my card to my bestie and she immediately said 'that is SO you'. The Loyal Queen identity is literally me, I cried a little.",
                identity: "Loyal Queen",
                grad: "from-violet-500/30 to-pink-500/10",
              },
              {
                name: "Sofia",
                flag: "🇧🇷",
                handle: "@sofiinha",
                photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face&auto=format",
                stars: 5,
                text: "The quiz is too accurate. I answered honestly and got Soft Girl and yeah... I do watch matches just to cry during the anthem.",
                identity: "Soft Fan",
                grad: "from-rose-500/30 to-amber-300/10",
              },
              {
                name: "Jade",
                flag: "🇬🇧",
                handle: "@jade_wc26",
                photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face&auto=format",
                stars: 5,
                text: "Showed my card at the watch party and now everyone wants one. This better be the year England finally wins something.",
                identity: "Chaotic Fan",
                grad: "from-pink-500/30 to-fuchsia-500/10",
              },
              {
                name: "Emma",
                flag: "🇩🇪",
                handle: "@emma.fangirl",
                photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face&auto=format",
                stars: 5,
                text: "Love that it's finally something made for us. Not the 'football for girls 🙄' kind — actually made by someone who gets it.",
                identity: "Matchday Princess",
                grad: "from-amber-400/30 to-pink-400/10",
              },
              {
                name: "Valentina",
                flag: "🇮🇹",
                handle: "@vale_calcio",
                photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face&auto=format",
                stars: 5,
                text: "My boyfriend doesn't understand why I need a fan card for the World Cup. I sent it to him anyway. He gets it now.",
                identity: "Tactical Girl",
                grad: "from-emerald-400/20 to-fuchsia-400/10",
              },
            ].map((r) => (
              <div
                key={r.handle}
                className={`relative w-[240px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${r.grad} p-4 backdrop-blur`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={r.photo}
                    alt={r.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] font-extrabold text-white leading-none">{r.name}</span>
                      <span className="text-[11px]">{r.flag}</span>
                    </div>
                    <div className="text-[10px] text-white/40 leading-none mt-0.5">{r.handle}</div>
                  </div>
                </div>
                <div className="mt-2.5 flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <span key={i} className="text-[10px]">⭐</span>
                  ))}
                </div>
                <p className="mt-2 text-[12px] leading-snug text-white/80">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="mt-3 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">
                  {r.identity}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-white/25">swipe to see more →</p>
      </section>

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

      {/* Auth modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
