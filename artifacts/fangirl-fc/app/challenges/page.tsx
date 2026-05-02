"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHALLENGES,
  CHALLENGE_CATEGORIES,
  completeChallenge,
  getCompletedChallenges,
  type ChallengeCategory,
} from "@/lib/challenges";
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

  const handleComplete = (id: string, category: ChallengeCategory) => {
    if (done.includes(id)) return;
    const wasNew = completeChallenge(id);
    if (!wasNew) return;
    const next = awardStar("challenge_completed");
    setStars(next);
    setDone((d) => [...d, id]);
    trackEvent("challenge_completed", { id, category });
    trackEvent("social_challenge_completed", { id, category });
  };

  const grouped = useMemo(() => {
    const map: Record<ChallengeCategory, typeof CHALLENGES> = {
      bestie: [],
      boyfriend: [],
      girls: [],
      matchday: [],
    };
    for (const c of CHALLENGES) map[c.category].push(c);
    return map;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Daily Challenges</h1>
        <p className="mt-1 text-sm text-white/60">
          Tiny missions. Big star energy. {done.length}/{CHALLENGES.length}{" "}
          completed.
        </p>
      </div>
      <div className="glass rounded-2xl p-4">
        <StarProgress stars={stars} hint="Next level: complete a challenge" />
      </div>

      {CHALLENGE_CATEGORIES.map((cat) => {
        const list = grouped[cat.id];
        if (!list || list.length === 0) return null;
        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.emoji}</span>
              <div>
                <div className="text-[15px] font-black text-white">
                  {cat.label}
                </div>
                <div className="text-[11px] text-white/55">{cat.blurb}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {list.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  done={done.includes(c.id)}
                  onComplete={() => handleComplete(c.id, c.category)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
