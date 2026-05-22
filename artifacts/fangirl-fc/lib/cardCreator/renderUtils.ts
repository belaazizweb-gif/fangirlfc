import {
  CARD_TEMPLATE_CONFIG,
  type CardTemplateDefinition,
  type CardLayoutDefinition,
  type CardTemplateStyle,
  type NormRect,
} from "./templateConfig";

// ── Canvas logical dimensions (never changes) ──────────────────
export const TEMPLATE_W = 1086;
export const TEMPLATE_H = 1448;

// ── Normalized → pixel converters ─────────────────────────────
export const nX = (v: number): number => v * TEMPLATE_W;
export const nY = (v: number): number => v * TEMPLATE_H;
export const nW = (v: number): number => v * TEMPLATE_W;
export const nH = (v: number): number => v * TEMPLATE_H;

// ── Resolve named layout from template ────────────────────────
export function resolveLayout(template: CardTemplateDefinition): CardLayoutDefinition {
  return CARD_TEMPLATE_CONFIG.layouts[template.layoutId];
}

// ── Extract colour set for a template ─────────────────────────
export function getTemplateColors(template: CardTemplateDefinition): CardTemplateStyle {
  return template.style;
}

// ── Stat key order ─────────────────────────────────────────────
export const STAT_KEYS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

// ── Portrait box — centralized per-template override system ────
//
// All portrait/silhouette/photo positioning goes through getPortraitBox so
// that future per-template tuning requires only one entry in PORTRAIT_OVERRIDES
// rather than changes inside CardCanvas.
//
// Coordinates are normalized (0–1) relative to the 1086×1448 canvas.

const DEFAULT_PORTRAIT_BOX: NormRect = {
  x: 0.10,
  y: 0.03,
  w: 0.80,
  h: 0.62,
};

const PORTRAIT_OVERRIDES: Partial<Record<string, NormRect>> = {
  // Future per-template tuning goes here, e.g.:
  // gold_elite_2026: { x: 0.25, y: 0.10, w: 0.50, h: 0.44 },
};

/**
 * Returns the portrait bounding box for a given template.
 *
 * @param layout   - Resolved card layout (kept for future layout-aware logic).
 * @param templateId - Template identifier; used to look up per-template overrides.
 */
export function getPortraitBox(layout: CardLayoutDefinition, templateId: string): NormRect {
  return PORTRAIT_OVERRIDES[templateId] ?? DEFAULT_PORTRAIT_BOX;
}
