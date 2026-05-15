"use client";

import { useEffect, useState } from "react";
import { PenaltyIntro } from "@/components/penalty/PenaltyIntro";
import { PenaltyGame } from "@/components/penalty/PenaltyGame";
import { PenaltyResult } from "@/components/penalty/PenaltyResult";
import { FAN_TYPES } from "@/lib/fanTypes";
import type { FanIdentityId, FanIdentity } from "@/types";
import type { PenaltyAttempt } from "@/lib/penaltyEngine";
import { calculatePenaltyRewards, detectPenaltyBadges } from "@/lib/penaltyEngine";
import {
  recordPenaltySession,
  unlockBadges,
  readProgression,
  type PenaltySession,
} from "@/lib/progression";

const FULL_XP_SESSIONS_PER_DAY = 3;

type Phase = "intro" | "playing" | "result";

export default function PenaltyPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [identity, setIdentity] = useState<FanIdentity | null>(null);
  const [completedAttempts, setCompletedAttempts] = useState<PenaltyAttempt[]>([]);
  const [finalSession, setFinalSession] = useState<PenaltySession | null>(null);
  const [isReducedRewards, setIsReducedRewards] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastId = window.localStorage.getItem("fangirlfc.lastIdentity") as FanIdentityId | null;
    if (lastId && FAN_TYPES[lastId]) {
      setIdentity(FAN_TYPES[lastId]!);
    }
  }, []);

  const handleStart = () => {
    setPhase("playing");
  };

  const handleComplete = (attempts: PenaltyAttempt[]) => {
    const { score, xpEarned } = calculatePenaltyRewards(attempts);
    const prevBest = readProgression().penalty.bestScore;
    const badgesUnlocked = detectPenaltyBadges(attempts, prevBest);

    const session: PenaltySession = {
      score,
      totalGoals: attempts.filter((a) => a.isGoal).length,
      totalAttempts: attempts.length,
      perfectShots: attempts.filter((a) => a.isPerfect).length,
      xpEarned,
      badgesUnlocked,
      timestamp: Date.now(),
    };

    recordPenaltySession(session);
    if (badgesUnlocked.length > 0) {
      unlockBadges(badgesUnlocked);
    }

    const prog = readProgression();
    setIsReducedRewards(prog.dailyCaps.penaltySessionsToday > FULL_XP_SESSIONS_PER_DAY);

    setCompletedAttempts(attempts);
    setFinalSession(session);
    setPhase("result");
  };

  const handleReplay = () => {
    setCompletedAttempts([]);
    setFinalSession(null);
    setPhase("playing");
  };

  if (phase === "intro") {
    return <PenaltyIntro identity={identity} onStart={handleStart} />;
  }

  if (phase === "playing") {
    return <PenaltyGame onComplete={handleComplete} />;
  }

  if (phase === "result" && finalSession) {
    return (
      <PenaltyResult
        attempts={completedAttempts}
        session={finalSession}
        identity={identity}
        onReplay={handleReplay}
        isReducedRewards={isReducedRewards}
      />
    );
  }

  return null;
}
