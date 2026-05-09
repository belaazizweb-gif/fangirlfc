"use client";

import type { BadgeId } from "./badges";

const STORAGE_KEY = "fangirl_progress_v1";

export const XP_THRESHOLDS: number[] = [
  50, 120, 210, 320, 460, 620, 800, 1000, 1250, 1530,
  1840, 2180, 2550, 2950, 3380, 3840, 4330, 4850, 5400, 6000,
];

export const MAX_STAR_FRAGMENTS = 20;
export const VISUAL_STARS = 5;
export const FRAGMENTS_PER_STAR = MAX_STAR_FRAGMENTS / VISUAL_STARS;

export interface PenaltySkillLevels {
  accuracy: number;
  powerControl: number;
  curve: number;
  nerves: number;
  clutch: number;
}

export interface PenaltySession {
  score: number;
  totalGoals: number;
  totalAttempts: number;
  perfectShots: number;
  xpEarned: number;
  badgesUnlocked: BadgeId[];
  timestamp: number;
}

export interface PenaltyStats {
  bestScore: number;
  totalSessions: number;
  totalGoals: number;
  totalAttempts: number;
  perfectShots: number;
  skillLevels: PenaltySkillLevels;
  lastSession: PenaltySession | null;
}

export interface FootballIQStats {
  totalAnswered: number;
  totalCorrect: number;
  lastPlayedAt: number | null;
  categoryScores: Record<string, number>;
}

export interface DailyCaps {
  date: string;
  penaltySessionsToday: number;
  footballIQSessionsToday: number;
  xpEarnedToday: number;
}

export interface ProgressionState {
  version: 1;
  xp: number;
  starFragments: number;
  level: number;
  skillPoints: number;
  streak: number;
  lastActiveDate: string;
  badges: BadgeId[];
  penalty: PenaltyStats;
  footballIQ: FootballIQStats;
  dailyCaps: DailyCaps;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultPenaltySkills(): PenaltySkillLevels {
  return {
    accuracy: 0,
    powerControl: 0,
    curve: 0,
    nerves: 0,
    clutch: 0,
  };
}

export function defaultProgressionState(): ProgressionState {
  const today = todayString();
  return {
    version: 1,
    xp: 0,
    starFragments: 0,
    level: 1,
    skillPoints: 0,
    streak: 0,
    lastActiveDate: today,
    badges: [],
    penalty: {
      bestScore: 0,
      totalSessions: 0,
      totalGoals: 0,
      totalAttempts: 0,
      perfectShots: 0,
      skillLevels: defaultPenaltySkills(),
      lastSession: null,
    },
    footballIQ: {
      totalAnswered: 0,
      totalCorrect: 0,
      lastPlayedAt: null,
      categoryScores: {},
    },
    dailyCaps: {
      date: today,
      penaltySessionsToday: 0,
      footballIQSessionsToday: 0,
      xpEarnedToday: 0,
    },
  };
}

export function readProgression(): ProgressionState {
  if (typeof window === "undefined") return defaultProgressionState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgressionState();
    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    if (!parsed || parsed.version !== 1) return defaultProgressionState();
    const defaults = defaultProgressionState();
    return {
      ...defaults,
      ...parsed,
      penalty: { ...defaults.penalty, ...(parsed.penalty ?? {}) },
      footballIQ: { ...defaults.footballIQ, ...(parsed.footballIQ ?? {}) },
      dailyCaps: { ...defaults.dailyCaps, ...(parsed.dailyCaps ?? {}) },
    } as ProgressionState;
  } catch {
    return defaultProgressionState();
  }
}

export function writeProgression(state: ProgressionState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function xpToFragment(xp: number): number {
  let fragments = 0;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]!) {
      fragments = i + 1;
    } else {
      break;
    }
  }
  return Math.min(fragments, MAX_STAR_FRAGMENTS);
}

export function fragmentsToVisualStars(fragments: number): number {
  return (Math.min(fragments, MAX_STAR_FRAGMENTS) / MAX_STAR_FRAGMENTS) * VISUAL_STARS;
}

