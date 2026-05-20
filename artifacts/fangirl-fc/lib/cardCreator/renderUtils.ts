import {
  CARD_TEMPLATE_CONFIG,
  type CardTemplateDefinition,
  type CardLayoutDefinition,
  type CardTemplateStyle,
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
