"use client";

import type { ShareRecord } from "@/types";

const KEY = "fangirlfc.shares";

function readAll(): Record<string, ShareRecord> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, ShareRecord>;
    }
  } catch {
    return {};
  }
  return {};
}

function writeAll(data: Record<string, ShareRecord>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function mockSaveShare(record: ShareRecord) {
  const all = readAll();
  all[record.shareId] = record;
  writeAll(all);
}

export function mockGetShare(shareId: string): ShareRecord | null {
  const all = readAll();
  return all[shareId] ?? null;
}
