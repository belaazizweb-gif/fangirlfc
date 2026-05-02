"use client";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  cta: string;
  href: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "tag_screamer",
    title: "Tag the friend who screams the most",
    description:
      "Send your card to your loudest groupchat friend. They know who they are.",
    reward: 0.5,
    cta: "Open share",
    href: "/card?id=screamer",
  },
  {
    id: "predict_winner",
    title: "Predict today's winner",
    description:
      "Lock in your match prediction. Manifest the W (no take-backs).",
    reward: 0.5,
    cta: "Mark predicted",
    href: "#",
  },
  {
    id: "matchday_mood",
    title: "Make your matchday mood card",
    description: "Pick the template that matches today's vibe and save it.",
    reward: 0.5,
    cta: "Make a card",
    href: "/card?id=princess",
  },
  {
    id: "compare_friend",
    title: "Compare with one friend",
    description: "Send your share link, find out if you're football besties.",
    reward: 0.5,
    cta: "Get compare link",
    href: "/card?id=loyal",
  },
  {
    id: "second_identity",
    title: "Unlock a second fan identity",
    description: "Retake the quiz with different answers and reveal a new you.",
    reward: 0.5,
    cta: "Retake quiz",
    href: "/quiz",
  },
];

const KEY = "fangirlfc.completedChallenges";

export function getCompletedChallenges(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    return [];
  }
  return [];
}

export function completeChallenge(id: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getCompletedChallenges();
  if (list.includes(id)) return false;
  list.push(id);
  window.localStorage.setItem(KEY, JSON.stringify(list));
  return true;
}
