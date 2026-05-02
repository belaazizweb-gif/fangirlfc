import type { Template } from "@/types";

// Each template id corresponds to one of the 6 identities.
// Layouts are hand-built per id in components/FanCard.tsx — these meta
// values are only used for the picker swatch + share record persistence.
export const TEMPLATES: Template[] = [
  {
    id: "soft-girl",
    name: "Soft Girl",
    description: "Pastel · Pinterest · sparkly polaroid",
    background:
      "linear-gradient(160deg, #ffe4ec 0%, #f3d7ff 50%, #fff1c4 100%)",
    cardClass: "text-rose-900",
    accent: "#be185d",
    text: "#3f0d28",
    badge: "bg-white/70 text-rose-700",
  },
  {
    id: "chaotic-neon",
    name: "Chaotic Neon",
    description: "Glitch · neon · broken grid",
    background:
      "linear-gradient(160deg, #1b0033 0%, #5b00b3 45%, #ff00d4 100%)",
    cardClass: "text-fuchsia-100",
    accent: "#5eead4",
    text: "#ffffff",
    badge: "bg-fuchsia-400/20 text-fuchsia-100",
  },
  {
    id: "loyal-queen",
    name: "Loyal Queen",
    description: "Black + gold · luxury badge",
    background:
      "linear-gradient(160deg, #050505 0%, #1a1306 55%, #3d2c0a 100%)",
    cardClass: "text-amber-200",
    accent: "#facc15",
    text: "#fef3c7",
    badge: "bg-amber-400/15 text-amber-200",
  },
  {
    id: "matchday-princess",
    name: "Matchday Princess",
    description: "IG story · soft UI · pink",
    background:
      "linear-gradient(160deg, #ffd2e5 0%, #ff8fc3 55%, #ffe7a8 100%)",
    cardClass: "text-rose-900",
    accent: "#a21567",
    text: "#3a0a30",
    badge: "bg-white/60 text-rose-800",
  },
  {
    id: "last-minute-screamer",
    name: "Last Minute Screamer",
    description: "Meme · big text · chaos",
    background:
      "linear-gradient(160deg, #ffef3a 0%, #ff6f3a 55%, #c9001a 100%)",
    cardClass: "text-black",
    accent: "#000000",
    text: "#0a0a0a",
    badge: "bg-black/80 text-yellow-300",
  },
  {
    id: "tactical-girl",
    name: "Tactical Girl",
    description: "Minimal · stats · dashboard",
    background:
      "linear-gradient(160deg, #0b0f17 0%, #111827 55%, #0b0f17 100%)",
    cardClass: "text-white",
    accent: "#22d3ee",
    text: "#e5e7eb",
    badge: "bg-cyan-400/15 text-cyan-200",
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

// Recommend a template for each identity (used when linking from result page).
export const IDENTITY_DEFAULT_TEMPLATE: Record<string, string> = {
  soft: "soft-girl",
  chaotic: "chaotic-neon",
  loyal: "loyal-queen",
  princess: "matchday-princess",
  screamer: "last-minute-screamer",
  tactical: "tactical-girl",
};
