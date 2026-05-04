export interface PersonalityPreset {
  id: string;
  typeName: string;
  emoji: string;
  bullets: [string, string, string];
  quote: string;
  cta: string;
  footerTag: string;
  templateId: string;
}

export const PERSONALITY_PRESETS: PersonalityPreset[] = [
  {
    id: "matchday-princess",
    typeName: "Matchday Princess",
    emoji: "💅",
    bullets: [
      "spends more time on the outfit than the lineup",
      "posts more stories than goals scored",
      "friends ask the score, I send a selfie",
    ],
    quote: "I came for the vibes and stayed for the chaos",
    cta: "tag a princess 💅",
    footerTag: "#MatchdayPrincess",
    templateId: "matchday-princess",
  },
  {
    id: "chaotic-fan",
    typeName: "Chaotic Fan",
    emoji: "⚡",
    bullets: [
      "screams at the TV like the players can hear me",
      "celebrates a goal then realises it's offside",
      "group chat goes silent when we lose",
    ],
    quote: "football is not a sport, it's trauma",
    cta: "tag your loudest friend 📣",
    footerTag: "#ChaoticFan",
    templateId: "chaotic-neon",
  },
  {
    id: "lowkey-obsessed",
    typeName: "Lowkey Obsessed",
    emoji: "🫠",
    bullets: [
      "says she doesn't care then refreshes the score every 30 seconds",
      "knows every player but pretends she doesn't",
      "cries quietly in the bathroom after penalties",
    ],
    quote: "I'm not obsessed I just think about it all the time",
    cta: "tag the lowkey one 🫠",
    footerTag: "#LowkeyObsessed",
    templateId: "soft-girl",
  },
  {
    id: "delulu-supporter",
    typeName: "Delulu Supporter",
    emoji: "✨",
    bullets: [
      "genuinely believes her team can come back from 4-0",
      "already planned the victory parade three times",
      "manifests results harder than she studies for exams",
    ],
    quote: "delulu is the solulu when your team is losing",
    cta: "tag a fellow believer ✨",
    footerTag: "#DeluluSupporter",
    templateId: "matchday-princess",
  },
  {
    id: "main-character-fan",
    typeName: "Main Character Fan",
    emoji: "👑",
    bullets: [
      "the group watch party revolves around her energy",
      "her reaction shots hit harder than the highlights",
      "the camera always finds her in the stadium somehow",
    ],
    quote: "the World Cup needs me more than I need it",
    cta: "tag the main character 👑",
    footerTag: "#MainCharacterFan",
    templateId: "loyal-queen",
  },
  {
    id: "overthinker-fan",
    typeName: "Overthinker Fan",
    emoji: "🧠",
    bullets: [
      "already pre-grieved the loss before kickoff",
      "analyzes the formation in the group chat at midnight",
      "writes match predictions in her notes app",
    ],
    quote: "I've already simulated 47 ways this can go wrong",
    cta: "tag the overthinker 🧠",
    footerTag: "#OverthinkerFan",
    templateId: "tactical-girl",
  },
  {
    id: "loyal-bestie",
    typeName: "Loyal Bestie",
    emoji: "🫶",
    bullets: [
      "defends her team when even her friends have given up",
      "never switched allegiances, not even during the bad years",
      "matching jerseys with her bestie since forever",
    ],
    quote: "win or lose, I'm still wearing the shirt",
    cta: "tag your ride or die 🫶",
    footerTag: "#LoyalBestie",
    templateId: "loyal-queen",
  },
  {
    id: "red-flag-fan",
    typeName: "Red Flag Fan",
    emoji: "🚩",
    bullets: [
      "boos her own team but fights anyone who criticises them",
      "switches from 'we' to 'they' the second things go wrong",
      "argues with fans of teams she doesn't even support",
    ],
    quote: "I can talk about my team like that — you can't",
    cta: "you know who this is 🚩",
    footerTag: "#RedFlagFan",
    templateId: "last-minute-screamer",
  },
  {
    id: "soft-girl-fan",
    typeName: "Soft Girl Fan",
    emoji: "🌸",
    bullets: [
      "said \"I don't care\" then cried in her friend's car",
      "texts \"are you okay?\" to the group chat after a loss",
      "pretends she's chill, refreshes the score every 30 seconds",
    ],
    quote: "I said I wouldn't care. I lied.",
    cta: "send this to your bestie 🌸",
    footerTag: "#SoftGirlFan",
    templateId: "soft-girl",
  },
  {
    id: "unhinged-fan",
    typeName: "Unhinged Fan",
    emoji: "😵",
    bullets: [
      "sent 47 messages in the group chat in the last 5 minutes of the match",
      "the neighbours know the scoreline before checking the app",
      "therapist has banned match discussions from their sessions",
    ],
    quote: "I'm completely normal about football — help",
    cta: "we're all unhinged here 😵",
    footerTag: "#UnhingedFan",
    templateId: "chaotic-neon",
  },
];

export function getPreset(id: string): PersonalityPreset | undefined {
  return PERSONALITY_PRESETS.find((p) => p.id === id);
}
