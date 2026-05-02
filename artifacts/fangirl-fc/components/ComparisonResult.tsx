"use client";

import Link from "next/link";
import type { FanIdentity, Team } from "@/types";

interface Side {
  identity: FanIdentity;
  team: Team;
  displayName: string;
  stars: number;
}

interface Props {
  friend: Side;
  you?: Side | null;
}

const COMPAT: Record<string, Record<string, { score: number; quip: string }>> = {};
function compatibility(a: string, b: string): { score: number; quip: string } {
  const key = [a, b].sort().join("-");
  if (COMPAT[a]?.[b]) return COMPAT[a]![b]!;
  let score = 60;
  let quip = "Different vibes, same passion.";
  if (a === b) {
    score = 95;
    quip = "Twin energy. You'd survive a penalty shootout together.";
  } else if (
    (a === "chaotic" && b === "screamer") ||
    (a === "screamer" && b === "chaotic")
  ) {
    score = 90;
    quip = "Loud + louder = neighbours hate you both.";
  } else if (
    (a === "loyal" && b === "tactical") ||
    (a === "tactical" && b === "loyal")
  ) {
    score = 88;
    quip = "Brain trust. You'd actually win a fantasy league.";
  } else if (
    (a === "soft" && b === "princess") ||
    (a === "princess" && b === "soft")
  ) {
    score = 84;
    quip = "Aesthetic + feelings. The matchday brunch dream team.";
  } else if (
    (a === "tactical" && b === "chaotic") ||
    (a === "chaotic" && b === "tactical")
  ) {
    score = 55;
    quip = "She's analysing xG. You're flipping the table.";
  } else if (
    (a === "loyal" && b === "princess") ||
    (a === "princess" && b === "loyal")
  ) {
    score = 70;
    quip = "Ride or die meets ring light. Surprisingly iconic.";
  }
  return { score, quip };
}

export function ComparisonResult({ friend, you }: Props) {
  const compat = you ? compatibility(friend.identity.id, you.identity.id) : null;

  return (
    <div className="flex flex-col gap-5">
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
          href={`/quiz?compareTo=${encodeURIComponent(friend.displayName)}`}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base"
        >
          Take the quiz, see if you match
        </Link>
      ) : (
        <>
          <div className="glass rounded-3xl p-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">
              You
            </div>
            <div className="mt-3 text-4xl">{you.identity.emoji}</div>
            <div className="mt-1 text-xl font-black gradient-text">
              {you.identity.title}
            </div>
          </div>
          <div className="rounded-3xl border border-pink-400/40 bg-pink-400/10 p-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.25em] text-pink-200/80">
              Compatibility
            </div>
            <div className="mt-1 text-5xl font-black text-white">
              {compat!.score}
              <span className="text-2xl text-white/60">%</span>
            </div>
            <p className="mt-2 text-sm text-white/80">{compat!.quip}</p>
          </div>
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