export function xpProgressInCurrentFragment(xp: number): {
  fragmentIndex: number;
  earned: number;
  needed: number;
  percent: number;
} {
  const fragments = xpToFragment(xp);
  const fragmentIndex = Math.min(fragments, MAX_STAR_FRAGMENTS - 1);
  const prevThreshold = fragmentIndex === 0 ? 0 : XP_THRESHOLDS[fragmentIndex - 1]!;
  const nextThreshold = XP_THRESHOLDS[fragmentIndex] ?? XP_THRESHOLDS[MAX_STAR_FRAGMENTS - 1]!;
  const earned = xp - prevThreshold;
  const needed = nextThreshold - prevThreshold;
  const percent = Math.min(100, Math.round((earned / needed) * 100));
  return { fragmentIndex, earned, needed, percent };
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function refreshDailyCaps(state: ProgressionState): ProgressionState {
  const today = todayString();
  if (state.dailyCaps.date !== today) {
    return {
      ...state,
      dailyCaps: {
        date: today,
        penaltySessionsToday: 0,
        footballIQSessionsToday: 0,
        xpEarnedToday: 0,
      },
    };
  }
  return state;
}

function updateStreak(state: ProgressionState): ProgressionState {
  const today = todayString();
  const last = state.lastActiveDate;
  if (last === today) return state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const newStreak = last === yesterdayStr ? state.streak + 1 : 1;
  return { ...state, streak: newStreak, lastActiveDate: today };
}

export function awardXP(
  xpAmount: number,
  dailyCapXP = 500,
): ProgressionState {
  let state = readProgression();
  state = refreshDailyCaps(state);
  state = updateStreak(state);

  const remaining = Math.max(0, dailyCapXP - state.dailyCaps.xpEarnedToday);
  const actualXP = Math.min(xpAmount, remaining);
  if (actualXP <= 0) {
    writeProgression(state);
    return state;
  }

  const newXP = state.xp + actualXP;
  const newFragments = xpToFragment(newXP);
  const newLevel = levelFromXp(newXP);

  const skillPointsGained = newLevel - state.level;

  const next: ProgressionState = {
    ...state,
    xp: newXP,
    starFragments: newFragments,
    level: newLevel,
    skillPoints: state.skillPoints + Math.max(0, skillPointsGained),
    dailyCaps: {
      ...state.dailyCaps,
      xpEarnedToday: state.dailyCaps.xpEarnedToday + actualXP,
    },
  };

  writeProgression(next);
  return next;
}

export function unlockBadge(badgeId: BadgeId): ProgressionState {
  const state = readProgression();
  if (state.badges.includes(badgeId)) return state;
  const next: ProgressionState = {
    ...state,
    badges: [...state.badges, badgeId],
  };
  writeProgression(next);
  return next;
}

export function unlockBadges(badgeIds: BadgeId[]): ProgressionState {
  let state = readProgression();
  const newBadges = badgeIds.filter((id) => !state.badges.includes(id));
  if (newBadges.length === 0) return state;
  state = { ...state, badges: [...state.badges, ...newBadges] };
  writeProgression(state);
  return state;
}

export function recordPenaltySession(session: PenaltySession): ProgressionState {
  let state = readProgression();
  state = refreshDailyCaps(state);
  state = updateStreak(state);

  const prev = state.penalty;
  const updatedPenalty: PenaltyStats = {
    bestScore: Math.max(prev.bestScore, session.score),
    totalSessions: prev.totalSessions + 1,
    totalGoals: prev.totalGoals + session.totalGoals,
    totalAttempts: prev.totalAttempts + session.totalAttempts,
    perfectShots: prev.perfectShots + session.perfectShots,
    skillLevels: prev.skillLevels,
    lastSession: session,
  };

  const next: ProgressionState = {
    ...state,
    penalty: updatedPenalty,
    dailyCaps: {
      ...state.dailyCaps,
      penaltySessionsToday: state.dailyCaps.penaltySessionsToday + 1,
    },
  };

  writeProgression(next);
  return next;
}

export function getTopBadge(state: ProgressionState): BadgeId | null {
  if (state.badges.length === 0) return null;
  const priority: BadgeId[] = [
    "penalty_queen",
    "no_miss_energy",
    "ice_cold_finisher",
    "tactical_mind",
    "pressure_proof",
    "perfect_shot",
    "team_captain",
    "group_chat_icon",
    "she_knows_ball",
    "comeback_girl",
    "squad_energy",
    "bestie_challenge",
    "offside_survivor",
    "var_girl",
    "rules_rookie",
  ];
  for (const id of priority) {
    if (state.badges.includes(id)) return id;
  }
  return state.badges[0] ?? null;
}

export function hasDailyPenaltyCap(maxSessions = 10): boolean {
  const state = readProgression();
  const today = todayString();
  if (state.dailyCaps.date !== today) return false;
  return state.dailyCaps.penaltySessionsToday >= maxSessions;
}

export function resetProgression(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
