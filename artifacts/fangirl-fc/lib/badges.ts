export type BadgeId =
  | "penalty_queen"
  | "ice_cold_finisher"
  | "perfect_shot"
  | "pressure_proof"
  | "comeback_girl"
  | "no_miss_energy"
  | "rules_rookie"
  | "she_knows_ball"
  | "offside_survivor"
  | "var_girl"
  | "tactical_mind"
  | "bestie_challenge"
  | "squad_energy"
  | "group_chat_icon"
  | "team_captain";

export type BadgeCategory =
  | "penalty"
  | "football_iq"
  | "social";

export interface BadgeDef {
  id: BadgeId;
  name: string;
  emoji: string;
  description: string;
  category: BadgeCategory;
}

export const BADGE_DEFS: Record<BadgeId, BadgeDef> = {
  penalty_queen: {
    id: "penalty_queen",
    name: "Penalty Queen",
    emoji: "👑",
    description: "Score 2 of 3 in a penalty session",
    category: "penalty",
  },
  ice_cold_finisher: {
    id: "ice_cold_finisher",
    name: "Ice Cold Finisher",
    emoji: "🧊",
    description: "Score 3 of 3, all aimed at the corners",
    category: "penalty",
  },
  perfect_shot: {
    id: "perfect_shot",
    name: "Perfect Shot",
    emoji: "⚡",
    description: "Land a perfect-power shot in the top corner",
    category: "penalty",
  },
  pressure_proof: {
    id: "pressure_proof",
    name: "Pressure Proof",
    emoji: "💪",
    description: "Score the deciding final penalty when you needed it",
    category: "penalty",
  },
  comeback_girl: {
    id: "comeback_girl",
    name: "Comeback Girl",
    emoji: "🔥",
    description: "Score after missing your first two attempts",
    category: "penalty",
  },
  no_miss_energy: {
    id: "no_miss_energy",
    name: "No Miss Energy",
    emoji: "🎯",
    description: "Complete a full session without missing a single shot",
    category: "penalty",
  },
  rules_rookie: {
    id: "rules_rookie",
    name: "Rules Rookie",
    emoji: "📖",
    description: "Answer your first Football IQ question",
    category: "football_iq",
  },
  she_knows_ball: {
    id: "she_knows_ball",
    name: "She Knows Ball",
    emoji: "⚽",
    description: "Answer 5 Football IQ questions correctly",
    category: "football_iq",
  },
  offside_survivor: {
    id: "offside_survivor",
    name: "Offside Survivor",
    emoji: "🚩",
    description: "Correctly answer 3 offside-rule questions",
    category: "football_iq",
  },
  var_girl: {
    id: "var_girl",
    name: "VAR Girl",
    emoji: "📺",
    description: "Get 3 VAR decisions right in a row",
    category: "football_iq",
  },
  tactical_mind: {
    id: "tactical_mind",
    name: "Tactical Mind",
    emoji: "🧠",
    description: "Complete the full Football IQ quiz with 80%+ accuracy",
    category: "football_iq",
  },
  bestie_challenge: {
    id: "bestie_challenge",
    name: "Bestie Challenge",
    emoji: "💖",
    description: "Send your Fangirl Card to a bestie",
    category: "social",
  },
  squad_energy: {
    id: "squad_energy",
    name: "Squad Energy",
    emoji: "👯",
    description: "Share your result in the Girls group mode",
    category: "social",
  },
  group_chat_icon: {
    id: "group_chat_icon",
    name: "Group Chat Icon",
    emoji: "💬",
    description: "Get your card compared by 3+ friends",
    category: "social",
  },
  team_captain: {
    id: "team_captain",
    name: "Team Captain",
    emoji: "🏆",
    description: "Reach the top 10 in your team's ranking",
    category: "social",
  },
};

export const BADGE_LIST: BadgeDef[] = Object.values(BADGE_DEFS);

export function getBadge(id: BadgeId): BadgeDef {
  return BADGE_DEFS[id];
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDef[] {
  return BADGE_LIST.filter((b) => b.category === category);
}
