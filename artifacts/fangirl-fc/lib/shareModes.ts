"use client";

import type { ShareMode } from "@/types";

export interface ShareModeMeta {
  id: ShareMode;
  label: string;
  emoji: string;
  short: string;
  /** Captions for the share-caption picker, with {identity} placeholder. */
  captions: string[];
  /** Headline shown on the compare page when this mode is opened. */
  compareHeadline: (identityTitle: string) => string;
  /** Funny compatibility labels rotated by combo hash. */
  labels: string[];
}

export const SHARE_MODES: Record<ShareMode, ShareModeMeta> = {
  bestie: {
    id: "bestie",
    label: "Bestie",
    emoji: "💖",
    short: "Send to your bestie",
    captions: [
      "this is literally me 😭 what are you?",
      "take the quiz and compare with me",
      "I got {identity}. you're definitely Chaotic Fan.",
    ],
    compareHeadline: (t) => `Your bestie got ${t}. Now find yours.`,
    labels: [
      "Football Besties",
      "Chaos Duo",
      "Matchday Twins",
      "Loyal + Chaotic",
      "Drama Sisters",
    ],
  },
  boyfriend: {
    id: "boyfriend",
    label: "Boyfriend",
    emoji: "💘",
    short: "Send to your boyfriend",
    captions: [
      "I got {identity}. let's see if you actually know football.",
      "take this quiz and prove you understand my matchday chaos",
      "if you get Tactical Girl, I'm concerned",
    ],
    compareHeadline: (t) => `She got ${t}. Can you match her energy?`,
    labels: [
      "She Knows Ball",
      "He Survived Matchday",
      "Chaos vs Logic",
      "She Carries the Vibes",
      "Relationship Derby",
    ],
  },
  girls: {
    id: "girls",
    label: "Girls Group",
    emoji: "👯‍♀️",
    short: "Send to the girls",
    captions: [
      "girls, which World Cup fan are you?",
      "take the quiz and drop your fan type",
      "who is the most chaotic in the group?",
    ],
    compareHeadline: () => "Your group challenge starts here.",
    labels: [
      "Group Chat Champions",
      "Screamer Squad",
      "Vibe League",
      "Penalty Drama Club",
      "Bestie Cup Final",
    ],
  },
  public: {
    id: "public",
    label: "Everyone",
    emoji: "🌍",
    short: "Share with everyone",
    captions: [
      "which fan are you?",
      "make your Fangirl FC card",
      "tag the friend who screams at football",
    ],
    compareHeadline: () => "Find your World Cup fan type.",
    labels: ["World Cup Match", "Fan Energy Match", "Stadium Vibes"],
  },
};

export const SHARE_MODE_LIST: ShareModeMeta[] = [
  SHARE_MODES.bestie,
  SHARE_MODES.boyfriend,
  SHARE_MODES.girls,
  SHARE_MODES.public,
];

export function getShareMode(mode: string | null | undefined): ShareModeMeta {
  if (!mode) return SHARE_MODES.public;
  return SHARE_MODES[mode as ShareMode] ?? SHARE_MODES.public;
}

export function fillCaption(template: string, identityTitle: string): string {
  return template.replace(/\{identity\}/g, identityTitle);
}

/** Pick a label deterministically from a mode's pool based on the identity combo. */
export function pickModeLabel(mode: ShareMode, a: string, b: string): string {
  const meta = SHARE_MODES[mode];
  const key = [a, b].sort().join("_");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return meta.labels[hash % meta.labels.length]!;
}
