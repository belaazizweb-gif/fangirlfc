import type { BadgeId } from "./badges";

export type ShotDirection = "left" | "center" | "right";

export type PowerZone = "weak" | "normal" | "strong" | "perfect";

export type ShotStyle = "straight" | "curve-left" | "curve-right" | "dipping";

export interface PenaltyAttempt {
  direction: ShotDirection;
  power: PowerZone;
  style: ShotStyle;
  timedCorrectly: boolean;
  isGoal: boolean;
  isPerfect: boolean;
  xpEarned: number;
}

export interface PenaltySessionResult {
  attempts: PenaltyAttempt[];
  totalGoals: number;
  totalAttempts: number;
  perfectShots: number;
  score: number;
  xpEarned: number;
  badgesUnlocked: BadgeId[];
  timestamp: number;
}

// left/right are harder to save (side of goal).
// center is easiest to save (keeper stays central).
const GOAL_PROBABILITY: Record<ShotDirection, Record<PowerZone, number>> = {
  left:   { weak: 0.55, normal: 0.72, strong: 0.80, perfect: 0.92 },
  center: { weak: 0.60, normal: 0.65, strong: 0.62, perfect: 0.68 },
  right:  { weak: 0.55, normal: 0.72, strong: 0.80, perfect: 0.92 },
};

// Perfect shot = side of goal + perfect power + timed correctly.
function isPerfectShot(
  direction: ShotDirection,
  power: PowerZone,
  timed: boolean,
): boolean {
  return direction !== "center" && power === "perfect" && timed;
}

export function calculatePenaltyResult(
  direction: ShotDirection,
  power: PowerZone,
  style: ShotStyle,
  timedCorrectly: boolean,
): PenaltyAttempt {
  const baseProbability = GOAL_PROBABILITY[direction][power];
  const timingBonus = timedCorrectly ? 0.08 : -0.05;
  const curveBonus =
    style === "straight" ? 0 : style === "dipping" ? 0.04 : 0.06;

  const finalProbability = Math.min(
    0.97,
    Math.max(0.05, baseProbability + timingBonus + curveBonus),
  );

  const isGoal = Math.random() < finalProbability;
  const isPerfect = isGoal && isPerfectShot(direction, power, timedCorrectly);

  const xpEarned = isPerfect ? 30 : isGoal ? 15 : 5;

  return {
    direction,
    power,
    style,
    timedCorrectly,
    isGoal,
    isPerfect,
    xpEarned,
  };
}

export function calculatePenaltyRewards(
  attempts: PenaltyAttempt[],
): { score: number; xpEarned: number } {
  const goals = attempts.filter((a) => a.isGoal).length;
  const perfects = attempts.filter((a) => a.isPerfect).length;
  const total = attempts.length;

  const baseScore = Math.round((goals / Math.max(total, 1)) * 100);
  const perfectBonus = perfects * 10;
  const score = Math.min(100, baseScore + perfectBonus);

  // xpEarned is the sum of per-attempt values — single source of truth.
  const xpEarned = attempts.reduce((sum, a) => sum + a.xpEarned, 0);

  return { score, xpEarned };
}

export function detectPenaltyBadges(
  attempts: PenaltyAttempt[],
  _previousBestScore: number,
): BadgeId[] {
  const earned: BadgeId[] = [];

  const total = attempts.length;
  const goals = attempts.filter((a) => a.isGoal);
  const perfects = attempts.filter((a) => a.isPerfect);

  // No Miss Energy: scored every single attempt (minimum 5).
  if (goals.length === total && total >= 5) {
    earned.push("no_miss_energy");
  }

  // Penalty Queen: scored 5 or more in a session.
  if (goals.length >= 5) {
    earned.push("penalty_queen");
  }

  // Perfect Shot: at least one perfect-power side shot that scored.
  if (perfects.length >= 1) {
    earned.push("perfect_shot");
  }

  // Ice Cold Finisher: 3 consecutive goals anywhere in the session.
  let consecutiveGoals = 0;
  let maxConsecutive = 0;
  for (const a of attempts) {
    if (a.isGoal) {
      consecutiveGoals++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveGoals);
    } else {
      consecutiveGoals = 0;
    }
  }
  if (maxConsecutive >= 3) {
    earned.push("ice_cold_finisher");
  }

  // Pressure Proof: scored on the 5th attempt or later (index 4+).
  if (total >= 5) {
    const hasLateGoal = attempts.slice(4).some((a) => a.isGoal);
    if (hasLateGoal) earned.push("pressure_proof");
  }

  // Comeback Girl: missed first two, then scored at least once.
  const missed2 =
    attempts.length >= 2 &&
    !attempts[0]!.isGoal &&
    !attempts[1]!.isGoal;
  const scoredAfter = attempts.slice(2).some((a) => a.isGoal);
  if (missed2 && scoredAfter) {
    earned.push("comeback_girl");
  }

  return earned;
}
