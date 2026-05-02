import type { GlobalGroup, LocalGroup } from "@/types";
import { groupAverageStars, dominantIdentity } from "./groups";
import { FAN_TYPES } from "./fanTypes";

export const GLOBAL_GROUPS: GlobalGroup[] = [
  {
    id: "morocco-girls-squad",
    name: "Morocco Girls Squad",
    country: "Morocco",
    flag: "🇲🇦",
    averageStars: 4.4,
    membersCount: 28,
    dominantIdentity: "loyal",
  },
  {
    id: "brazil-chaos-club",
    name: "Brazil Chaos Club",
    country: "Brazil",
    flag: "🇧🇷",
    averageStars: 4.7,
    membersCount: 41,
    dominantIdentity: "chaotic",
  },
  {
    id: "mexico-matchday-queens",
    name: "Mexico Matchday Queens",
    country: "Mexico",
    flag: "🇲🇽",
    averageStars: 4.2,
    membersCount: 33,
    dominantIdentity: "princess",
  },
  {
    id: "france-loyal-crew",
    name: "France Loyal Crew",
    country: "France",
    flag: "🇫🇷",
    averageStars: 3.9,
    membersCount: 19,
    dominantIdentity: "loyal",
  },
  {
    id: "argentina-drama-fc",
    name: "Argentina Drama FC",
    country: "Argentina",
    flag: "🇦🇷",
    averageStars: 4.5,
    membersCount: 36,
    dominantIdentity: "screamer",
  },
];

export interface BattleResult {
  yourScore: number;
  theirScore: number;
  winnerLabel: string;
  flavor: string;
}

/**
 * Mock battle scoring: combines avg stars, member count, and an identity
 * "energy" multiplier to keep things spicy. Deterministic per group pair.
 */
const IDENTITY_ENERGY: Record<string, number> = {
  chaotic: 1.15,
  screamer: 1.12,
  princess: 1.05,
  tactical: 1.02,
  loyal: 1.0,
  soft: 0.95,
};

function scoreGlobal(g: GlobalGroup): number {
  const energy =
    IDENTITY_ENERGY[g.dominantIdentity] ?? 1.0;
  return (
    g.averageStars * 18 + Math.min(g.membersCount, 50) * 0.4 + energy * 5
  );
}

function scoreLocal(group: LocalGroup): number {
  const avg = groupAverageStars(group);
  const dom = dominantIdentity(group);
  const energy = dom ? (IDENTITY_ENERGY[dom] ?? 1.0) : 1.0;
  return (
    avg * 18 + Math.min(group.members.length, 50) * 0.4 + energy * 5
  );
}

export function battle(
  yourGroup: LocalGroup,
  global: GlobalGroup,
): BattleResult {
  const yourScore = scoreLocal(yourGroup);
  const theirScore = scoreGlobal(global);
  const yourDom = dominantIdentity(yourGroup);
  const theirDomTitle = FAN_TYPES[global.dominantIdentity]?.title ?? "fans";

  let winnerLabel: string;
  let flavor: string;
  if (yourScore > theirScore + 1) {
    winnerLabel = "Your squad wins";
    flavor = yourDom
      ? `Your ${FAN_TYPES[yourDom]?.title ?? "squad"} energy is unmatched.`
      : "Your squad is more chaotic.";
  } else if (theirScore > yourScore + 1) {
    winnerLabel = `${global.name} wins`;
    flavor = `They have higher fan energy — ${theirDomTitle.toLowerCase()} dominates.`;
  } else {
    winnerLabel = "It's a tie";
    flavor = "Two iconic squads, equally unhinged.";
  }

  return {
    yourScore: Math.round(yourScore),
    theirScore: Math.round(theirScore),
    winnerLabel,
    flavor,
  };
}
