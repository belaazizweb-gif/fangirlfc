"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FanIdentity } from "@/types";
import { StarProgress } from "./StarProgress";
import { awardStar, getNextHint, snapshot } from "@/lib/stars";
import { unlockIdentity } from "@/lib/unlocks";
import { trackEvent } from "@/lib/analytics";
import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  identity: FanIdentity;
  compareToId?: string;
}

const IDENTITY_GLOW: Record<string, { backdrop: string; cardShadow: string; halo: string }> = {
  chaotic: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(168,85,247,0.30) 0%, rgba(217,70,239,0.15) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(168,85,247,0.65), 0 30px 80px -30px rgba(217,70,239,0.55)",
    halo: "rgba(168,85,247,0.45)",
  },
  loyal: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(251,191,36,0.28) 0%, rgba(245,158,11,0.14) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(251,191,36,0.60), 0 30px 80px -30px rgba(245,158,11,0.50)",
    halo: "rgba(251,191,36,0.40)",
  },
  soft: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(244,114,182,0.28) 0%, rgba(232,121,249,0.14) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(244,114,182,0.60), 0 30px 80px -30px rgba(244,114,182,0.45)",
    halo: "rgba(244,114,182,0.40)",
  },
  princess: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(244,63,94,0.28) 0%, rgba(251,113,133,0.14) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(244,63,94,0.58), 0 30px 80px -30px rgba(251,113,133,0.45)",
    halo: "rgba(244,63,94,0.38)",
  },
  screamer: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(251,146,60,0.28) 0%, rgba(239,68,68,0.14) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(251,146,60,0.60), 0 30px 80px -30px rgba(239,68,68,0.45)",
    halo: "rgba(251,146,60,0.40)",
  },
  tactical: {
    backdrop:
      "radial-gradient(ellipse 95% 55% at 50% 10%, rgba(34,211,238,0.22) 0%, rgba(6,182,212,0.12) 45%, transparent 70%)",
    cardShadow:
      "0 0 90px -8px rgba(34,211,238,0.50), 0 30px 80px -30px rgba(6,182,212,0.40)",
    halo: "rgba(34,211,238,0.35)",
  },
};

export function ResultCard({ identity, compareToId }: Props) {
  const [stars, setStars] = useState(0.5);
  const [hint, setHint] = useState("");

  useEffect(() => {
    const updated = awardStar("quiz_completed");
    setStars(updated);
    const snap = snapshot();
    setHint(getNextHint(updated, snap.actions));
    unlockIdentity(identity.id);
    trackEvent("quiz_completed", { identityId: identity.id });
  }, [identity.id]);

  const glow = IDENTITY_GLOW[identity.id] ?? IDENTITY_GLOW.chaotic!;

  return (
    <div className="relative flex flex-col gap-6">
      {/* Full-page identity glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: glow.backdrop }}
      />

      {/* Identity card with aura */}
      <div className="relative">
        {/* Blurred halo behind card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-10 rounded-[40px]"
          style={{
            background: glow.halo,
            filter: "blur(40px)",
            opacity: 0.7,
          }}
        />
        {/* Soft shimmer highlight ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[3px] -z-10 rounded-[30px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 50%, rgba(255,255,255,0.10) 100%)",
          }}
        />

        <div
          className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${identity.colors.bg} p-6`}
          style={{ boxShadow: glow.cardShadow }}
        >
          <div className="absolute -right-12 -top-12 text-[160px] opacity-20">
            {identity.emoji}
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3" />
              {identity.rarity}
            </span>
            <h1
              className="mt-4 text-4xl font-black leading-tight"
              style={{ color: identity.colors.text }}
            >
              {identity.title}
            </h1>
            <p
              className="mt-2 text-base font-semibold italic"
              style={{ color: identity.colors.text, opacity: 0.85 }}
            >
              "{identity.slogan}"
            </p>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: identity.colors.text, opacity: 0.85 }}
            >
              {identity.description}
            </p>
            <ul className="mt-5 flex flex-col gap-1.5">
              {identity.vibes.map((v) => (
                <li
                  key={v}
                  className="flex gap-2 text-sm font-medium leading-snug"
                  style={{ color: identity.colors.text, opacity: 0.92 }}
                >
                  <span
                    className="font-black"
                    style={{ color: identity.colors.accent }}
                  >
                    —
                  </span>
                  <span className="flex-1">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <StarProgress
          stars={stars}
          hint={hint || "Next level: share your card"}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={`/card?id=${identity.id}${compareToId ? `&compareTo=${compareToId}` : ""}`}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
        >
          Make my Fangirl Card
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/quiz"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-white/70 hover:bg-white/10"
        >
          Retake the quiz
        </Link>
      </div>
    </div>
  );
}
