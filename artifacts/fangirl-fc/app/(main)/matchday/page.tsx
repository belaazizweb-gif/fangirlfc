"use client";

import { useEffect } from "react";
import { MATCHES } from "@/lib/matches";
import { MatchCard } from "@/components/MatchCard";
import { trackEvent } from "@/lib/analytics";

export default function MatchdayPage() {
  useEffect(() => {
    trackEvent("matchday_opened");
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">Matchday Mode</h1>
        <p className="mt-1 text-sm text-white/60">
          Pick today's match and get your matchday fan identity.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[11px] text-amber-100">
        ✨ Each match gets its own quiz, prediction, and matchday card.
      </div>

      <div className="flex flex-col gap-3">
        {MATCHES.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            onPlay={(match) =>
              trackEvent("match_selected", {
                matchId: match.id,
                status: match.status,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
