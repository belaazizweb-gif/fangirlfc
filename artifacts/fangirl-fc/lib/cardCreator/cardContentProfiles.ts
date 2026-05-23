// ============================================================
// cardContentProfiles.ts
// Visual rendering profiles for card content.
// Controls font ratios, shadow, divider, flag aspect, badge style.
// Does NOT import from templateConfig.ts — avoids circular deps.
// ============================================================

export type ContentProfileId =
  | "standard_light"
  | "standard_dark"
  | "standard_green"
  | "premium_gold"
  | "world_cup"
  | "fangirl";

export interface ContentProfile {
  // ── Font size ratios ──────────────────────────────────────
  // Applied to the zone height for rating/position/name.
  ratingFontRatio:   number;
  positionFontRatio: number;
  nameFontRatio:     number;

  // Applied to the internal sub-box height (not the full stat row height).
  // value sub-box = sh * 0.55 → statValueFontRatio applied to that sub-box
  // label sub-box = sh * 0.40 → statLabelFontRatio applied to that sub-box
  statValueFontRatio: number;
  statLabelFontRatio: number;

  // ── Shadow ────────────────────────────────────────────────
  shadowEnabled:       boolean;
  ratingShadowBlur:    number;
  positionShadowBlur:  number;
  nameShadowBlur:      number;
  statShadowBlur:      number;
  shadowColor:         string;

  // ── Stats divider ─────────────────────────────────────────
  showStatsDivider: boolean;
  dividerColor:     string;
  dividerOpacity:   number;

  // ── Stat label ────────────────────────────────────────────
  // Opacity applied to the label Text node (value stays at full opacity).
  statLabelOpacity: number;

  // ── Flag ──────────────────────────────────────────────────
  flagAspectRatio:         number;   // target W/H ratio (e.g. 4/3)
  preserveFlagAspectRatio: boolean;

  // ── Badge ─────────────────────────────────────────────────
  badgeCircleOpacity:       number;   // fill opacity of the circle
  badgeCircleStrokeOpacity: number;   // stroke opacity of the circle
  badgeIconScale:           number;   // emoji size = min(w,h) * this
}

// ── Profile definitions ───────────────────────────────────────

const CONTENT_PROFILES: Record<ContentProfileId, ContentProfile> = {
  standard_light: {
    ratingFontRatio:   0.78,
    positionFontRatio: 0.72,
    nameFontRatio:     0.74,
    statValueFontRatio: 0.92,
    statLabelFontRatio: 0.78,

    shadowEnabled:      false,
    ratingShadowBlur:   0,
    positionShadowBlur: 0,
    nameShadowBlur:     0,
    statShadowBlur:     0,
    shadowColor:        "rgba(0,0,0,0.55)",

    showStatsDivider: true,
    dividerColor:     "#18202A",
    dividerOpacity:   0.30,

    statLabelOpacity: 0.66,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.22,
    badgeCircleStrokeOpacity: 0.18,
    badgeIconScale:           0.58,
  },

  standard_dark: {
    ratingFontRatio:   0.78,
    positionFontRatio: 0.72,
    nameFontRatio:     0.74,
    statValueFontRatio: 0.92,
    statLabelFontRatio: 0.78,

    shadowEnabled:      true,
    ratingShadowBlur:   8,
    positionShadowBlur: 6,
    nameShadowBlur:     7,
    statShadowBlur:     5,
    shadowColor:        "rgba(0,0,0,0.75)",

    showStatsDivider: true,
    dividerColor:     "#FFFFFF",
    dividerOpacity:   0.25,

    statLabelOpacity: 0.70,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.38,
    badgeCircleStrokeOpacity: 0.20,
    badgeIconScale:           0.58,
  },

  standard_green: {
    ratingFontRatio:   0.78,
    positionFontRatio: 0.72,
    nameFontRatio:     0.74,
    statValueFontRatio: 0.92,
    statLabelFontRatio: 0.78,

    shadowEnabled:      true,
    ratingShadowBlur:   8,
    positionShadowBlur: 6,
    nameShadowBlur:     7,
    statShadowBlur:     5,
    shadowColor:        "rgba(20,10,0,0.65)",

    showStatsDivider: true,
    dividerColor:     "#F8E7A6",
    dividerOpacity:   0.40,

    statLabelOpacity: 0.75,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.38,
    badgeCircleStrokeOpacity: 0.20,
    badgeIconScale:           0.58,
  },

  premium_gold: {
    ratingFontRatio:   0.82,
    positionFontRatio: 0.74,
    nameFontRatio:     0.76,
    statValueFontRatio: 0.94,
    statLabelFontRatio: 0.80,

    shadowEnabled:      true,
    ratingShadowBlur:   6,
    positionShadowBlur: 5,
    nameShadowBlur:     6,
    statShadowBlur:     4,
    shadowColor:        "rgba(0,0,0,0.60)",

    showStatsDivider: true,
    dividerColor:     "#5C4300",
    dividerOpacity:   0.30,

    statLabelOpacity: 0.70,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.30,
    badgeCircleStrokeOpacity: 0.18,
    badgeIconScale:           0.60,
  },

  world_cup: {
    ratingFontRatio:   0.76,
    positionFontRatio: 0.70,
    nameFontRatio:     0.75,
    statValueFontRatio: 0.90,
    statLabelFontRatio: 0.76,

    shadowEnabled:      false,
    ratingShadowBlur:   0,
    positionShadowBlur: 0,
    nameShadowBlur:     0,
    statShadowBlur:     0,
    shadowColor:        "rgba(0,0,0,0.55)",

    showStatsDivider: true,
    dividerColor:     "#2A1A00",
    dividerOpacity:   0.25,

    statLabelOpacity: 0.68,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.26,
    badgeCircleStrokeOpacity: 0.16,
    badgeIconScale:           0.58,
  },

  fangirl: {
    ratingFontRatio:   0.76,
    positionFontRatio: 0.70,
    nameFontRatio:     0.72,
    statValueFontRatio: 0.88,
    statLabelFontRatio: 0.76,

    shadowEnabled:      true,
    ratingShadowBlur:   5,
    positionShadowBlur: 4,
    nameShadowBlur:     5,
    statShadowBlur:     4,
    shadowColor:        "rgba(200,0,100,0.35)",

    showStatsDivider: true,
    dividerColor:     "#FF7ABF",
    dividerOpacity:   0.30,

    statLabelOpacity: 0.80,

    flagAspectRatio:         4 / 3,
    preserveFlagAspectRatio: true,

    badgeCircleOpacity:       0.28,
    badgeCircleStrokeOpacity: 0.14,
    badgeIconScale:           0.58,
  },
};

export function getContentProfile(id: ContentProfileId | undefined): ContentProfile {
  return id
    ? (CONTENT_PROFILES[id] ?? CONTENT_PROFILES.standard_light)
    : CONTENT_PROFILES.standard_light;
}
