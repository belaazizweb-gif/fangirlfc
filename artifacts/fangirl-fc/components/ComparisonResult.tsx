"use client";

import Link from "next/link";
import { forwardRef, useRef, useState } from "react";
import { Download } from "lucide-react";
import type { FanIdentity, ShareMode, Team } from "@/types";
import { exportNodeAsPng } from "@/lib/exportImage";
import { getShareMode, pickModeLabel } from "@/lib/shareModes";

interface Side {
  identity: FanIdentity;
  team: Team;
  displayName: string;
  stars: number;
}

interface Props {
  friend: Side;
  you?: Side | null;
  mode?: ShareMode;
}

function compatibility(a: string, b: string, mode: ShareMode): {
  score: number;
  quip: string;
  label: string;
} {
  const key = [a, b].sort().join("_");
  let score = 60;
  let quip = "Different vibes, same passion.";
  if (a === b) {
    score = 95;
    quip = "Twin energy. You'd survive a penalty shootout together.";
  } else if (key === "chaotic_screamer") {
    score = 90;
    quip = "Loud + louder = neighbours hate you both.";
  } else if (key === "loyal_tactical") {
    score = 88;
    quip = "Brain trust. You'd actually win a fantasy league.";
  } else if (key === "princess_soft") {
    score = 84;
    quip = "Aesthetic + feelings. Matchday brunch dream team.";
  } else if (key === "chaotic_tactical") {
    score = 55;
    quip = "She's analysing xG. You're flipping the table.";
  } else if (key === "loyal_princess") {
    score = 70;
    quip = "Ride or die meets ring light. Surprisingly iconic.";
  } else if (key === "screamer_soft") {
    score = 78;
    quip = "Tears in stereo. Take care of each other.";
  } else if (key === "chaotic_loyal") {
    score = 72;
    quip = "Drama queen meets ride or die. Iconic combo.";
  }
  return { score, quip, label: pickModeLabel(mode, a, b) };
}

interface CompareCardProps {
  friend: Side;
  you: Side;
  score: number;
  label: string;
}

const CompareCard = forwardRef<HTMLDivElement, CompareCardProps>(
  function CompareCard({ friend, you, score, label }, ref) {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[36px] p-6"
        style={{
          width: 360,
          height: 640,
          background:
            "linear-gradient(160deg, #2a0a3a 0%, #571c5b 45%, #ff4dbf 100%)",
          boxShadow:
            "0 30px 80px -30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 35%)",
            mixBlendMode: "overlay",
          }}
        />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-pink-200">
              Fangirl FC · Compare
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              WC '26
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[friend, you].map((side, i) => (
              <div
                key={i}
                className="rounded-2xl bg-black/30 p-3 text-center backdrop-blur"
              >
                <div className="text-4xl">{side.identity.emoji}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-pink-200/80">
                  {i === 0 ? "Friend" : "You"}
                </div>
                <div className="mt-0.5 truncate text-sm font-black text-white">
                  {side.displayName}
                </div>
                <div className="text-[10px] text-white/70">
                  {side.team.flag} {side.team.name}
                </div>
                <div className="mt-2 text-xs font-bold text-pink-100">
                  {side.identity.title}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center rounded-3xl bg-white/10 p-5 text-center backdrop-blur">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-100">
              Compatibility
            </div>
            <div className="mt-1 text-6xl font-black text-white drop-shadow">
              {score}
              <span className="text-3xl text-white/60">%</span>
            </div>
            <div className="mt-2 rounded-full bg-pink-400/20 px-3 py-1 text-xs font-bold text-pink-100">
              {label}
            </div>
          </div>
          <div className="mt-auto pt-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-pink-200/80">
            fangirlfc · take the quiz
          </div>
        </div>
      </div>
    );
  },
);

export function ComparisonResult({ friend, you, mode = "public" }: Props) {
  const meta = getShareMode(mode);
  const compat = you ? compatibility(friend.identity.id, you.identity.id, mode) : null;
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await exportNodeAsPng(cardRef.current, "fangirl-fc-compare.png");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-400/15 via-fuchsia-400/10 to-amber-200/10 p-5 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-100">
          {meta.emoji} {meta.label} mode
        </div>
        <h1 className="mt-3 text-[22px] font-black leading-tight text-white">
          {meta.compareHeadline(friend.identity.title)}
        </h1>
      </div>

      <div className="glass rounded-3xl p-5 text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">
          Your friend's fan card
        </div>
        <div className="mt-3 text-5xl">{friend.identity.emoji}</div>
        <div className="mt-2 text-2xl font-black gradient-text">
          {friend.identity.title}
        </div>
        <div className="mt-1 text-sm text-white/70">
          {friend.displayName} · {friend.team.flag} {friend.team.name}
        </div>
        <p className="mt-3 text-sm italic text-white/70">
          "{friend.identity.slogan}"
        </p>
      </div>

      {!you ? (
        <Link
          href={`/quiz?compareTo=${encodeURIComponent(friend.displayName)}&mode=${mode}`}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
        >
          Take the quiz, see if you match
        </Link>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                Them
              </div>
              <div className="mt-1 text-3xl">{friend.identity.emoji}</div>
              <div className="mt-1 text-sm font-black text-white">
                {friend.identity.title}
              </div>
            </div>
            <div className="rounded-3xl border border-pink-400/40 bg-pink-400/10 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-pink-100/80">
                You
              </div>
              <div className="mt-1 text-3xl">{you.identity.emoji}</div>
              <div className="mt-1 text-sm font-black text-white">
                {you.identity.title}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-400/40 bg-gradient-to-br from-pink-400/15 via-fuchsia-400/10 to-amber-200/10 p-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.25em] text-pink-100/80">
              Compatibility
            </div>
            <div className="mt-1 text-6xl font-black text-white">
              {compat!.score}
              <span className="text-2xl text-white/60">%</span>
            </div>
            <div className="mt-2 inline-block rounded-full bg-pink-400/25 px-3 py-1 text-xs font-bold text-pink-50">
              {compat!.label}
            </div>
            <p className="mt-3 text-sm text-white/85">{compat!.quip}</p>
          </div>

          {/* Off-screen exportable card */}
          <div className="pointer-events-none fixed -left-[9999px] top-0">
            <CompareCard
              ref={cardRef}
              friend={friend}
              you={you}
              score={compat!.score}
              label={compat!.label}
            />
          </div>

          <button
            onClick={handleExport}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy ? "Saving…" : "Download comparison card"}
          </button>
        </>
      )}

      <Link
        href="/"
        className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-white/70 hover:bg-white/10"
      >
        Make my own card
      </Link>
    </div>
  );
}
