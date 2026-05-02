import type { FanIdentity, RarityTier } from "@/types";

export interface RarityMeta {
  tier: RarityTier;
  label: string;
  short: string;
  /** Tailwind-friendly gradient classes (background). */
  gradient: string;
  /** Border accent. */
  border: string;
  /** Text color. */
  text: string;
  emoji: string;
}

export const RARITY_META: Record<RarityTier, RarityMeta> = {
  common: {
    tier: "common",
    label: "Common",
    short: "Common",
    gradient: "from-white/15 to-white/5",
    border: "border-white/20",
    text: "text-white/90",
    emoji: "✿",
  },
  rare: {
    tier: "rare",
    label: "Rare drop",
    short: "Rare",
    gradient: "from-pink-400/30 to-fuchsia-400/15",
    border: "border-pink-300/50",
    text: "text-pink-50",
    emoji: "💎",
  },
  iconic: {
    tier: "iconic",
    label: "Iconic tier",
    short: "Iconic",
    gradient: "from-amber-300/30 to-rose-300/15",
    border: "border-amber-300/60",
    text: "text-amber-50",
    emoji: "👑",
  },
  legendary: {
    tier: "legendary",
    label: "Legendary",
    short: "Legendary",
    gradient: "from-fuchsia-500/40 via-amber-300/25 to-cyan-400/20",
    border: "border-fuchsia-300/70",
    text: "text-white",
    emoji: "🌟",
  },
};

export function rarityHook(identity: FanIdentity): string {
  switch (identity.rarityTier) {
    case "legendary":
      return `Legendary · only ${identity.rarityPercent}% get this`;
    case "iconic":
      return `Iconic tier · only ${identity.rarityPercent}% get this`;
    case "rare":
      return `Rare drop · ${identity.rarityPercent}% of fans`;
    case "common":
      return `Common tier · ${identity.rarityPercent}% of fans`;
  }
}
