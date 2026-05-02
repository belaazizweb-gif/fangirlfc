"use client";

export type ChallengeCategory =
  | "bestie"
  | "boyfriend"
  | "girls"
  | "matchday";

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  title: string;
  description: string;
  reward: number;
  cta: string;
  href: string;
}

export const CHALLENGE_CATEGORIES: {
  id: ChallengeCategory;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  {
    id: "bestie",
    label: "Bestie Challenge",
    emoji: "💖",
    blurb: "Your ride or die in the groupchat",
  },
  {
    id: "boyfriend",
    label: "Boyfriend Challenge",
    emoji: "💘",
    blurb: "Does he actually know ball?",
  },
  {
    id: "girls",
    label: "Girls Group Challenge",
    emoji: "👯‍♀️",
    blurb: "Squad activation",
  },
  {
    id: "matchday",
    label: "Matchday Challenge",
    emoji: "⚽",
    blurb: "Today only — quick wins",
  },
];

export const CHALLENGES: Challenge[] = [
  // Bestie
  {
    id: "bestie_send_screamer",
    category: "bestie",
    title: "Send this to the friend who screams the most",
    description:
      "Tag your loudest groupchat bestie. They know who they are.",
    reward: 0.5,
    cta: "Make my card",
    href: "/card?id=screamer&mode=bestie",
  },
  {
    id: "bestie_real_loyal_queen",
    category: "bestie",
    title: "Find out who is the real Loyal Queen",
    description: "Send your card and see which one of you never switched sides.",
    reward: 0.5,
    cta: "Open Loyal Queen",
    href: "/card?id=loyal&mode=bestie",
  },
  {
    id: "bestie_compare",
    category: "bestie",
    title: "Compare your fan type with your bestie",
    description: "Get your share link and find out if you're football besties.",
    reward: 0.5,
    cta: "Get bestie link",
    href: "/card?id=princess&mode=bestie",
  },
  // Boyfriend
  {
    id: "bf_take_quiz",
    category: "boyfriend",
    title: "Make him take the quiz",
    description:
      "Send him the link. Let's see if he survives matchday energy.",
    reward: 0.5,
    cta: "Send boyfriend link",
    href: "/card?id=tactical&mode=boyfriend",
  },
  {
    id: "bf_knows_football",
    category: "boyfriend",
    title: "See if he knows football better than you",
    description: "Tactical Girl vs the boyfriend. May the better fan win.",
    reward: 0.5,
    cta: "Open Tactical Girl",
    href: "/card?id=tactical&mode=boyfriend",
  },
  {
    id: "bf_predict",
    category: "boyfriend",
    title: "Challenge him to predict your fan type",
    description: "If he gets it wrong, he doesn't know you. Make him sweat.",
    reward: 0.5,
    cta: "Challenge him",
    href: "/card?id=chaotic&mode=boyfriend",
  },
  // Girls Group
  {
    id: "girls_drop_in_chat",
    category: "girls",
    title: "Drop your fan type in the group chat",
    description: "Card → groupchat → chaos. Watch the replies roll in.",
    reward: 0.5,
    cta: "Make group card",
    href: "/card?id=princess&mode=girls",
  },
  {
    id: "girls_most_chaotic",
    category: "girls",
    title: "Find the most chaotic girl in the group",
    description: "Send the quiz to all of them. There's only one Chaotic Fan.",
    reward: 0.5,
    cta: "Open Chaotic Fan",
    href: "/card?id=chaotic&mode=girls",
  },
  {
    id: "girls_league",
    category: "girls",
    title: "Start a Fangirl FC league with your friends",
    description: "Compare scores, declare a winner, settle the debate.",
    reward: 0.5,
    cta: "Start league",
    href: "/card?id=loyal&mode=girls",
  },
  // Matchday
  {
    id: "matchday_card",
    category: "matchday",
    title: "Make your matchday card",
    description: "Pick the template that matches today's vibe and save it.",
    reward: 0.5,
    cta: "Make matchday card",
    href: "/card?id=princess",
  },
  {
    id: "matchday_predict",
    category: "matchday",
    title: "Share your match prediction",
    description: "Lock in the W. Manifest the goal. No take-backs.",
    reward: 0.5,
    cta: "Mark predicted",
    href: "#",
  },
  {
    id: "matchday_unlock",
    category: "matchday",
    title: "Unlock one new identity today",
    description: "Retake the quiz with different answers. Reveal a new you.",
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
