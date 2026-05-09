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

  const totalAnswered = state.footballIQ.totalAnswered;
  const footballIQLevel =
    totalAnswered === 0
      ? 0
      : totalAnswered < 5
      ? 1
      : totalAnswered < 15
      ? 2
      : totalAnswered < 30
      ? 3
      : totalAnswered < 50
      ? 4
      : 5;

  return {
    starsDisplay,
    starFragments: state.starFragments,
    topBadge,
    latestPenaltyScore,
    footballIQLevel,
    xp: state.xp,
  };
}

export function getCardProgressDisplay(): CardProgressDisplay {
  return adaptProgressionForCard(readProgression());
}
