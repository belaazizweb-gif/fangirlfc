export type FanIdentityId =
  | "chaotic"
  | "loyal"
  | "soft"
  | "princess"
  | "screamer"
  | "tactical";

export interface FanStat {
  label: string;
  value: string;
}

export interface FanIdentity {
  id: FanIdentityId;
  title: string;
  emoji: string;
  slogan: string;
  description: string;
  rarity: string;
  defaultStats: FanStat[];
  /** Short, meme-y, first-person lines used on the card. */
  vibes: string[];
  /** Tiny prompt at the bottom of the card to trigger sharing. */
  shareTrigger: string;
  colors: {
    bg: string;
    accent: string;
    text: string;
  };
}

export interface QuizOption {
  label: string;
  text: string;
  weights: Partial<Record<FanIdentityId, number>>;
}

export interface QuizQuestion {
  id: number;
  prompt: string;
  options: QuizOption[];
}

export interface Team {
  code: string;
  name: string;
  flag: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  background: string;
  cardClass: string;
  accent: string;
  text: string;
  badge: string;
}

export interface ShareRecord {
  shareId: string;
  identityId: FanIdentityId;
  stars: number;
  teamCode: string;
  displayName: string;
  templateId: string;
  createdAt: number;
}

export type ShareMode = "bestie" | "boyfriend" | "girls" | "public";

export type SelfieFit = "fit" | "portrait" | "fill";

export interface SelfieAdjust {
  fit: SelfieFit;
  zoom: number;
}

export interface QuizResult {
  identityId: FanIdentityId;
  scores: Record<FanIdentityId, number>;
  answers: number[];
}
