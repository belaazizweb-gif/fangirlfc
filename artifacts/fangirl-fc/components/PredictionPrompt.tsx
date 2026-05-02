"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Match, PredictionPick } from "@/types";
import { savePrediction } from "@/lib/predictions";
import { trackEvent } from "@/lib/analytics";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/cn";

interface Props {
  match: Match;
  onSubmit: () => void;
}

export function PredictionPrompt({ match, onSubmit }: Props) {
  const [pick, setPick] = useState<PredictionPick | null>(null);

  const handleSubmit = () => {
    if (!pick) return;
    savePrediction(match.id, pick);
    trackEvent("prediction_made", { matchId: match.id, pick });
    showToast({
      kind: "info",
      title: "Prediction locked in",
      detail: "Now let's find your matchday fan identity.",
      emoji: "🔮",
    });
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-500/15 via-fuchsia-500/10 to-amber-300/10 p-5 text-center">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-pink-100">
          Matchday Prediction
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-3xl">
          <span>{match.flagA}</span>
          <span className="text-base text-white/70">vs</span>
          <span>{match.flagB}</span>
        </div>
        <div className="mt-1 text-base font-black text-white">
          {match.teamA} vs {match.teamB}
        </div>
        <div className="mt-1 text-[11px] text-white/55">
          {match.dateLabel} · {match.city}
        </div>
      </div>

      <div>
        <div className="mb-2 text-center text-lg font-black text-white">
          Who wins?
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PickButton
            active={pick === "A"}
            onClick={() => setPick("A")}
            label={match.teamA}
            sub={match.flagA}
          />
          <PickButton
            active={pick === "draw"}
            onClick={() => setPick("draw")}
            label="Draw"
            sub="🤝"
          />
          <PickButton
            active={pick === "B"}
            onClick={() => setPick("B")}
            label={match.teamB}
            sub={match.flagB}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!pick}
        className={cn(
          "shine-button flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        Lock it in & start quiz
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PickButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border p-3 transition",
        active
          ? "border-pink-300/70 bg-pink-400/25 text-pink-50"
          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
      )}
    >
      <span className="text-2xl leading-none">{sub}</span>
      <span className="text-[12px] font-bold leading-tight">{label}</span>
    </button>
  );
}
