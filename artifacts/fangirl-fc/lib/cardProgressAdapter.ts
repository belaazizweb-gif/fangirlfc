"use client";

import {
  readProgression,
  fragmentsToVisualStars,
  getTopBadge,
  VISUAL_STARS,
  type ProgressionState,
} from "./progression";
import { getBadge, type BadgeId } from "./badges";

export interface CardProgressDisplay {
  starsDisplay: number;
  starFragments: number;
  topBadge: { id: BadgeId; name: string; emoji: string } | null;
  latestPenaltyScore: number | null;
  latestPenaltyGoals: number | null;
  latestPenaltyAttempts: number | null;
  footballIQLevel: number;
  xp: number;
}

export function adaptProgressionForCard(
  state: ProgressionState,
): CardProgressDisplay {
  const starsDisplay = Math.min(
    VISUAL_STARS,
    fragmentsToVisualStars(state.starFragments),
  );

  const topBadgeId = getTopBadge(state);
  const topBadge = topBadgeId
    ? {
        id: topBadgeId,
        name: getBadge(topBadgeId).name,
        emoji: getBadge(topBadgeId).emoji,
      }
    : null;

  const latestPenaltyScore =
    state.penalty.lastSession !== null
      ? state.penalty.lastSession.score
      : null;

  const latestPenaltyGoals =
    state.penalty.lastSession !== null
      ? state.penalty.lastSession.totalGoals
      : null;

  const latestPenaltyAttempts =
    state.penalty.lastSession !== null
      ? state.penalty.lastSession.totalAttempts
      : null;

  const totalCorrect = state.footballIQ.totalCorrect;
  const footballIQLevel =
    totalCorrect === 0
      ? 0
      : totalCorrect < 5
      ? 1
      : totalCorrect < 10
      ? 2
      : totalCorrect < 20
      ? 3
      : totalCorrect < 40
      ? 4
      : 5;

  return {
    starsDisplay,
    starFragments: state.starFragments,
    topBadge,
    latestPenaltyScore,
    latestPenaltyGoals,
    latestPenaltyAttempts,
    footballIQLevel,
    xp: state.xp,
  };
}

export function getCardProgressDisplay(): CardProgressDisplay {
  return adaptProgressionForCard(readProgression());
}
