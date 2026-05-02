import type { Template } from "@/types";

export const TEMPLATES: Template[] = [
  {
    id: "soft-girl",
    name: "Soft Girl",
    description: "pastel pink, lavender, gold sparkle",
    background:
      "linear-gradient(160deg, #ffe4ec 0%, #f3d7ff 50%, #fff1c4 100%)",
    cardClass: "text-rose-900",
    accent: "#be185d",
    text: "#3f0d28",
    badge: "bg-white/70 text-rose-700",
  },
  {
    id: "dark-academia",
    name: "Dark Academia",
    description: "black velvet, gold trim, ivory",
    background:
      "linear-gradient(160deg, #0f0f10 0%, #1c1410 60%, #2b1d12 100%)",
    cardClass: "text-amber-100",
    accent: "#f5e1a4",
    text: "#f5e1a4",
    badge: "bg-amber-200/15 text-amber-100",
  },
  {
    id: "stadium-sunset",
    name: "Stadium Sunset",
    description: "orange, pink, purple gradient",
    background:
      "linear-gradient(165deg, #ff6a3d 0%, #ff3da6 45%, #6f3dff 100%)",
    cardClass: "text-white",
    accent: "#ffe27a",
    text: "#ffffff",
    badge: "bg-white/20 text-white",
  },
  {
    id: "classic-fut",
    name: "Classic FUT",
    description: "black + gold, sporty vibe",
    background:
      "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 50%, #2a1a00 100%)",
    cardClass: "text-amber-300",
    accent: "#fbbf24",
    text: "#fde68a",
    badge: "bg-amber-400/15 text-amber-200",
  },
  {
    id: "chaotic-neon",
    name: "Chaotic Neon",
    description: "purple, neon, Gen Z TikTok",
    background:
      "linear-gradient(160deg, #1b0033 0%, #5b00b3 50%, #ff00d4 100%)",
    cardClass: "text-fuchsia-100",
    accent: "#5eead4",
    text: "#ffffff",
    badge: "bg-fuchsia-400/20 text-fuchsia-100",
  },
  {
    id: "loyal-queen",
    name: "Loyal Queen",
    description: "royal gold + white, crown accent",
    background:
      "linear-gradient(160deg, #fef9c3 0%, #fde68a 45%, #f59e0b 100%)",
    cardClass: "text-amber-950",
    accent: "#7c2d12",
    text: "#451a03",
    badge: "bg-amber-900/15 text-amber-950",
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
