import type { CreatorCardState } from "./creatorState";

const STORAGE_KEY = "fangirlfc.creator.currentCard";

export function loadCardState(): CreatorCardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CreatorCardState;
  } catch {
    return null;
  }
}

export function saveCardState(state: CreatorCardState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or unavailable
  }
}

export function clearCardState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // unavailable
  }
}
