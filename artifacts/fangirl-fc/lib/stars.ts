"use client";

const KEY = "fangirlfc.stars";
const ACTIONS_KEY = "fangirlfc.actions";

export type StarAction =
  | "quiz_completed"
  | "card_generated"
  | "card_shared"
  | "compare_friend";

const ACTION_VALUES: Record<StarAction, number> = {
  quiz_completed: 1,
  card_generated: 0.5,
  card_shared: 0.5,
  compare_friend: 1,
};

export const MAX_STARS = 5;
export const STARTING_STARS = 0.5;

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
  const actions = getActions();
  if (actions.includes(action)) {
    return getStars();
  }
  actions.push(action);
  setActions(actions);
  const next = getStars() + ACTION_VALUES[action];
  return setStars(next);
}

export function resetStars() {
  if (typeof window === "undefined") return;
  setStars(STARTING_STARS);
  setActions([]);
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
