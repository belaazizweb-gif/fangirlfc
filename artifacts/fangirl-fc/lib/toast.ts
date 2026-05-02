"use client";

export type ToastKind = "star" | "unlock" | "info";

export interface ToastPayload {
  id: string;
  kind: ToastKind;
  title: string;
  detail?: string;
  emoji?: string;
}

const EVENT = "fangirlfc:toast";

let lastKey: string | null = null;
let lastTime = 0;
const DEDUP_WINDOW_MS = 1500;

export function showToast(p: Omit<ToastPayload, "id">): void {
  if (typeof window === "undefined") return;
  const key = `${p.kind}:${p.title}`;
  const now = Date.now();
  if (key === lastKey && now - lastTime < DEDUP_WINDOW_MS) return;
  lastKey = key;
  lastTime = now;
  const detail: ToastPayload = {
    ...p,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
  };
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function onToast(handler: (p: ToastPayload) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = (e: Event) => handler((e as CustomEvent<ToastPayload>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

export const STAR_LABELS: Record<string, string> = {
  quiz_completed: "Quiz completed",
  card_generated: "Card generated",
  card_shared: "Card shared",
  compare_friend: "Friend compared",
  challenge_completed: "Challenge completed",
};
