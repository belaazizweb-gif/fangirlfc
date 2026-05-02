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

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${identity.colors.bg} p-6 shadow-[0_30px_80px_-30px_rgba(255,77,191,0.6)]`}
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
          <dl className="mt-5 grid grid-cols-3 gap-2">
            {identity.defaultStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-black/25 px-2 py-2 text-center backdrop-blur"
              >
                <dt
                  className="text-[9px] font-medium uppercase tracking-wider"
                  style={{ color: identity.colors.text, opacity: 0.7 }}
                >
                  {s.label}
                </dt>
                <dd
                  className="mt-0.5 text-sm font-extrabold"
                  style={{ color: identity.colors.text }}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <StarProgress stars={stars} hint={hint} />
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
