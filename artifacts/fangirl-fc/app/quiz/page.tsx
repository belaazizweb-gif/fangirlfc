"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Quiz } from "@/components/Quiz";
import { PredictionPrompt } from "@/components/PredictionPrompt";
import { getMatch, matchHeadline } from "@/lib/matches";
import { hasPrediction } from "@/lib/predictions";

function QuizInner() {
  const params = useSearchParams();
  const compareTo = params.get("compareTo") ?? undefined;
  const matchId = params.get("matchId") ?? undefined;
  const match = matchId ? getMatch(matchId) : null;

  const [predictionDone, setPredictionDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!match) {
      setPredictionDone(true);
    } else {
      setPredictionDone(hasPrediction(match.id));
    }
    setHydrated(true);
  }, [match]);

  if (!hydrated) return <div className="text-white/50">Loading…</div>;

  if (match && !predictionDone) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-black">Matchday Quiz</h1>
          <p className="mt-1 text-sm text-white/60">
            First, lock in your prediction. Then we find your fan identity.
          </p>
        </div>
        <PredictionPrompt
          match={match}
          onSubmit={() => setPredictionDone(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">
          {match ? "Matchday Quiz" : "The Fangirl Quiz"}
        </h1>
        <p className="mt-1 text-sm text-white/60">
          {match
            ? matchHeadline(match)
            : "Pick the option that's most you. No wrong answers, only chaos."}
        </p>
      </div>
      <Quiz compareTo={compareTo} matchId={match?.id} />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading…</div>}>
      <QuizInner />
    </Suspense>
  );
}
