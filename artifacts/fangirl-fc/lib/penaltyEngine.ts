import type { BadgeId } from "./badges";

export type ShotDirection =
  | "top-left"
  | "top-center"
  | "top-right"
  | "mid-left"
  | "mid-center"
  | "mid-right"
  | "low-left"
  | "low-center"
  | "low-right";

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

const GOAL_PROBABILITY: Record<ShotDirection, Record<PowerZone, number>> = {
  "top-left":    { weak: 0.30, normal: 0.55, strong: 0.70, perfect: 0.90 },
  "top-center":  { weak: 0.25, normal: 0.45, strong: 0.55, perfect: 0.70 },
  "top-right":   { weak: 0.30, normal: 0.55, strong: 0.70, perfect: 0.90 },
  "mid-left":    { weak: 0.55, normal: 0.70, strong: 0.78, perfect: 0.85 },
  "mid-center":  { weak: 0.60, normal: 0.65, strong: 0.60, perfect: 0.65 },
  "mid-right":   { weak: 0.55, normal: 0.70, strong: 0.78, perfect: 0.85 },
  "low-left":    { weak: 0.65, normal: 0.78, strong: 0.82, perfect: 0.88 },
  "low-center":  { weak: 0.70, normal: 0.75, strong: 0.72, perfect: 0.78 },
  "low-right":   { weak: 0.65, normal: 0.78, strong: 0.82, perfect: 0.88 },
};

const CORNER_DIRECTIONS: ShotDirection[] = [
  "top-left",
  "top-right",
  "low-left",
  "low-right",
];

function isPerfectShot(
  direction: ShotDirection,
  power: PowerZone,
  timed: boolean,
): boolean {
  return CORNER_DIRECTIONS.includes(direction) && power === "perfect" && timed;
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

  const xpEarned = attempts.reduce((sum, a) => sum + a.xpEarned, 0);

  return { score, xpEarned };
}

export function detectPenaltyBadges(
  attempts: PenaltyAttempt[],
  previousBestScore: number,
): BadgeId[] {
  const earned: BadgeId[] = [];

  const goals = attempts.filter((a) => a.isGoal);
  const total = attempts.length;
  const perfects = attempts.filter((a) => a.isPerfect);

  if (goals.length === total && total >= 5) {
    earned.push("no_miss_energy");
  }

  if (goals.length >= 5) {
    earned.push("penalty_queen");
  }

  if (perfects.length >= 1) {
    earned.push("perfect_shot");
  }

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

  if (total >= 5 && goals.some((_, i) => i >= 4)) {
    earned.push("pressure_proof");
  }

  const firstTwo = attempts.slice(0, 2);
  const missed2 = firstTwo.filter((a) => !a.isGoal).length === 2;
  const scoredAfter = attempts.slice(2).some((a) => a.isGoal);
  if (missed2 && scoredAfter) {
    earned.push("comeback_girl");
  }

  return earned;
}
