"use client";

import { Swords, Star, Target } from "lucide-react";
import { getTeam } from "@/lib/teams";
import type { RankResult } from "@/lib/leaderboardRank";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  rankResult: RankResult | null;
  hasOfficialCard: boolean;
  onDuelClick: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function positionText(rank: number, percentile: number, total: number): string {
  if (rank === -1 || total === 0) return "Start competing to see your rank";
  if (percentile >= 90)           return "🏆 You're in the top 10% of fans";
  if (percentile >= 50)           return `You're ahead of ${percentile}% of fans`;
  return "You're behind most fans — time to catch up";
}

function rivalName(entry: { officialCardDisplayName?: string | null; displayName?: string }): string {
  return entry.officialCardDisplayName?.trim() || entry.displayName?.trim() || "";
}

function nextGoalText(
  rival: RankResult["rival"],
  rank: number,
): string {
  if (rival) {
    const name = rivalName(rival);
    return name ? `Next goal: pass ${name}` : "Next goal: pass the fan just ahead";
  }
  if (rank === 1) return "Next goal: keep your #1 spot";
  if (rank !== -1) return "Next goal: keep climbing the ranking";
  return "Next goal: save your Fangirl Card and enter the ranking";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DuelSection({ rankResult, hasOfficialCard, onDuelClick }: Props) {
  if (!rankResult) return null;

  const { rank, percentile, total, rival, starsNeeded, nearby } = rankResult;
  const isRanked = rank !== -1;

  // ── No official card — hint only ──
  if (!hasOfficialCard) {
    return (
      <div className="mt-2 rounded-xl bg-white/5 px-3 py-2">
        <p className="text-[11px] text-white/40">
          Save your Fangirl Card to start competing in the ranking
        </p>
      </div>
    );
  }

  const rivalTeam    = rival?.officialTeamCode ? getTeam(rival.officialTeamCode) : null;
  const rivalNameStr = rival ? rivalName(rival) : null;
  const displayRival = rivalNameStr || "A fan";
  const hasRivalName = Boolean(rivalNameStr);

  const duelButtonText = rival ? `Beat ${hasRivalName ? rivalNameStr : "them"} 🚀`
    : isRanked ? "Start climbing 🚀"
    : null;

  return (
    <div className="mt-2 flex flex-col gap-2">

      {/* ── Relative position ── */}
      <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
        <Swords className="h-3.5 w-3.5 shrink-0 text-pink-300/60" />
        <p className="text-[12px] text-white/60">
          {positionText(rank, percentile, total)}
        </p>
      </div>

      {/* ── Rival block — human copy ── */}
      {rival && (
        <div className="rounded-xl border border-pink-300/20 bg-pink-400/8 px-3 py-2.5">
          <p className="text-[12px] font-bold text-white/85">
            {hasRivalName
              ? <><span className="text-pink-200">{rivalNameStr}</span>{rivalTeam ? ` from ${rivalTeam.flag} ${rivalTeam.name}` : ""} is just ahead of you.</>
              : "A fan is just ahead of you."
            }
          </p>
          {starsNeeded > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300/80">
              <Star className="h-2.5 w-2.5 fill-amber-300/60" />
              Only {starsNeeded} ⭐ to pass them.
            </div>
          )}
        </div>
      )}

      {/* ── Duel CTA ── */}
      {duelButtonText && (
        <button
          onClick={onDuelClick}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-pink-300/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-5 py-2.5 text-[13px] font-extrabold text-pink-100 transition hover:from-pink-500/30 hover:to-purple-500/30"
        >
          {duelButtonText}
        </button>
      )}

      {/* ── Micro leaderboard ── */}
      {nearby.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-white/3 px-2 py-1.5">
          {nearby.map(({ rank: r, entry, isUser }) => {
            const team = entry.officialTeamCode ? getTeam(entry.officialTeamCode) : null;
            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] ${
                  isUser
                    ? "bg-pink-400/20 font-extrabold text-pink-100"
                    : "text-white/50"
                }`}
              >
                <span className="w-6 shrink-0 text-right font-bold text-white/30">
                  #{r}
                </span>
                <span className="flex-1 truncate">
                  {isUser ? "You" : (entry.officialCardDisplayName || entry.displayName)}
                </span>
                {team && (
                  <span className="shrink-0 text-[12px]">{team.flag}</span>
                )}
                <div className="flex shrink-0 items-center gap-0.5 text-amber-300/70">
                  <Star className="h-2 w-2 fill-amber-300/50" />
                  <span>{entry.officialStars ?? 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Next goal ── */}
      <div className="flex items-center gap-2 rounded-xl bg-white/4 px-3 py-2">
        <Target className="h-3 w-3 shrink-0 text-emerald-400/60" />
        <p className="text-[11px] text-white/50">
          {nextGoalText(rival, rank)}
        </p>
      </div>

    </div>
  );
}
