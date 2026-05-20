export type CardTemplateId =
  | "gold_crystal_2026"
  | "silver_classic_2026"
  | "gold_elite_2026"
  | "silver_chrome_2026"
  | "black_elite_2026"
  | "blue_electric_2026"
  | "purple_holo_2026"
  | "red_fire_2026"
  | "usa_host_2026"
  | "world_edition_2026"
  | "fangirl_pink_2026"
  | "green_stadium_2026";

export interface CardLayoutDefinition {
  rating:   { x: number; y: number; fontSize: number; fontFamily: string; fontWeight: string };
  position: { x: number; y: number; fontSize: number; fontFamily: string; fontWeight: string };
  flag:     { x: number; y: number; width: number; height: number };
  name:     { x: number; y: number; fontSize: number; fontFamily: string; fontWeight: string; align: string };
  stats:    { startX: number; startY: number; colGap: number; rowGap: number; fontSize: number; labelFontSize: number };
  photo:    { x: number; y: number; width: number; height: number };
}

export interface CardTemplateDefinition {
  id: CardTemplateId;
  name: string;
  category: string;
  enabled: boolean;
  assets: {
    source: string;
    background: string;
    overlay: string;
    thumbnail: string;
  };
  textColor: string;
  shadow: boolean;
  layout: CardLayoutDefinition;
}

export const CARD_TEMPLATE_CONFIG = {
  version: "4",
  canvas: { width: 1086, height: 1448 },
  renderingOrder: [
    "background",
    "photo",
    "overlay",
    "rating_position_flag_badge",
    "player_name",
    "stats",
  ],
  templates: [
    {
      id: "gold_crystal_2026" as const,
      name: "Gold Crystal 2026",
      category: "crystal",
      enabled: true,
      assets: {
        source:     "/templates/gold_crystal_2026/source.png",
        background: "/templates/gold_crystal_2026/background.png",
        overlay:    "/templates/gold_crystal_2026/overlay.png",
        thumbnail:  "/templates/gold_crystal_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "silver_classic_2026" as const,
      name: "Silver Classic 2026",
      category: "classic",
      enabled: true,
      assets: {
        source:     "/templates/silver_classic_2026/source.png",
        background: "/templates/silver_classic_2026/background.png",
        overlay:    "/templates/silver_classic_2026/overlay.png",
        thumbnail:  "/templates/silver_classic_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "gold_elite_2026" as const,
      name: "Gold Elite 2026",
      category: "elite",
      enabled: true,
      assets: {
        source:     "/templates/gold_elite_2026/source.png",
        background: "/templates/gold_elite_2026/background.png",
        overlay:    "/templates/gold_elite_2026/overlay.png",
        thumbnail:  "/templates/gold_elite_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "silver_chrome_2026" as const,
      name: "Silver Chrome 2026",
      category: "elite",
      enabled: true,
      assets: {
        source:     "/templates/silver_chrome_2026/source.png",
        background: "/templates/silver_chrome_2026/background.png",
        overlay:    "/templates/silver_chrome_2026/overlay.png",
        thumbnail:  "/templates/silver_chrome_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "black_elite_2026" as const,
      name: "Black Elite 2026",
      category: "elite",
      enabled: true,
      assets: {
        source:     "/templates/black_elite_2026/source.png",
        background: "/templates/black_elite_2026/background.png",
        overlay:    "/templates/black_elite_2026/overlay.png",
        thumbnail:  "/templates/black_elite_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "blue_electric_2026" as const,
      name: "Blue Electric 2026",
      category: "electric",
      enabled: true,
      assets: {
        source:     "/templates/blue_electric_2026/source.png",
        background: "/templates/blue_electric_2026/background.png",
        overlay:    "/templates/blue_electric_2026/overlay.png",
        thumbnail:  "/templates/blue_electric_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "purple_holo_2026" as const,
      name: "Purple Holo 2026",
      category: "holo",
      enabled: true,
      assets: {
        source:     "/templates/purple_holo_2026/source.png",
        background: "/templates/purple_holo_2026/background.png",
        overlay:    "/templates/purple_holo_2026/overlay.png",
        thumbnail:  "/templates/purple_holo_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "red_fire_2026" as const,
      name: "Red Fire 2026",
      category: "fire",
      enabled: true,
      assets: {
        source:     "/templates/red_fire_2026/source.png",
        background: "/templates/red_fire_2026/background.png",
        overlay:    "/templates/red_fire_2026/overlay.png",
        thumbnail:  "/templates/red_fire_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "usa_host_2026" as const,
      name: "USA Host 2026",
      category: "host",
      enabled: false,
      assets: {
        source:     "/templates/usa_host_2026/source.png",
        background: "/templates/usa_host_2026/background.png",
        overlay:    "/templates/usa_host_2026/overlay.png",
        thumbnail:  "/templates/usa_host_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "world_edition_2026" as const,
      name: "World Edition 2026",
      category: "world",
      enabled: true,
      assets: {
        source:     "/templates/world_edition_2026/source.png",
        background: "/templates/world_edition_2026/background.png",
        overlay:    "/templates/world_edition_2026/overlay.png",
        thumbnail:  "/templates/world_edition_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "fangirl_pink_2026" as const,
      name: "Fangirl Pink 2026",
      category: "fangirl",
      enabled: true,
      assets: {
        source:     "/templates/fangirl_pink_2026/source.png",
        background: "/templates/fangirl_pink_2026/background.png",
        overlay:    "/templates/fangirl_pink_2026/overlay.png",
        thumbnail:  "/templates/fangirl_pink_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
    {
      id: "green_stadium_2026" as const,
      name: "Green Stadium 2026",
      category: "stadium",
      enabled: true,
      assets: {
        source:     "/templates/green_stadium_2026/source.png",
        background: "/templates/green_stadium_2026/background.png",
        overlay:    "/templates/green_stadium_2026/overlay.png",
        thumbnail:  "/templates/green_stadium_2026/thumbnail.png",
      },
      textColor: "#FFFFFF",
      shadow: true,
      layout: {
        rating:   { x: 80,  y: 80,  fontSize: 90, fontFamily: "D-DIN",           fontWeight: "700" },
        position: { x: 80,  y: 180, fontSize: 40, fontFamily: "D-DIN Condensed", fontWeight: "400" },
        flag:     { x: 80,  y: 230, width: 60, height: 40 },
        name:     { x: 543, y: 980, fontSize: 64, fontFamily: "D-DIN Condensed", fontWeight: "700", align: "center" },
        stats:    { startX: 160, startY: 1060, colGap: 280, rowGap: 80, fontSize: 44, labelFontSize: 28 },
        photo:    { x: 0, y: 0, width: 1086, height: 1448 },
      },
    },
  ],
} satisfies {
  version: string;
  canvas: { width: number; height: number };
  renderingOrder: string[];
  templates: CardTemplateDefinition[];
};
