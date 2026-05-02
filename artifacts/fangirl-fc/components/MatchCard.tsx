"use client";

import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import type { Match } from "@/types";
import { winnerName } from "@/lib/matches";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<
  Match["status"],
  { dot: string; label: string; pillBg: string }
> = {
  upcoming: {
    dot: "bg-amber-300",
    label: "Upcoming",
    pillBg: "bg-amber-300/15 text-amber-100 border-amber-300/30",
  },
  live: {
    dot: "bg-rose-400 animate-pulse",
    label: "Live now",
    pillBg: "bg-rose-400/15 text-rose-100 border-rose-300/40",
  },
  completed: {
    dot: "bg-white/40",
    label: "Final",
    pillBg: "bg-white/10 text-white/70 border-white/15",
  },
};

interface Props {
  match: Match;
  onPlay?: (match: Match) => void;
}

export function MatchCard({ match, onPlay }: Props) {
  const status = STATUS_STYLES[match.status];

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between px-4 pt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
            status.pillBg,
          )}
        >
          {match.status === "live" ? (
            <Radio className="h-3 w-3" />
          ) : (
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          )}
          {status.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          {match.dateLabel} · {match.city}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4">
        <TeamBlock flag={match.flagA} name={match.teamA} align="left" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold text-white/45">VS</span>
          {match.status === "completed" && match.result && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80">
              {winnerName(match)}
            </span>
          )}
        </div>
        <TeamBlock flag={match.flagB} name={match.teamB} align="right" />
      </div>

      <Link
        href={`/quiz?matchId=${match.id}`}
        onClick={() => onPlay?.(match)}
        className="flex items-center justify-center gap-1.5 border-t border-white/10 bg-gradient-to-r from-pink-500/25 to-fuchsia-500/25 py-3 text-sm font-bold text-pink-50 transition hover:from-pink-500/35 hover:to-fuchsia-500/35"
      >
        Play this match
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function TeamBlock({
  flag,
  name,
  align,
}: {
  flag: string;
  name: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "left" ? "items-start" : "items-end",
      )}
    >
      <span className="text-3xl leading-none">{flag}</span>
      <span className="text-sm font-black leading-tight text-white">
        {name}
      </span>
    </div>
  );
}
