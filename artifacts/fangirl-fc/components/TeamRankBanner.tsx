"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { fetchTeamRankings, getTeamRank } from "@/lib/teamRank";
import { getTeam } from "@/lib/teams";

interface Props {
  officialTeamCode: string | null;
  officialStars: number;
  onRankLoaded?: (rank: number | null) => void;
}

function rankLine(rank: number, flag: string, name: string): string {
  if (rank === 1) return `🔥 ${flag} ${name} is #1 worldwide 🥇`;
  if (rank <= 3)  return `🔥 ${flag} ${name} is #${rank} — almost #1`;
  if (rank <= 10) return `${flag} ${name} is #${rank} — help it climb`;
  return `${flag} ${name} is #${rank} — needs your help`;
}

export function TeamRankBanner({ officialTeamCode, officialStars, onRankLoaded }: Props) {
  // Stable ref so we never need onRankLoaded in the effect dep array
  const callbackRef = useRef(onRankLoaded);
  callbackRef.current = onRankLoaded;

  const fetchedFor  = useRef<string | null>(null);
  const rankRef     = useRef<number | null | "pending">("pending");
  const mountedRef  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!officialTeamCode) {
      rankRef.current = null;
      callbackRef.current?.(null);
      fetchedFor.current = null;
      return;
    }
    if (fetchedFor.current === officialTeamCode) return;
    fetchedFor.current = officialTeamCode;

    fetchTeamRankings().then((entries) => {
      if (!mountedRef.current) return;
      const r = getTeamRank(entries, officialTeamCode);
      rankRef.current = r;
      callbackRef.current?.(r);
    });
  }, [officialTeamCode]);

  const team = officialTeamCode ? getTeam(officialTeamCode) : null;

  // ── No team ──
  if (!officialTeamCode) {
    return (
      <p className="mt-2 text-center text-[11px] text-white/35">
        🌍 Join a team to compete globally
      </p>
    );
  }

  // ── Team set but rank not yet resolved — render nothing to avoid flash ──
  if (rankRef.current === "pending") return null;

  const rank    = rankRef.current;
  const flag    = team?.flag ?? "";
  const name    = team?.name ?? officialTeamCode;
  const isTop3  = rank !== null && rank <= 3;

  return (
    <div
      className={`mt-2 flex flex-col gap-1 rounded-xl px-3 py-2 ${
        isTop3 ? "bg-amber-400/15" : "bg-white/5"
      }`}
    >
      <p className={`text-[12px] font-bold ${isTop3 ? "text-amber-200" : "text-white/65"}`}>
        {rank !== null
          ? rankLine(rank, flag, name)
          : `${flag} ${name} — every fan counts`}
      </p>
      {officialStars > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-white/45">
          <Star className="h-2.5 w-2.5 fill-amber-300/60 text-amber-300/60" />
          You contributed +{officialStars} ⭐ to {name}
        </div>
      )}
    </div>
  );
}
