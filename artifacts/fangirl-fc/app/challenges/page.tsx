"use client";

import { useEffect, useState } from "react";
import { CHALLENGES, completeChallenge, getCompletedChallenges } from "@/lib/challenges";
import { awardStar, getStars } from "@/lib/stars";
import { ChallengeCard } from "@/components/ChallengeCard";
import { StarProgress } from "@/components/StarProgress";
import { trackEvent } from "@/lib/analytics";

export default function ChallengesPage() {
  const [done, setDone] = useState<string[]>([]);
  const [stars, setStars] = useState(0.5);

  useEffect(() => {
    setDone(getCompletedChallenges());
    setStars(getStars());
  }, []);

  const handleComplete = (id: string) => {
    if (done.includes(id)) return;
    const wasNew = completeChallenge(id);
    if (!wasNew) return;
    const next = awardStar("challenge_completed");
    setStars(next);
    setDone((d) => [...d, id]);
    trackEvent("challenge_completed", { id });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-black">Daily Challenges</h1>
        <p className="mt-1 text-sm text-white/60">
          Tiny missions. Big star energy. {done.length}/{CHALLENGES.length}{" "}
          completed today.
        </p>
      </div>
      <div className="glass rounded-2xl p-4">
        <StarProgress stars={stars} />
      </div>
      <div className="flex flex-col gap-3">
        {CHALLENGES.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            done={done.includes(c.id)}
            onComplete={() => handleComplete(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
