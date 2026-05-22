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

// ── Silhouette box — no-photo placeholder zone ─────────────────
//
// Larger than the photo box so the full-body silhouette fits comfortably.
// Coordinates are normalized (0–1) relative to the 1086×1448 canvas.

export const DEFAULT_SILHOUETTE_BOX: NormRect = {
  x: 0.10,
  y: 0.015,
  w: 0.80,
  h: 0.58,
};

export const SILHOUETTE_OVERRIDES: Partial<Record<string, NormRect>> = {
  // future per-template tuning
};

export function getSilhouetteBox(layout: CardLayoutDefinition, templateId: string): NormRect {
  return SILHOUETTE_OVERRIDES[templateId] ?? DEFAULT_SILHOUETTE_BOX;
}

// ── Photo box — uploaded selfie/photo zone ─────────────────────
//
// Smaller than the silhouette box — photo must not cover name/stats.
// Drag/zoom/rotate stay functional inside this clipped region.

export const DEFAULT_PHOTO_BOX: NormRect = {
  x: 0.22,
  y: 0.06,
  w: 0.56,
  h: 0.40,
};

export const PHOTO_OVERRIDES: Partial<Record<string, NormRect>> = {
  // future per-template tuning
};

export function getPhotoBox(layout: CardLayoutDefinition, templateId: string): NormRect {
  return PHOTO_OVERRIDES[templateId] ?? DEFAULT_PHOTO_BOX;
}

// ── Portrait box — kept for backward compatibility ─────────────
//
// Legacy alias used by any code not yet migrated to the separate
// getSilhouetteBox / getPhotoBox API above.

const DEFAULT_PORTRAIT_BOX: NormRect = {
  x: 0.08,
  y: 0.00,
  w: 0.84,
  h: 0.68,
};

const PORTRAIT_OVERRIDES: Partial<Record<string, NormRect>> = {};

export function getPortraitBox(layout: CardLayoutDefinition, templateId: string): NormRect {
  return PORTRAIT_OVERRIDES[templateId] ?? DEFAULT_PORTRAIT_BOX;
}
