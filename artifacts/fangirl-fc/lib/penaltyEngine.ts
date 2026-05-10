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

// left/right: rewarding to aim at corners, but still requires good power.
// center: hard to score — keeper stays central and blocks easily.
const GOAL_PROBABILITY: Record<ShotDirection, Record<PowerZone, number>> = {
  left:   { weak: 0.38, normal: 0.55, strong: 0.68, perfect: 0.84 },
  center: { weak: 0.28, normal: 0.42, strong: 0.48, perfect: 0.58 },
  right:  { weak: 0.38, normal: 0.55, strong: 0.68, perfect: 0.84 },
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
  // Power (dipping): rewards well-timed shots; penalises poor timing — genuinely risky
  // Safe (straight): consistent baseline — no bonus, no extra risk
  const curveBonus =
    style === "straight" ? 0 :
    style === "dipping"  ? (timedCorrectly ? 0.10 : -0.08) :
    0.06;

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

  // No Miss Energy: scored every single attempt in a full session (3/3).
  if (goals.length === total && total >= 3) {
    earned.push("no_miss_energy");
  }

  // Penalty Queen: scored 2 or more out of 3.
  if (goals.length >= 2) {
    earned.push("penalty_queen");
  }

  // Perfect Shot: at least one perfect-power side shot that scored.
  if (perfects.length >= 1) {
    earned.push("perfect_shot");
  }

  // Ice Cold Finisher: 3/3 goals AND every shot aimed at a corner (left or right, never center).
  // Differentiates from No Miss Energy — requires deliberate, skilled corner play throughout.
  const allCorners = attempts.every((a) => a.direction !== "center");
  if (goals.length === total && total >= 3 && allCorners) {
    earned.push("ice_cold_finisher");
  }

  // Pressure Proof: was at exactly 1 goal after the first 2 shots (needed the final penalty),
  // then scored it. Represents genuine pressure — one miss away from a poor session.
  const goalsInFirst2 = attempts.slice(0, 2).filter((a) => a.isGoal).length;
  if (total >= 3 && goalsInFirst2 === 1 && attempts[2]?.isGoal) {
    earned.push("pressure_proof");
  }

  // Comeback Girl: missed first two, then scored the third.
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
