"use client";

import type { FanIdentityId } from "@/types";
import { FAN_TYPES } from "./fanTypes";

const KEY = "fangirlfc.unlocked";
const LAST_KEY = "fangirlfc.lastIdentity";

const ALL_IDS = Object.keys(FAN_TYPES) as FanIdentityId[];

export function getUnlocked(): FanIdentityId[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is FanIdentityId =>
        ALL_IDS.includes(id as FanIdentityId),
      );
    }
  } catch {
    return [];
  }
  return [];
}

export interface UnlockResult {
  list: FanIdentityId[];
  wasNew: boolean;
}

export function unlockIdentity(id: FanIdentityId): UnlockResult {
  if (typeof window === "undefined") return { list: [], wasNew: false };
  const current = getUnlocked();
  const wasNew = !current.includes(id);
  if (wasNew) current.push(id);
  window.localStorage.setItem(KEY, JSON.stringify(current));
  window.localStorage.setItem(LAST_KEY, id);
  return { list: current, wasNew };
}

export function isUnlocked(id: FanIdentityId): boolean {
  return getUnlocked().includes(id);
}

export function unlockedProgress(): { count: number; total: number } {
  return { count: getUnlocked().length, total: ALL_IDS.length };
}

export function totalIdentities(): number {
  return ALL_IDS.length;
}
