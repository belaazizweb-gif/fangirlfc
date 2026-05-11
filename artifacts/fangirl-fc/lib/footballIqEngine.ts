"use client";

import {
  readProgression,
  writeProgression,
  awardXP,
  unlockBadges,
} from "./progression";
import type { BadgeId } from "./badges";
import {
  FOOTBALL_IQ_QUESTIONS,
  type FootballIqQuestion,
  type FootballIqOption,
  type FootballIqCategory,
} from "./footballIqQuestions";

export interface FootballIQSessionResult {
  xpEarned: number;
  badgesUnlocked: BadgeId[];
  isPracticeMode: boolean;
  correctCount: number;
  totalCount: number;
  newFootballIQLevel: number;
}

export function getFootballIQLevel(totalCorrect: number): number {
  if (totalCorrect === 0) return 0;
  if (totalCorrect < 5) return 1;
  if (totalCorrect < 10) return 2;
  if (totalCorrect < 20) return 3;
  if (totalCorrect < 40) return 4;
  return 5;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyQuestions(): [FootballIqQuestion, FootballIqQuestion] {
  const today = todayStr();
  const parts = today.split("-").map(Number);
  const seed = ((parts[0]! % 100) * 10000 + parts[1]! * 100 + parts[2]!) % 9973;
  const n = FOOTBALL_IQ_QUESTIONS.length;
  const idx1 = seed % n;
  const idx2candidate = (seed * 13 + 7) % n;
  const idx2 = idx2candidate === idx1 ? (idx2candidate + 1) % n : idx2candidate;
  return [FOOTBALL_IQ_QUESTIONS[idx1]!, FOOTBALL_IQ_QUESTIONS[idx2]!];
}

export function shuffleOptions(
  options: ReadonlyArray<FootballIqOption>,
): FootballIqOption[] {
  return [...options].sort(() => Math.random() - 0.5);
}

export function hasCompletedFootballIQToday(): boolean {
  const state = readProgression();
  const today = todayStr();
  if (state.dailyCaps.date !== today) return false;
  return state.dailyCaps.footballIQSessionsToday >= 1;
}

export interface FootballIQAnswerInput {
  questionId: string;
  correct: boolean;
  category: FootballIqCategory;
}

export function recordFootballIQSession(
  results: FootballIQAnswerInput[],
): FootballIQSessionResult {
  let state = readProgression();
  const today = todayStr();

  if (state.dailyCaps.date !== today) {
    state = {
      ...state,
      dailyCaps: {
        date: today,
        penaltySessionsToday: 0,
        footballIQSessionsToday: 0,
        xpEarnedToday: 0,
      },
    };
  }

  const isPracticeMode = state.dailyCaps.footballIQSessionsToday >= 1;
  const correctCount = results.filter((r) => r.correct).length;
  const totalCount = results.length;

  let xpEarned = 0;
  if (!isPracticeMode) {
    xpEarned += 20;
    xpEarned += correctCount * 10;
    if (correctCount === 2 && totalCount === 2) xpEarned += 15;
  }

  const prevIQ = state.footballIQ;
  const categoryScores = { ...prevIQ.categoryScores };
  for (const r of results) {
    if (r.correct) {
      categoryScores[r.category] = (categoryScores[r.category] ?? 0) + 1;
    }
  }

  const newTotalAnswered = prevIQ.totalAnswered + totalCount;
  const newTotalCorrect = prevIQ.totalCorrect + correctCount;

  state = {
    ...state,
    footballIQ: {
      totalAnswered: newTotalAnswered,
      totalCorrect: newTotalCorrect,
      lastPlayedAt: Date.now(),
      categoryScores,
    },
    dailyCaps: {
      ...state.dailyCaps,
      footballIQSessionsToday: state.dailyCaps.footballIQSessionsToday + 1,
    },
  };

  writeProgression(state);

  let finalState = state;
  if (xpEarned > 0) {
    finalState = awardXP(xpEarned);
  }

  const badgesUnlocked: BadgeId[] = [];
  const isFirstEver = prevIQ.totalAnswered === 0;

  if (isFirstEver) badgesUnlocked.push("rules_rookie");
  if (prevIQ.totalCorrect < 5 && newTotalCorrect >= 5) badgesUnlocked.push("she_knows_ball");
  if (prevIQ.totalCorrect < 20 && newTotalCorrect >= 20) badgesUnlocked.push("tactical_mind");

  for (const r of results) {
    if (r.correct) {
      if (
        r.questionId.includes("offside") &&
        !finalState.badges.includes("offside_survivor") &&
        !badgesUnlocked.includes("offside_survivor")
      ) {
        badgesUnlocked.push("offside_survivor");
      }
      if (
        r.questionId.includes("var") &&
        !finalState.badges.includes("var_girl") &&
        !badgesUnlocked.includes("var_girl")
      ) {
        badgesUnlocked.push("var_girl");
      }
    }
  }

  if (badgesUnlocked.length > 0) {
    finalState = unlockBadges(badgesUnlocked);
  }

  return {
    xpEarned,
    badgesUnlocked,
    isPracticeMode,
    correctCount,
    totalCount,
    newFootballIQLevel: getFootballIQLevel(newTotalCorrect),
  };
}
