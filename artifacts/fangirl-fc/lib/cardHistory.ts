"use client";

import { customAlphabet } from "nanoid";
import type { FanIdentityId } from "@/types";

const KEY = "fangirlfc.cards";
const MAX_CARDS = 50;
const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export interface SavedCard {
  id: string;
  identityId: FanIdentityId;
  teamCode: string;
  displayName: string;
  templateId: string;
  createdAt: number;
}

export function listCards(): SavedCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return (arr as SavedCard[])
        .filter((c) => c && typeof c.id === "string")
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch {
    return [];
  }
  return [];
}

function writeAll(cards: SavedCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cards.slice(0, MAX_CARDS)));
}

/**
 * Save a card. If an identical card (same identity + team + name + template)
 * already exists, refresh its createdAt instead of creating a duplicate.
 */
export function saveCard(c: Omit<SavedCard, "id" | "createdAt">): SavedCard {
  const list = listCards();
  const existing = list.find(
    (x) =>
      x.identityId === c.identityId &&
      x.teamCode === c.teamCode &&
      x.displayName === c.displayName &&
      x.templateId === c.templateId,
  );
  if (existing) {
    existing.createdAt = Date.now();
    writeAll(list);
    return existing;
  }
  const card: SavedCard = { ...c, id: nano(), createdAt: Date.now() };
  list.unshift(card);
  writeAll(list);
  return card;
}

export function deleteCard(id: string): SavedCard[] {
  const next = listCards().filter((c) => c.id !== id);
  writeAll(next);
  return next;
}

export function duplicateCard(id: string): SavedCard | null {
  const list = listCards();
  const orig = list.find((c) => c.id === id);
  if (!orig) return null;
  const copy: SavedCard = {
    ...orig,
    id: nano(),
    displayName: orig.displayName,
    createdAt: Date.now(),
  };
  list.unshift(copy);
  writeAll(list);
  return copy;
}

export function getCard(id: string): SavedCard | null {
  return listCards().find((c) => c.id === id) ?? null;
}

export function countCards(): number {
  return listCards().length;
}
