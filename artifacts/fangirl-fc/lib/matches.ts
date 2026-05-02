import type { Match } from "@/types";

export const MATCHES: Match[] = [
  {
    id: "bra-fra",
    teamA: "Brazil",
    teamB: "France",
    flagA: "🇧🇷",
    flagB: "🇫🇷",
    dateLabel: "Tonight · 9pm",
    city: "Mexico City",
    status: "upcoming",
  },
  {
    id: "mar-esp",
    teamA: "Morocco",
    teamB: "Spain",
    flagA: "🇲🇦",
    flagB: "🇪🇸",
    dateLabel: "Sat · 6pm",
    city: "Toronto",
    status: "live",
  },
  {
    id: "arg-eng",
    teamA: "Argentina",
    teamB: "England",
    flagA: "🇦🇷",
    flagB: "🇬🇧",
    dateLabel: "Sun · 9pm",
    city: "Los Angeles",
    status: "upcoming",
  },
  {
    id: "usa-mex",
    teamA: "USA",
    teamB: "Mexico",
    flagA: "🇺🇸",
    flagB: "🇲🇽",
    dateLabel: "Mon · 8pm",
    city: "Dallas",
    status: "completed",
    result: { winner: "B" },
  },
  {
    id: "jpn-ger",
    teamA: "Japan",
    teamB: "Germany",
    flagA: "🇯🇵",
    flagB: "🇩🇪",
    dateLabel: "Tue · 12pm",
    city: "Boston",
    status: "completed",
    result: { winner: "draw" },
  },
];

export function getMatch(id: string): Match | null {
  return MATCHES.find((m) => m.id === id) ?? null;
}

/** Short, capitalised line for cards: "Tonight: Brazil vs France". */
export function matchHeadline(m: Match): string {
  const prefix =
    m.status === "live"
      ? "Live"
      : m.status === "upcoming"
        ? "Tonight"
        : "Matchday";
  return `${prefix}: ${m.teamA} vs ${m.teamB}`;
}

export function winnerName(m: Match): string {
  if (!m.result) return "—";
  if (m.result.winner === "draw") return "Draw";
  return m.result.winner === "A" ? m.teamA : m.teamB;
}

export function predictionLabel(
  m: Match,
  pick: "A" | "B" | "draw",
): string {
  if (pick === "draw") return "Draw";
  if (pick === "A") return `${m.teamA} wins`;
  return `${m.teamB} wins`;
}
