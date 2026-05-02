import type { FanIdentity, FanIdentityId } from "@/types";

export const FAN_TYPES: Record<FanIdentityId, FanIdentity> = {
  chaotic: {
    id: "chaotic",
    title: "Chaotic Fan",
    emoji: "⚡",
    slogan: "I support my team… and the drama.",
    description:
      "You scream, you cry, you yell at the screen. Your group chat is unhinged on matchdays and you wouldn't have it any other way.",
    rarity: "Rare drop · 1 in 12 fans",
    defaultStats: [
      { label: "Mood Swings", value: "100%" },
      { label: "Screams", value: "MAX" },
      { label: "Matchday Energy", value: "UNSTABLE" },
    ],
    vibes: [
      "I scream at my TV",
      "My groupchat is unhinged",
      "I cry. I yell. I stay.",
    ],
    shareTrigger: "tag your loudest friend",
    colors: {
      bg: "from-purple-700 via-fuchsia-600 to-pink-500",
      accent: "#facc15",
      text: "#ffffff",
    },
  },
  loyal: {
    id: "loyal",
    title: "Loyal Queen",
    emoji: "👑",
    slogan: "Win or lose, I'm staying.",
    description:
      "Ride or die. You don't switch teams when they lose, you don't fake it, and you outlast every bandwagon fan in the room.",
    rarity: "Royal tier · top 8% of fans",
    defaultStats: [
      { label: "Loyalty", value: "100%" },
      { label: "Haters Blocked", value: "YES" },
      { label: "Missed Matches", value: "0" },
    ],
    vibes: [
      "I will defend my team no matter what",
      "I never switched sides",
      "Win or lose, I'm here",
    ],
    shareTrigger: "tag your ride or die",
    colors: {
      bg: "from-amber-300 via-yellow-400 to-rose-200",
      accent: "#1f2937",
      text: "#1f2937",
    },
  },
  soft: {
    id: "soft",
    title: "Soft Fan",
    emoji: "🌸",
    slogan: "I said I wouldn't care… I lied.",
    description:
      "You swore you weren't into football. Then they lost on penalties and you cried on the bathroom floor. We see you.",
    rarity: "Sweet tier · 1 in 9 fans",
    defaultStats: [
      { label: "Cries After Loss", value: "YES" },
      { label: "Loyalty", value: "∞" },
      { label: "Stress Level", value: "CUTE" },
    ],
    vibes: [
      "I said I don't care… I lied",
      "I cry over football matches",
      "Pretending I'm chill",
    ],
    shareTrigger: "this is literally me 😭",
    colors: {
      bg: "from-pink-200 via-rose-200 to-violet-200",
      accent: "#be185d",
      text: "#3f0d28",
    },
  },
  princess: {
    id: "princess",
    title: "Matchday Princess",
    emoji: "💅",
    slogan: "I came for the vibes and stayed for the chaos.",
    description:
      "Outfit planned, nails done, photos staged. You're here for the spectacle and the score is just a backdrop to your story.",
    rarity: "Iconic tier · 1 in 14 fans",
    defaultStats: [
      { label: "Outfit Planning", value: "10/10" },
      { label: "Selfies", value: "100%" },
      { label: "Vibes", value: "IMMACULATE" },
    ],
    vibes: [
      "Outfit planned, score optional",
      "Here for the vibes",
      "My selfies are immaculate",
    ],
    shareTrigger: "which one are you?",
    colors: {
      bg: "from-fuchsia-400 via-pink-300 to-amber-200",
      accent: "#7c1d6f",
      text: "#3a0a30",
    },
  },
  screamer: {
    id: "screamer",
    title: "Last Minute Screamer",
    emoji: "😭",
    slogan: "Football is not a sport, it's trauma.",
    description:
      "Stoppage time turns you into a creature. The neighbours know your team's name. You've lost your voice three times this season.",
    rarity: "Iconic tier · 1 in 11 fans",
    defaultStats: [
      { label: "Anxiety", value: "99%" },
      { label: "Screams", value: "100%" },
      { label: "Tears", value: "GUARANTEED" },
    ],
    vibes: [
      "Stoppage time turns me feral",
      "The neighbours know",
      "I lost my voice again",
    ],
    shareTrigger: "tag your screamer bestie",
    colors: {
      bg: "from-red-500 via-orange-400 to-yellow-300",
      accent: "#ffffff",
      text: "#ffffff",
    },
  },
  tactical: {
    id: "tactical",
    title: "Tactical Girl",
    emoji: "🧠",
    slogan: "Cute, but I actually know ball.",
    description:
      "You called the formation change before the manager did. You quote xG. You will not be talked over at the bar.",
    rarity: "Galaxy tier · top 5% of fans",
    defaultStats: [
      { label: "Ball Knowledge", value: "95%" },
      { label: "Predictions", value: "SHARP" },
      { label: "Confidence", value: "HIGH" },
    ],
    vibes: [
      "Cute, but I know ball",
      "I called the formation change",
      "I quote xG unprompted",
    ],
    shareTrigger: "tag a tactical girl",
    colors: {
      bg: "from-slate-900 via-indigo-900 to-fuchsia-800",
      accent: "#fbbf24",
      text: "#ffffff",
    },
  },
};

export const FAN_TYPE_LIST = Object.values(FAN_TYPES);

export function getFanType(id: FanIdentityId): FanIdentity {
  return FAN_TYPES[id];
}
