"use client";

import type { FanIdentityId } from "@/types";

const KEY = "fangirlfc.stars";
const ACTIONS_KEY = "fangirlfc.actions";
const IDENTITY_STARS_KEY = "fangirlfc.identity_stars";
const IDENTITY_ACTIONS_KEY = "fangirlfc.identity_actions";

export type StarAction =
  | "quiz_completed"
  | "card_generated"
  | "card_shared"
  | "compare_friend"
  | "challenge_completed";

const ACTION_VALUES: Record<StarAction, number> = {
  quiz_completed: 1,
  card_generated: 0.5,
  card_shared: 0.5,
  compare_friend: 1,
  challenge_completed: 0.5,
};

export const MAX_STARS = 5;
export const STARTING_STARS = 0.5;

// ---------- Global stars (across all identities) ----------

export function getStars(): number {
  if (typeof window === "undefined") return STARTING_STARS;
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) return STARTING_STARS;
  const n = Number(raw);
  if (Number.isNaN(n)) return STARTING_STARS;
  return Math.min(MAX_STARS, Math.max(0, n));
}

function getActions(): StarAction[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ACTIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StarAction[];
  } catch {
    return [];
  }
  return [];
}

function setActions(actions: StarAction[]) {
  window.localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
}

function setStars(value: number) {
  const clamped = Math.min(MAX_STARS, Math.max(0, value));
  window.localStorage.setItem(KEY, String(clamped));
  return clamped;
}

export function awardStar(action: StarAction): number {
  if (typeof window === "undefined") return STARTING_STARS;
  // challenge_completed is repeatable (per-challenge dedup happens upstream)
  if (action !== "challenge_completed") {
    const actions = getActions();
    if (actions.includes(action)) {
      return getStars();
    }
    actions.push(action);
    setActions(actions);
  }
  const next = getStars() + ACTION_VALUES[action];
  return setStars(next);
}

export function resetStars() {
  if (typeof window === "undefined") return;
  setStars(STARTING_STARS);
  setActions([]);
  window.localStorage.removeItem(IDENTITY_STARS_KEY);
  window.localStorage.removeItem(IDENTITY_ACTIONS_KEY);
}

export function getNextHint(stars: number, actions: StarAction[]): string {
  if (!actions.includes("quiz_completed"))
    return "Take the quiz to unlock your fan identity";
  if (!actions.includes("card_generated"))
    return "Next level: generate your fan card";
  if (!actions.includes("card_shared"))
    return "Next level: share your card";
  if (!actions.includes("compare_friend"))
    return "Next level: a friend takes the compare quiz";
  if (stars >= MAX_STARS) return "Max stars unlocked, you certified fan";
  return "Keep sharing to unlock more";
}

export function snapshot(): { stars: number; actions: StarAction[] } {
  return { stars: getStars(), actions: getActions() };
}

// ---------- Per-identity stars ----------

type IdentityStarMap = Partial<Record<FanIdentityId, number>>;
type IdentityActionsMap = Partial<Record<FanIdentityId, StarAction[]>>;

function readIdentityStarsMap(): IdentityStarMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(IDENTITY_STARS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as IdentityStarMap;
  } catch {
    return {};
  }
  return {};
}

function writeIdentityStarsMap(map: IdentityStarMap) {
  window.localStorage.setItem(IDENTITY_STARS_KEY, JSON.stringify(map));
}

function readIdentityActionsMap(): IdentityActionsMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(IDENTITY_ACTIONS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object")
      return parsed as IdentityActionsMap;
  } catch {
    return {};
  }
  return {};
}

function writeIdentityActionsMap(map: IdentityActionsMap) {
  window.localStorage.setItem(IDENTITY_ACTIONS_KEY, JSON.stringify(map));
}

export function getIdentityStars(id: FanIdentityId): number {
  const map = readIdentityStarsMap();
  const v = map[id];
  if (typeof v !== "number" || Number.isNaN(v)) return STARTING_STARS;
  return Math.min(MAX_STARS, Math.max(0, v));
}

export function getIdentityActions(id: FanIdentityId): StarAction[] {
  const map = readIdentityActionsMap();
  const list = map[id];
  return Array.isArray(list) ? list : [];
}

/**
 * Award a star to a specific identity profile. Also bumps the global
 * counter via awardStar() so the global StarProgress widget stays in
 * sync. Per-identity dedupe is independent from global dedupe.
 */
export function awardIdentityStar(
  id: FanIdentityId,
  action: StarAction,
): number {
  if (typeof window === "undefined") return STARTING_STARS;
  // Per-identity dedupe (challenge_completed remains repeatable)
  if (action !== "challenge_completed") {
    const actionsMap = readIdentityActionsMap();
    const list = actionsMap[id] ?? [];
    if (list.includes(action)) {
      // Already awarded for this identity — still sync global.
      awardStar(action);
      return getIdentityStars(id);
    }
    list.push(action);
    actionsMap[id] = list;
    writeIdentityActionsMap(actionsMap);
  }
  const map = readIdentityStarsMap();
  const current =
    typeof map[id] === "number" ? (map[id] as number) : STARTING_STARS;
  const next = Math.min(MAX_STARS, Math.max(0, current + ACTION_VALUES[action]));
  map[id] = next;
  writeIdentityStarsMap(map);
  // Keep global in sync (it has its own dedupe)
  awardStar(action);
  return next;
}

export function snapshotIdentity(
  id: FanIdentityId,
): { stars: number; actions: StarAction[] } {
  return { stars: getIdentityStars(id), actions: getIdentityActions(id) };
}
