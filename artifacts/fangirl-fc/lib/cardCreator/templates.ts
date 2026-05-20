import type { CardTemplateId } from "./templateConfig";

export interface CardCreatorTemplate {
  id: CardTemplateId;
  name: string;
  category: string;
  family: string;
  enabled: boolean;
  thumbnail: string;
  background: string;
  overlay: string;
}

export const CARD_CREATOR_TEMPLATES: CardCreatorTemplate[] = [
  {
    id: "gold_crystal_2026",
    name: "Gold Crystal 2026",
    category: "classic",
    family: "premium_crystal",
    enabled: true,
    thumbnail:  "/templates/gold_crystal_2026/thumbnail.png",
    background: "/templates/gold_crystal_2026/background.png",
    overlay:    "/templates/gold_crystal_2026/overlay.png",
  },
  {
    id: "silver_classic_2026",
    name: "Silver Classic 2026",
    category: "classic",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/silver_classic_2026/thumbnail.png",
    background: "/templates/silver_classic_2026/background.png",
    overlay:    "/templates/silver_classic_2026/overlay.png",
  },
  {
    id: "gold_elite_2026",
    name: "Gold Elite 2026",
    category: "classic",
    family: "premium_gold",
    enabled: true,
    thumbnail:  "/templates/gold_elite_2026/thumbnail.png",
    background: "/templates/gold_elite_2026/background.png",
    overlay:    "/templates/gold_elite_2026/overlay.png",
  },
  {
    id: "silver_chrome_2026",
    name: "Silver Chrome 2026",
    category: "classic",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/silver_chrome_2026/thumbnail.png",
    background: "/templates/silver_chrome_2026/background.png",
    overlay:    "/templates/silver_chrome_2026/overlay.png",
  },
  {
    id: "black_elite_2026",
    name: "Black Elite 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/black_elite_2026/thumbnail.png",
    background: "/templates/black_elite_2026/background.png",
    overlay:    "/templates/black_elite_2026/overlay.png",
  },
  {
    id: "blue_electric_2026",
    name: "Blue Electric 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/blue_electric_2026/thumbnail.png",
    background: "/templates/blue_electric_2026/background.png",
    overlay:    "/templates/blue_electric_2026/overlay.png",
  },
  {
    id: "purple_holo_2026",
    name: "Purple Holo 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/purple_holo_2026/thumbnail.png",
    background: "/templates/purple_holo_2026/background.png",
    overlay:    "/templates/purple_holo_2026/overlay.png",
  },
  {
    id: "red_fire_2026",
    name: "Red Fire 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    thumbnail:  "/templates/red_fire_2026/thumbnail.png",
    background: "/templates/red_fire_2026/background.png",
    overlay:    "/templates/red_fire_2026/overlay.png",
  },
  {
    id: "usa_host_2026",
    name: "USA Host 2026",
    category: "host",
    family: "world_cup_host",
    enabled: false,
    thumbnail:  "/templates/usa_host_2026/thumbnail.png",
    background: "/templates/usa_host_2026/background.png",
    overlay:    "/templates/usa_host_2026/overlay.png",
  },
  {
    id: "world_edition_2026",
    name: "World Edition 2026",
    category: "world_cup",
    family: "world_cup_neutral",
    enabled: true,
    thumbnail:  "/templates/world_edition_2026/thumbnail.png",
    background: "/templates/world_edition_2026/background.png",
    overlay:    "/templates/world_edition_2026/overlay.png",
  },
  {
    id: "fangirl_pink_2026",
    name: "Fangirl Pink 2026",
    category: "fangirl",
    family: "fangirl_soft",
    enabled: true,
    thumbnail:  "/templates/fangirl_pink_2026/thumbnail.png",
    background: "/templates/fangirl_pink_2026/background.png",
    overlay:    "/templates/fangirl_pink_2026/overlay.png",
  },
  {
    id: "green_stadium_2026",
    name: "Green Stadium 2026",
    category: "football",
    family: "stadium_green_gold",
    enabled: true,
    thumbnail:  "/templates/green_stadium_2026/thumbnail.png",
    background: "/templates/green_stadium_2026/background.png",
    overlay:    "/templates/green_stadium_2026/overlay.png",
  },
];
