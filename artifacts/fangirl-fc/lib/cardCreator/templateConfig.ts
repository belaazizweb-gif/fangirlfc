// ============================================================
// templateConfig.ts — generated from card_templates_config_pro_v4.json (version 3.1)
// All coordinates are NORMALIZED (0.0 – 1.0 of canvas size 1086 × 1448)
// DO NOT edit manually — re-run the generation script when the JSON changes.
// ============================================================
import type { ContentProfileId } from "./cardContentProfiles";

// ── Template IDs ────────────────────────────────────────────
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

export type LayoutId =
  | "standardFrame"
  | "goldElite"
  | "goldCrystal"
  | "worldCup"
  | "fangirl";

// ── Primitive zone shapes ────────────────────────────────────
export interface NormRect {
  x: number; // normalized left (0–1)
  y: number; // normalized top  (0–1)
  w: number; // normalized width
  h: number; // normalized height
}

export interface NormRectAligned extends NormRect {
  align: "left" | "center" | "right";
}

export interface StatZone extends NormRect {
  key: "PAC" | "SHO" | "PAS" | "DRI" | "DEF" | "PHY";
}

export interface PhotoZone extends NormRect {
  clip: string;
  defaultScale: number;
  minScale: number;
  maxScale: number;
  rotationMin: number;
  rotationMax: number;
}

export interface StatsDivider extends NormRect {}

export interface StatsLayout {
  mode: string;
  divider: StatsDivider;
  left: StatZone[];
  right: StatZone[];
}

// ── Full layout definition ───────────────────────────────────
export interface CardLayoutDefinition {
  rating:   NormRectAligned;
  position: NormRectAligned;
  flag:     NormRect;
  badge:    NormRect;
  photo:    PhotoZone;
  name:     NormRectAligned;
  stats:    StatsLayout;
}

// ── Per-template style ───────────────────────────────────────
export interface CardTemplateStyle {
  textColor:   string;
  ratingColor: string;
  nameColor:   string;
  statsColor:  string;
  shadow:      boolean;
}

// ── Source / processing metadata (informational only) ────────
export interface CardTemplateSource {
  fileName:           string;
  originalWidth:      number;
  originalHeight:     number;
  transparencyStatus: string;
  notes?:             string;
}

export interface CardTemplateProcessing {
  mustNormalizeToCanvas:    boolean;
  targetWidth:              number;
  targetHeight:             number;
  fitMode:                  string;
  removeCheckerboardIfBaked: boolean;
  recommendedExport:        string;
}

// ── Full template definition ─────────────────────────────────
export interface CardTemplateDefinition {
  id:               CardTemplateId;
  name:             string;
  category:         string;
  family:           string;
  enabled:          boolean;
  layoutId:         LayoutId;
  contentProfileId: ContentProfileId;
  assets: {
    background: string;
    overlay:    string;
    thumbnail:  string;
    source:     string;
  };
  style:      CardTemplateStyle;
  layout:     CardLayoutDefinition;
  source:     CardTemplateSource;
  processing: CardTemplateProcessing;
}

// ── Global config ────────────────────────────────────────────
export interface CardCreatorConfig {
  version:       string;
  name:          string;
  status:        string;
  canvas:        { width: number; height: number; aspectRatio: string; normalizedCoordinates: boolean };
  renderOrder:   string[];
  font:          { family: string; fallback: string };
  photoControls: {
    move:         boolean;
    zoom:         boolean;
    rotate:       boolean;
    reset:        boolean;
    defaultScale: number;
    minScale:     number;
    maxScale:     number;
    rotationMin:  number;
    rotationMax:  number;
  };
  editableZones: string[];
  layouts:       Record<LayoutId, CardLayoutDefinition>;
  templates:     CardTemplateDefinition[];
  defaultCardData: {
    templateId:  CardTemplateId;
    rating:      number;
    position:    string;
    countryCode: string;
    flag:        string;
    badge:       string;
    name:        string;
    stats:       Record<"PAC" | "SHO" | "PAS" | "DRI" | "DEF" | "PHY", number>;
    photo:       { src: null; x: number; y: number; scale: number; rotation: number };
  };
}

