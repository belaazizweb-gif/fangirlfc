import type { CreatorCardState } from "./creatorState";
import { DEFAULT_CARD_STATE } from "./creatorState";

const STORAGE_KEY = "fangirlfc.creator.currentCard";

/**
 * Backfill cutoutSrc / isCutout on photo objects saved before those fields
 * existed. Preserves all other existing values (src, x, y, scale, rotation,
 * naturalWidth, naturalHeight).
 */
function normalizeLoadedState(loaded: CreatorCardState): CreatorCardState {
  return {
    ...loaded,
    photo: {
      ...DEFAULT_CARD_STATE.photo,
      ...(loaded.photo ?? {}),
      cutoutSrc:    loaded.photo?.cutoutSrc    ?? null,
      isCutout:     loaded.photo?.isCutout     ?? false,
      cutoutSource: loaded.photo?.cutoutSource ?? undefined,
    },
  };
}

export function loadCardState(): CreatorCardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreatorCardState;
    return normalizeLoadedState(parsed);
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
