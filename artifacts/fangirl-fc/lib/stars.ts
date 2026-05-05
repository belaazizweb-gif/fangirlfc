"use client";

import type { FanIdentityId } from "@/types";
import { showToast, STAR_LABELS } from "./toast";

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

export interface AwardOpts {
  /** Suppress the toast (used when a higher-level call will toast instead). */
  silent?: boolean;
}

function emitStarToast(action: StarAction, delta: number) {
  showToast({
    kind: "star",
    title: `+${delta} ⭐ ${STAR_LABELS[action] ?? action}`,
  });
}

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

export function awardStar(action: StarAction, opts?: AwardOpts): number {
  if (typeof window === "undefined") return STARTING_STARS;
  const before = getStars();
  // challenge_completed is repeatable (per-challenge dedup happens upstream)
  if (action !== "challenge_completed") {
    const actions = getActions();
    if (actions.includes(action)) {
      return before;
    }
    actions.push(action);
    setActions(actions);
  }
  const next = setStars(before + ACTION_VALUES[action]);
  if (!opts?.silent && next > before) {
    emitStarToast(action, ACTION_VALUES[action]);
  }
  return next;
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
    return "Take the quiz to discover your football fan identity";
  if (!actions.includes("card_generated"))
    return "Next level: turn your result into your Fangirl Card";
  if (!actions.includes("card_shared"))
    return "Next level: show the group chat your football fan type";
  if (!actions.includes("compare_friend"))
    return "Next level: compare your football type with a friend";
  if (stars >= MAX_STARS) return "Max stars unlocked — you certified fan";
  return "Keep sharing to earn more matchday stars";
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
 *
 * Toast policy: emit one toast if EITHER the per-identity counter or
 * the global counter actually increased. The global call is silenced
 * to avoid double-toasting.
 */
export function awardIdentityStar(
  id: FanIdentityId,
  action: StarAction,
): number {
  if (typeof window === "undefined") return STARTING_STARS;

  const globalBefore = getStars();
  let perIdentityIncreased = false;
  let perIdentityNext: number;

  if (action !== "challenge_completed") {
    const actionsMap = readIdentityActionsMap();
    const list = actionsMap[id] ?? [];
    if (list.includes(action)) {
      perIdentityNext = getIdentityStars(id);
    } else {
      list.push(action);
      actionsMap[id] = list;
      writeIdentityActionsMap(actionsMap);
      perIdentityIncreased = true;
      const map = readIdentityStarsMap();
      const current =
        typeof map[id] === "number" ? (map[id] as number) : STARTING_STARS;
      perIdentityNext = Math.min(
        MAX_STARS,
        Math.max(0, current + ACTION_VALUES[action]),
      );
      map[id] = perIdentityNext;
      writeIdentityStarsMap(map);
    }
  } else {
    const map = readIdentityStarsMap();
    const current =
      typeof map[id] === "number" ? (map[id] as number) : STARTING_STARS;
    perIdentityNext = Math.min(
      MAX_STARS,
      Math.max(0, current + ACTION_VALUES[action]),
    );
    map[id] = perIdentityNext;
    writeIdentityStarsMap(map);
    perIdentityIncreased = true;
  }

  // Sync global silently — we toast here ourselves.
  awardStar(action, { silent: true });
  const globalAfter = getStars();

  if (perIdentityIncreased || globalAfter > globalBefore) {
    emitStarToast(action, ACTION_VALUES[action]);
  }

  return perIdentityNext;
}

export function snapshotIdentity(
  id: FanIdentityId,
): { stars: number; actions: StarAction[] } {
  return { stars: getIdentityStars(id), actions: getIdentityActions(id) };
}