// ═══════════════════════════════════════════════════════════
// LAYOUTS
// ═══════════════════════════════════════════════════════════
const LAYOUTS: Record<LayoutId, CardLayoutDefinition> = {
  standardFrame: {
    rating:   { x: 0.115, y: 0.11,  w: 0.165, h: 0.095, align: "center" },
    position: { x: 0.125, y: 0.21,  w: 0.145, h: 0.05,  align: "center" },
    flag:     { x: 0.122, y: 0.285, w: 0.145, h: 0.062 },
    badge:    { x: 0.11,  y: 0.37,  w: 0.17,  h: 0.115 },
    photo: {
      x: 0.22, y: 0.045, w: 0.7, h: 0.56,
      clip: "photoBox", defaultScale: 1.0, minScale: 0.75, maxScale: 2.5,
      rotationMin: -15, rotationMax: 15,
    },
    name:  { x: 0.11,  y: 0.625, w: 0.78, h: 0.07, align: "center" },
    stats: {
      mode: "twoColumnThreeRows",
      divider: { x: 0.5, y: 0.715, w: 0.002, h: 0.18 },
      left: [
        { key: "PAC", x: 0.13, y: 0.72,  w: 0.3, h: 0.05 },
        { key: "SHO", x: 0.13, y: 0.785, w: 0.3, h: 0.05 },
        { key: "PAS", x: 0.13, y: 0.85,  w: 0.3, h: 0.05 },
      ],
      right: [
        { key: "DRI", x: 0.56, y: 0.72,  w: 0.3, h: 0.05 },
        { key: "DEF", x: 0.56, y: 0.785, w: 0.3, h: 0.05 },
        { key: "PHY", x: 0.56, y: 0.85,  w: 0.3, h: 0.05 },
      ],
    },
  },

  goldElite: {
    rating:   { x: 0.12,  y: 0.095, w: 0.18,  h: 0.11,  align: "center" },
    position: { x: 0.125, y: 0.215, w: 0.155, h: 0.05,  align: "center" },
    flag:     { x: 0.115, y: 0.295, w: 0.165, h: 0.065 },
    badge:    { x: 0.105, y: 0.38,  w: 0.175, h: 0.115 },
    photo: {
      x: 0.245, y: 0.045, w: 0.68, h: 0.555,
      clip: "photoBox", defaultScale: 1.0, minScale: 0.75, maxScale: 2.5,
      rotationMin: -15, rotationMax: 15,
    },
    name:  { x: 0.1,  y: 0.6,  w: 0.8, h: 0.07, align: "center" },
    stats: {
      mode: "twoColumnThreeRows",
      divider: { x: 0.5, y: 0.715, w: 0.002, h: 0.18 },
      left: [
        { key: "PAC", x: 0.135, y: 0.715, w: 0.3, h: 0.052 },
        { key: "SHO", x: 0.135, y: 0.78,  w: 0.3, h: 0.052 },
        { key: "PAS", x: 0.135, y: 0.845, w: 0.3, h: 0.052 },
      ],
      right: [
        { key: "DRI", x: 0.565, y: 0.715, w: 0.3, h: 0.052 },
        { key: "DEF", x: 0.565, y: 0.78,  w: 0.3, h: 0.052 },
        { key: "PHY", x: 0.565, y: 0.845, w: 0.3, h: 0.052 },
      ],
    },
  },

  goldCrystal: {
    rating:   { x: 0.11,  y: 0.09,  w: 0.18,  h: 0.11,  align: "center" },
    position: { x: 0.12,  y: 0.205, w: 0.155, h: 0.05,  align: "center" },
    flag:     { x: 0.115, y: 0.282, w: 0.155, h: 0.065 },
    badge:    { x: 0.105, y: 0.365, w: 0.17,  h: 0.115 },
    photo: {
      x: 0.23, y: 0.04, w: 0.7, h: 0.585,
      clip: "photoBox", defaultScale: 1.0, minScale: 0.75, maxScale: 2.5,
      rotationMin: -15, rotationMax: 15,
    },
    name:  { x: 0.105, y: 0.615, w: 0.79, h: 0.075, align: "center" },
    stats: {
      mode: "twoColumnThreeRows",
      divider: { x: 0.5, y: 0.72, w: 0.002, h: 0.18 },
      left: [
        { key: "PAC", x: 0.14, y: 0.72,  w: 0.3, h: 0.052 },
        { key: "SHO", x: 0.14, y: 0.785, w: 0.3, h: 0.052 },
        { key: "PAS", x: 0.14, y: 0.85,  w: 0.3, h: 0.052 },
      ],
      right: [
        { key: "DRI", x: 0.56, y: 0.72,  w: 0.3, h: 0.052 },
        { key: "DEF", x: 0.56, y: 0.785, w: 0.3, h: 0.052 },
        { key: "PHY", x: 0.56, y: 0.85,  w: 0.3, h: 0.052 },
      ],
    },
  },

  worldCup: {
    rating:   { x: 0.12,  y: 0.115, w: 0.17,  h: 0.1,   align: "center" },
    position: { x: 0.125, y: 0.22,  w: 0.155, h: 0.05,  align: "center" },
    flag:     { x: 0.12,  y: 0.295, w: 0.16,  h: 0.065 },
    badge:    { x: 0.11,  y: 0.385, w: 0.17,  h: 0.115 },
    photo: {
      x: 0.25, y: 0.045, w: 0.66, h: 0.56,
      clip: "photoBox", defaultScale: 1.0, minScale: 0.75, maxScale: 2.5,
      rotationMin: -15, rotationMax: 15,
    },
    name:  { x: 0.09, y: 0.625, w: 0.82, h: 0.07, align: "center" },
    stats: {
      mode: "twoColumnThreeRows",
      divider: { x: 0.5, y: 0.72, w: 0.002, h: 0.18 },
      left: [
        { key: "PAC", x: 0.13, y: 0.72,  w: 0.31, h: 0.052 },
        { key: "SHO", x: 0.13, y: 0.785, w: 0.31, h: 0.052 },
        { key: "PAS", x: 0.13, y: 0.85,  w: 0.31, h: 0.052 },
      ],
      right: [
        { key: "DRI", x: 0.56, y: 0.72,  w: 0.31, h: 0.052 },
        { key: "DEF", x: 0.56, y: 0.785, w: 0.31, h: 0.052 },
        { key: "PHY", x: 0.56, y: 0.85,  w: 0.31, h: 0.052 },
      ],
    },
  },

  fangirl: {
    rating:   { x: 0.12,  y: 0.11,  w: 0.17,  h: 0.1,   align: "center" },
    position: { x: 0.125, y: 0.218, w: 0.155, h: 0.05,  align: "center" },
    flag:     { x: 0.12,  y: 0.292, w: 0.16,  h: 0.065 },
    badge:    { x: 0.108, y: 0.38,  w: 0.172, h: 0.115 },
    photo: {
      x: 0.235, y: 0.045, w: 0.69, h: 0.56,
      clip: "photoBox", defaultScale: 1.0, minScale: 0.75, maxScale: 2.5,
      rotationMin: -15, rotationMax: 15,
    },
    name:  { x: 0.095, y: 0.625, w: 0.81, h: 0.07, align: "center" },
    stats: {
      mode: "twoColumnThreeRows",
      divider: { x: 0.5, y: 0.72, w: 0.002, h: 0.18 },
      left: [
        { key: "PAC", x: 0.135, y: 0.72,  w: 0.305, h: 0.052 },
        { key: "SHO", x: 0.135, y: 0.785, w: 0.305, h: 0.052 },
        { key: "PAS", x: 0.135, y: 0.85,  w: 0.305, h: 0.052 },
      ],
      right: [
        { key: "DRI", x: 0.56, y: 0.72,  w: 0.305, h: 0.052 },
        { key: "DEF", x: 0.56, y: 0.785, w: 0.305, h: 0.052 },
        { key: "PHY", x: 0.56, y: 0.85,  w: 0.305, h: 0.052 },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════
const TEMPLATES: CardTemplateDefinition[] = [
  {
    id: "gold_crystal_2026",
    name: "Gold Crystal 2026",
    category: "classic",
    family: "premium_crystal",
    enabled: true,
    layoutId: "goldCrystal",
    contentProfileId: "premium_gold",
    assets: {
      background: "/templates/gold_crystal_2026/background.png",
      overlay:    "/templates/gold_crystal_2026/overlay.webp",
      thumbnail:  "/templates/gold_crystal_2026/thumbnail.webp",
      source:     "/templates/gold_crystal_2026/source.png",
    },
    style: { textColor: "#F8E7A6", ratingColor: "#F8E7A6", nameColor: "#F8E7A6", statsColor: "#F8E7A6", shadow: true },
    layout: LAYOUTS.goldCrystal,
    source: { fileName: "ChatGPT Image 19 mai 2026, 21_48_27.png", originalWidth: 1055, originalHeight: 1491, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "silver_classic_2026",
    name: "Silver Classic 2026",
    category: "classic",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_light",
    assets: {
      background: "/templates/silver_classic_2026/background.png",
      overlay:    "/templates/silver_classic_2026/overlay.webp",
      thumbnail:  "/templates/silver_classic_2026/thumbnail.webp",
      source:     "/templates/silver_classic_2026/source.png",
    },
    style: { textColor: "#101820", ratingColor: "#101820", nameColor: "#101820", statsColor: "#101820", shadow: false },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 22_24_05.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "gold_elite_2026",
    name: "Gold Elite 2026",
    category: "classic",
    family: "premium_gold",
    enabled: true,
    layoutId: "goldElite",
    contentProfileId: "premium_gold",
    assets: {
      background: "/templates/gold_elite_2026/background.png",
      overlay:    "/templates/gold_elite_2026/overlay.webp",
      thumbnail:  "/templates/gold_elite_2026/thumbnail.webp",
      source:     "/templates/gold_elite_2026/source.png",
    },
    style: { textColor: "#5C4300", ratingColor: "#5C4300", nameColor: "#5C4300", statsColor: "#5C4300", shadow: false },
    layout: LAYOUTS.goldElite,
    source: { fileName: "ChatGPT Image 19 mai 2026, 22_31_05.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "silver_chrome_2026",
    name: "Silver Chrome 2026",
    category: "classic",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_light",
    assets: {
      background: "/templates/silver_chrome_2026/background.png",
      overlay:    "/templates/silver_chrome_2026/overlay.webp",
      thumbnail:  "/templates/silver_chrome_2026/thumbnail.webp",
      source:     "/templates/silver_chrome_2026/source.png",
    },
    style: { textColor: "#18202A", ratingColor: "#18202A", nameColor: "#18202A", statsColor: "#18202A", shadow: false },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 22_43_20.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "black_elite_2026",
    name: "Black Elite 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_dark",
    assets: {
      background: "/templates/black_elite_2026/background.png",
      overlay:    "/templates/black_elite_2026/overlay.webp",
      thumbnail:  "/templates/black_elite_2026/thumbnail.webp",
      source:     "/templates/black_elite_2026/source.png",
    },
    style: { textColor: "#FFFFFF", ratingColor: "#FFFFFF", nameColor: "#FFFFFF", statsColor: "#FFFFFF", shadow: true },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 22_45_38.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "blue_electric_2026",
    name: "Blue Electric 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_dark",
    assets: {
      background: "/templates/blue_electric_2026/background.png",
      overlay:    "/templates/blue_electric_2026/overlay.webp",
      thumbnail:  "/templates/blue_electric_2026/thumbnail.webp",
      source:     "/templates/blue_electric_2026/source.png",
    },
    style: { textColor: "#EAF7FF", ratingColor: "#EAF7FF", nameColor: "#EAF7FF", statsColor: "#EAF7FF", shadow: true },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_08_55.png", originalWidth: 1060, originalHeight: 1484, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "purple_holo_2026",
    name: "Purple Holo 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_dark",
    assets: {
      background: "/templates/purple_holo_2026/background.png",
      overlay:    "/templates/purple_holo_2026/overlay.webp",
      thumbnail:  "/templates/purple_holo_2026/thumbnail.webp",
      source:     "/templates/purple_holo_2026/source.png",
    },
    style: { textColor: "#FFFFFF", ratingColor: "#F4D6FF", nameColor: "#FFFFFF", statsColor: "#F4D6FF", shadow: true },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_16_27.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "red_fire_2026",
    name: "Red Fire 2026",
    category: "special",
    family: "standard_frame_family",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_dark",
    assets: {
      background: "/templates/red_fire_2026/background.png",
      overlay:    "/templates/red_fire_2026/overlay.webp",
      thumbnail:  "/templates/red_fire_2026/thumbnail.webp",
      source:     "/templates/red_fire_2026/source.png",
    },
    style: { textColor: "#FFFFFF", ratingColor: "#FFD36B", nameColor: "#FFFFFF", statsColor: "#FFD36B", shadow: true },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_18_53.png", originalWidth: 1122, originalHeight: 1402, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "green_stadium_2026",
    name: "Green Stadium 2026",
    category: "football",
    family: "stadium_green_gold",
    enabled: true,
    layoutId: "standardFrame",
    contentProfileId: "standard_green",
    assets: {
      background: "/templates/green_stadium_2026/background.png",
      overlay:    "/templates/green_stadium_2026/overlay.webp",
      thumbnail:  "/templates/green_stadium_2026/thumbnail.webp",
      source:     "/templates/green_stadium_2026/source.png",
    },
    style: { textColor: "#F8E7A6", ratingColor: "#F8E7A6", nameColor: "#FFFFFF", statsColor: "#D6B75D", shadow: true },
    layout: LAYOUTS.standardFrame,
    source: { fileName: "ChatGPT Image 20 mai 2026, 14_56_48.png", originalWidth: 1086, originalHeight: 1448, transparencyStatus: "opaque_rgba_checkerboard_baked", notes: "Checkerboard baked into pixels; remove before final integration." },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "exact-canvas", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "usa_host_2026",
    name: "USA Host 2026",
    category: "host",
    family: "world_cup_host",
    enabled: false,
    layoutId: "worldCup",
    contentProfileId: "world_cup",
    assets: {
      background: "/templates/usa_host_2026/background.png",
      overlay:    "/templates/usa_host_2026/overlay.webp",
      thumbnail:  "/templates/usa_host_2026/thumbnail.webp",
      source:     "/templates/usa_host_2026/source.png",
    },
    style: { textColor: "#1A1A3E", ratingColor: "#8B6914", nameColor: "#1A1A3E", statsColor: "#1A1A3E", shadow: false },
    layout: LAYOUTS.worldCup,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_22_04.png", originalWidth: 1024, originalHeight: 1536, transparencyStatus: "actual_alpha" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "world_edition_2026",
    name: "World Edition 2026",
    category: "world_cup",
    family: "world_cup_neutral",
    enabled: true,
    layoutId: "worldCup",
    contentProfileId: "world_cup",
    assets: {
      background: "/templates/world_edition_2026/background.png",
      overlay:    "/templates/world_edition_2026/overlay.webp",
      thumbnail:  "/templates/world_edition_2026/thumbnail.webp",
      source:     "/templates/world_edition_2026/source.png",
    },
    style: { textColor: "#2A1A00", ratingColor: "#8B6914", nameColor: "#2A1A00", statsColor: "#5C4300", shadow: false },
    layout: LAYOUTS.worldCup,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_25_19.png", originalWidth: 1024, originalHeight: 1535, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
  {
    id: "fangirl_pink_2026",
    name: "Fangirl Pink 2026",
    category: "fangirl",
    family: "fangirl_soft",
    enabled: true,
    layoutId: "fangirl",
    contentProfileId: "fangirl",
    assets: {
      background: "/templates/fangirl_pink_2026/background.png",
      overlay:    "/templates/fangirl_pink_2026/overlay.webp",
      thumbnail:  "/templates/fangirl_pink_2026/thumbnail.webp",
      source:     "/templates/fangirl_pink_2026/source.png",
    },
    style: { textColor: "#FFFFFF", ratingColor: "#FF7ABF", nameColor: "#FFFFFF", statsColor: "#FF7ABF", shadow: true },
    layout: LAYOUTS.fangirl,
    source: { fileName: "ChatGPT Image 19 mai 2026, 23_28_39.png", originalWidth: 1055, originalHeight: 1491, transparencyStatus: "opaque_or_checkerboard_baked" },
    processing: { mustNormalizeToCanvas: true, targetWidth: 1086, targetHeight: 1448, fitMode: "contain-center", removeCheckerboardIfBaked: true, recommendedExport: "PNG" },
  },
];

// ═══════════════════════════════════════════════════════════
// MASTER CONFIG EXPORT
// ═══════════════════════════════════════════════════════════
export const CARD_TEMPLATE_CONFIG: CardCreatorConfig = {
  version: "3.1",
  name: "Fangirl FC Player Card Creator Templates",
  status: "production-draft-with-green-stadium",
  canvas: {
    width: 1086,
    height: 1448,
    aspectRatio: "1086/1448",
    normalizedCoordinates: true,
  },
  renderOrder: [
    "background",
    "userPhoto",
    "overlay",
    "flag",
    "badge",
    "rating",
    "position",
    "playerName",
    "stats",
  ],
  font: {
    family: "D-DIN Condensed",
    fallback: "Arial Narrow, Arial, sans-serif",
  },
  photoControls: {
    move: true, zoom: true, rotate: true, reset: true,
    defaultScale: 1, minScale: 0.75, maxScale: 2.5,
    rotationMin: -15, rotationMax: 15,
  },
  editableZones: ["rating", "position", "flag", "badge", "photo", "name", "stats", "template"],
  layouts: LAYOUTS,
  templates: TEMPLATES,
  defaultCardData: {
    templateId: "gold_elite_2026",
    rating: 92,
    position: "ST",
    countryCode: "FR",
    flag: "/flags/fr.svg",
    badge: "/badges/generic_lion.svg",
    name: "LUCAS MOREAU",
    stats: { PAC: 94, SHO: 91, PAS: 86, DRI: 93, DEF: 48, PHY: 82 },
    photo: { src: null, x: 0, y: 0, scale: 1, rotation: 0 },
  },
};

// ── Convenience helpers ──────────────────────────────────────

/** All enabled templates, in config order */
export const ENABLED_TEMPLATES = TEMPLATES.filter((t) => t.enabled);

/** Look up a template definition by ID (throws if not found) */
export function getTemplateById(id: CardTemplateId): CardTemplateDefinition {
  const t = TEMPLATES.find((t) => t.id === id);
  if (!t) throw new Error(`Unknown template id: ${id}`);
  return t;
}

/** Look up a layout by layoutId */
export function getLayoutById(id: LayoutId): CardLayoutDefinition {
  return LAYOUTS[id];
}
