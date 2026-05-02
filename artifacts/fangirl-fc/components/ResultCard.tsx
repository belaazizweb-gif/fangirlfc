"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FanIdentity } from "@/types";
import { StarProgress } from "./StarProgress";
import { RarityBadge } from "./RarityBadge";
import {
  awardIdentityStar,
  getIdentityActions,
  getNextHint,
} from "@/lib/stars";
import { unlockIdentity, getUnlocked, totalIdentities } from "@/lib/unlocks";
import { trackEvent } from "@/lib/analytics";
import { showToast } from "@/lib/toast";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { getMatch, matchHeadline, predictionLabel } from "@/lib/matches";
import {
  getPrediction,
  predictionOutcome,
  OUTCOME_LABEL,
  OUTCOME_DRAMA,
} from "@/lib/predictions";
import { rarityHook } from "@/lib/rarity";

interface Props {
  identity: FanIdentity;
  compareToId?: string;
  matchId?: string;
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

export function ResultCard({ identity, compareToId, matchId }: Props) {
  const [stars, setStars] = useState(0.5);
  const [hint, setHint] = useState("");
  const [wasNewUnlock, setWasNewUnlock] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  const match = useMemo(() => (matchId ? getMatch(matchId) : null), [matchId]);
  const [predictionLine, setPredictionLine] = useState<string | null>(null);
  const [predictionOut, setPredictionOut] = useState<{
    label: string;
    drama: string;
    kind: "correct" | "wrong" | "pending";
  } | null>(null);

  useEffect(() => {
    const updated = awardIdentityStar(identity.id, "quiz_completed");
    setStars(updated);
    setHint(getNextHint(updated, getIdentityActions(identity.id)));
    const result = unlockIdentity(identity.id);
    setUnlockedCount(result.list.length);
    if (result.wasNew) {
      setWasNewUnlock(true);
      showToast({
        kind: "unlock",
        title: "New identity unlocked",
        detail: identity.title,
        emoji: identity.emoji,
      });
    }
    trackEvent("quiz_completed", { identityId: identity.id, matchId });
  }, [identity.id, identity.title, identity.emoji, matchId]);

  useEffect(() => {
    if (!match) {
      setPredictionLine(null);
      setPredictionOut(null);
      return;
    }
    const p = getPrediction(match.id);
    if (p) setPredictionLine(predictionLabel(match, p.pick));
    const out = predictionOutcome(match, p);
    setPredictionOut({
      label: OUTCOME_LABEL[out],
      drama: OUTCOME_DRAMA[out],
      kind: out,
    });
  }, [match]);

  const glow = IDENTITY_GLOW[identity.id] ?? IDENTITY_GLOW.chaotic!;
  const totalIds = totalIdentities();
  const remaining = Math.max(0, totalIds - unlockedCount);

  const cardHref =
    `/card?id=${identity.id}` +
    (compareToId ? `&compareTo=${compareToId}` : "") +
    (matchId ? `&matchId=${matchId}` : "");

  return (
    <div className="relative flex flex-col gap-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: glow.backdrop }}
      />

      {/* Matchday context banner */}
      {match && (
        <div className="rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300/15 via-pink-400/10 to-fuchsia-400/10 p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-100">
            ⚽ Matchday
          </div>
          <div className="mt-0.5 text-sm font-black text-white">
            {matchHeadline(match)} {match.flagA}
            {match.flagB}
          </div>
          {predictionLine && (
            <div className="mt-2 flex flex-col gap-0.5 rounded-xl bg-black/25 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-white/55">
                Your prediction
              </div>
              <div className="text-[13px] font-bold text-white">
                🔮 {predictionLine}
              </div>
              {predictionOut && match.status === "completed" && (
                <div
                  className={
                    "mt-0.5 text-[11px] font-extrabold uppercase tracking-wider " +
                    (predictionOut.kind === "correct"
                      ? "text-emerald-200"
                      : "text-rose-200")
                  }
                >
                  {predictionOut.label} · {predictionOut.drama}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* New unlock celebration panel */}
      {wasNewUnlock && (
        <div className="relative overflow-hidden rounded-3xl border border-pink-300/50 bg-gradient-to-br from-pink-500/30 via-fuchsia-500/20 to-amber-300/25 p-4">
          <div className="absolute -right-4 -top-4 text-[80px] leading-none opacity-20">
            {identity.emoji}
          </div>
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 text-xl shadow">
              {identity.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-pink-100">
                ✨ New identity unlocked
              </div>
              <div className="text-base font-black text-white">
                {identity.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Identity card with aura */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-10 rounded-[40px]"
          style={{
            background: glow.halo,
            filter: "blur(40px)",
            opacity: 0.7,
          }}
        />
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
            <div className="flex flex-wrap items-center gap-2">
              <RarityBadge identity={identity} size="md" />
              <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Sparkles className="h-3 w-3" />
                {rarityHook(identity)}
              </span>
            </div>
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
            <div
              className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em]"
              style={{ color: identity.colors.accent, opacity: 0.95 }}
            >
              → {identity.shareTrigger}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <StarProgress
          stars={stars}
          hint={hint || "Next level: share your card"}
        />
      </div>

      {/* Unlock progress + replay */}
      <div className="rounded-2xl border border-pink-300/30 bg-gradient-to-br from-pink-400/15 via-fuchsia-400/10 to-amber-200/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-pink-100">
              Identities unlocked
            </div>
            <div className="mt-0.5 text-lg font-black text-white">
              {unlockedCount}/{totalIds}
            </div>
            <div className="text-[11px] text-white/65">
              {remaining > 0
                ? `${remaining} left to discover · try different answers`
                : "You've unlocked them all. Iconic."}
            </div>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
            <span className="text-lg font-black text-white">
              {Math.round((unlockedCount / totalIds) * 100)}%
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-amber-300 transition-all duration-500"
            style={{ width: `${(unlockedCount / totalIds) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={cardHref}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
        >
          Make my Fangirl Card
          <ArrowRight className="h-4 w-4" />
        </Link>
        {remaining > 0 && (
          <Link
            href={matchId ? `/quiz?matchId=${matchId}` : "/quiz"}
            className="flex items-center justify-center gap-2 rounded-full border border-pink-300/40 bg-pink-400/10 px-6 py-3 text-center text-sm font-bold text-pink-50 hover:bg-pink-400/20"
          >
            <RotateCcw className="h-4 w-4" />
            Try again to unlock another identity
          </Link>
        )}
        <Link
          href="/level"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-white/70 hover:bg-white/10"
        >
          See my fan level
        </Link>
      </div>
    </div>
  );
}
