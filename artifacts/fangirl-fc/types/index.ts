export type FanIdentityId =
  | "chaotic"
  | "loyal"
  | "soft"
  | "princess"
  | "screamer"
  | "tactical";

export type RarityTier = "common" | "rare" | "iconic" | "legendary";

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
  /** Free-form legacy rarity blurb. */
  rarity: string;
  /** Structured rarity tier (used by RarityBadge). */
  rarityTier: RarityTier;
  /** Fixed percentage of fans (used in copy like "Only 8% get this"). */
  rarityPercent: number;
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

// ---------- Matchday ----------

export type MatchStatus = "upcoming" | "live" | "completed";
export type MatchSide = "A" | "B";
export type PredictionPick = "A" | "B" | "draw";

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  /** Friendly label like "Sat · 9pm" or "Tonight · 8pm". */
  dateLabel: string;
  city: string;
  status: MatchStatus;
  /** Set only when status === "completed". */
  result?: { winner: PredictionPick };
}

export interface Prediction {
  matchId: string;
  pick: PredictionPick;
  createdAt: number;
}

// ---------- Local groups ----------

export interface GroupMember {
  id: string;
  name: string;
  identityId: FanIdentityId;
  stars: number;
  teamCode: string;
}

export interface LocalGroup {
  id: string;
  name: string;
  createdAt: number;
  members: GroupMember[];
}

// ---------- Mock global groups ----------

export interface GlobalGroup {
  id: string;
  name: string;
  country: string;
  flag: string;
  averageStars: number;
  membersCount: number;
  dominantIdentity: FanIdentityId;
}

// ---------- Callouts ----------

export type CalloutTarget = "bestie" | "boyfriend" | "girls" | "everyone";

export interface CalloutDraft {
  friendName: string;
  identityId: FanIdentityId;
  target: CalloutTarget;
}
