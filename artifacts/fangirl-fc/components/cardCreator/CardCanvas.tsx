"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Rect, Text, Circle, Group } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { CardTemplateDefinition } from "@/lib/cardCreator/templateConfig";
import { getContentProfile } from "@/lib/cardCreator/cardContentProfiles";
import type { ContentProfile } from "@/lib/cardCreator/cardContentProfiles";
import { nX, nY, nW, nH, resolveLayout, TEMPLATE_W, TEMPLATE_H, getSilhouetteBox, getPhotoBox, getCutoutBox } from "@/lib/cardCreator/renderUtils";
import type { StatKey } from "@/lib/cardCreator/renderUtils";
import { useMaskedOverlay } from "./useMaskedOverlay";
import type { CreatorCardState, BadgeState, BadgeId } from "@/lib/cardCreator/creatorState";

// ── Types ─────────────────────────────────────────────────────
export interface LoadStatus {
  background: string;
  overlay: string;
  flag: string;
}

interface CardCanvasProps {
  template: CardTemplateDefinition;
  cardState: CreatorCardState;
  showDebugBoxes: boolean;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  onLoadStatusChange?: (s: LoadStatus) => void;
  previewScaleRef?: React.MutableRefObject<number>;
  onPhotoDrag?: (pos: { x: number; y: number }) => void;
  /** Explicit display width in CSS px. When provided, skips the ResizeObserver
   *  so the stage is sized correctly on the very first render with no flash. */
  displayWidth?: number;
}

// ── Debug box colours by zone ────────────────────────────────
const DEBUG_COLORS: Record<string, string> = {
  photo:    "rgba(0,200,255,0.55)",
  rating:   "rgba(255,215,0,0.55)",
  position: "rgba(255,165,0,0.55)",
  flag:     "rgba(100,255,100,0.55)",
  badge:    "rgba(255,100,200,0.55)",
  name:     "rgba(200,100,255,0.55)",
  stats:    "rgba(255,80,80,0.55)",
};

// ── Player silhouette — provided clean transparent PNG ────────────────────
//
// Source:  fut_player_silhouette_clean_transparent.png (provided via ZIP)
// Format:  RGBA PNG, 1046 × 1279 px, transparent background
// Ratio:   1046 / 1279 ≈ 0.8178
//
// Layer stacking note (CardCanvas Layer 1):
//   Rendered DIRECTLY in the Layer with NO clip Group — a clip Group would
//   clear its rectangular region on the canvas before drawing, punching a
//   black hole through the overlay.png base drawn beneath it.
const PLAYER_SILHOUETTE = "/assets/player-silhouettes/fut_player_silhouette_clean_transparent.png?v=2";
// Aspect ratio of the clean silhouette PNG (width / height)
const CLEAN_SILHOUETTE_RATIO = 1046 / 1279;

// ── V3 Gold Elite design tokens — scoped to gold_elite_2026 ──
const V3_GOLD = {
  primaryText:       "#FFF6C7",
  secondaryText:     "#F3CD55",
  darkPanel:         "rgba(12, 8, 2, 0.64)",
  darkPanelStrong:   "rgba(12, 8, 2, 0.74)",
  panelStroke:       "rgba(255, 220, 120, 0.48)",
  panelStrokeStrong: "rgba(255, 220, 120, 0.62)",
  shadow:            "rgba(0,0,0,0.78)",
  divider:           "rgba(255, 220, 120, 0.44)",
  rowFill:           "rgba(255, 244, 191, 0.08)",
  rowStroke:         "rgba(255, 220, 120, 0.16)",
  flagBorder:        "rgba(255,255,255,0.42)",
} as const;

// V3 stat definitions — updated row Y coords (panel moved up to y=0.678)
const V3_STATS = [
  { key: "PAC" as const, colX: 0.120, colW: 0.365, rowY: 0.685 },
  { key: "SHO" as const, colX: 0.120, colW: 0.365, rowY: 0.765 },
  { key: "PAS" as const, colX: 0.120, colW: 0.365, rowY: 0.845 },
  { key: "DRI" as const, colX: 0.515, colW: 0.365, rowY: 0.685 },
  { key: "DEF" as const, colX: 0.515, colW: 0.365, rowY: 0.765 },
  { key: "PHY" as const, colX: 0.515, colW: 0.365, rowY: 0.845 },
];
const V3_ROW_H = 0.065;

// ── Non-gold premium palette ──────────────────────────────────
type NonGoldPaletteId = "dark" | "light" | "pink" | "green";

const NON_GOLD_TEMPLATE_PALETTE: Record<string, NonGoldPaletteId> = {
  black_elite_2026:    "dark",
  purple_holo_2026:    "dark",
  blue_electric_2026:  "dark",
  red_fire_2026:       "dark",
  silver_classic_2026: "light",
  silver_chrome_2026:  "light",
  world_edition_2026:  "light",
  usa_host_2026:       "light",
  fangirl_pink_2026:   "pink",
  green_stadium_2026:  "green",
};

const NON_GOLD_PALETTES: Record<NonGoldPaletteId, {
  primaryText:   string; secondaryText: string;
  nameplateFill: string; chipFill:      string;
  chipStroke:    string; stroke:        string;
  strokeStrong:  string; shadow:        string;
  divider:       string; metaFill:      string;
}> = {
  dark: {
    primaryText:   "#FFFFFF",
    secondaryText: "#D8C27A",
    nameplateFill: "rgba(0,0,0,0.22)",
    chipFill:      "rgba(255,255,255,0.08)",
    chipStroke:    "rgba(255,220,120,0.28)",
    stroke:        "rgba(255,220,120,0.34)",
    strokeStrong:  "rgba(255,220,120,0.46)",
    shadow:        "rgba(0,0,0,0.95)",
    divider:       "rgba(255,220,120,0.34)",
    metaFill:      "rgba(0,0,0,0.20)",
  },
  light: {
    primaryText:   "#111827",
    secondaryText: "#4A3510",
    nameplateFill: "rgba(255,255,255,0.24)",
    chipFill:      "rgba(255,255,255,0.24)",
    chipStroke:    "rgba(20,20,20,0.20)",
    stroke:        "rgba(20,20,20,0.22)",
    strokeStrong:  "rgba(20,20,20,0.32)",
    shadow:        "rgba(255,255,255,0.35)",
    divider:       "rgba(20,20,20,0.26)",
    metaFill:      "rgba(255,255,255,0.18)",
  },
  pink: {
    primaryText:   "#FFFFFF",
    secondaryText: "#FFD1EA",
    nameplateFill: "rgba(80,0,45,0.24)",
    chipFill:      "rgba(255,255,255,0.12)",
    chipStroke:    "rgba(255,122,191,0.34)",
    stroke:        "rgba(255,122,191,0.34)",
    strokeStrong:  "rgba(255,122,191,0.46)",
    shadow:        "rgba(80,0,45,0.85)",
    divider:       "rgba(255,122,191,0.34)",
    metaFill:      "rgba(80,0,45,0.22)",
  },
  green: {
    primaryText:   "#FFF6C7",
    secondaryText: "#F8D86A",
    nameplateFill: "rgba(0,35,20,0.24)",
    chipFill:      "rgba(255,244,191,0.10)",
    chipStroke:    "rgba(255,220,120,0.30)",
    stroke:        "rgba(255,220,120,0.34)",
    strokeStrong:  "rgba(255,220,120,0.46)",
    shadow:        "rgba(0,0,0,0.90)",
    divider:       "rgba(255,220,120,0.34)",
    metaFill:      "rgba(0,35,20,0.22)",
  },
};

// ── Per-template backdrop colours ────────────────────────────
//
// A solid Konva Rect is drawn as the very first element in Layer 1
// (before overlay.png) so that transparent areas in shaped overlay
// PNGs are filled with a colour rather than exposing the transparent
// Konva Stage. This Rect sits inside the Stage and is therefore
// included in stage.toDataURL() exports.
//
// Templates whose overlay.png is 100% opaque (silver_chrome, gold_elite,
// purple_holo, green_stadium) are unaffected visually because the
// opaque overlay pixels cover the backdrop completely.
//
// Templates whose overlay.png has baked grey/white margin pixels
// (black_elite) still show those baked pixels above the backdrop;
// a full fix for those requires reprocessing the PNG assets.
const DEFAULT_TEMPLATE_BACKDROP = "#f4f4f1";
const TEMPLATE_BACKDROPS: Record<string, string> = {
  gold_crystal_2026:  "#f1df9a",
  silver_chrome_2026: "#f4f4f1",
  gold_elite_2026:    "#ead58a",
  black_elite_2026:   "#111318",
  usa_host_2026:      "#e8ecf0",
  fangirl_pink_2026:  "#f9e8f0",
  purple_holo_2026:   "#f4f4f1",
  green_stadium_2026: "#e8ecf0",
};

// ── Badge zone — supports generic (emoji) + upload + none ────
function BadgeZone({
  badge, x, y, w, h,
  circleOpacity, circleStrokeOpacity, iconScale,
}: {
  badge: BadgeState; x: number; y: number; w: number; h: number;
  circleOpacity: number; circleStrokeOpacity: number; iconScale: number;
}) {
  const badgeSrc = badge.type === "upload" ? (badge.src || "") : "";
  const [badgeImg] = useImage(badgeSrc);

  if (badge.type === "none") return null;

  if (badge.type === "upload") {
    if (badgeImg) {
      return <KImage image={badgeImg} x={x} y={y} width={w} height={h} />;
    }
    // Still loading — show placeholder
    return (
      <Group>
        <Rect x={x + w * 0.1} y={y + h * 0.1} width={w * 0.8} height={h * 0.8}
          fill="#2a2050" stroke="#8060c0" strokeWidth={2} cornerRadius={6} />
        <Text x={x} y={y + h * 0.3} width={w} height={h * 0.4}
          text="⏳" fontSize={h * 0.36} align="center" verticalAlign="middle" />
      </Group>
    );
  }

  // Generic badge — coloured circle + emoji
  const cx = x + w / 2;
  const cy = y + h / 2;
  const size = Math.min(w, h) * 0.72;
  const emojiMap: Record<BadgeId, string> = {
    shield:    "🛡️",
    star:      "⭐",
    crown:     "👑",
    lion:      "🦁",
    ball:      "⚽",
    lightning: "⚡",
  };
  const id = badge.type === "generic" ? badge.id : "shield";

  return (
    <Group>
      <Circle
        x={cx} y={cy} radius={size / 2}
        fill={`rgba(0,0,0,${circleOpacity})`}
        stroke={`rgba(255,255,255,${circleStrokeOpacity})`}
        strokeWidth={2}
      />
      <Text
        x={x} y={y} width={w} height={h}
        text={emojiMap[id]}
        fontSize={Math.min(w, h) * iconScale}
        align="center" verticalAlign="middle"
      />
    </Group>
  );
}

// ── Flag with safe SVG fallback ──────────────────────────────
function FlagZone({
  flagUrl, countryCode, x, y, w, h,
  preserveAspectRatio, flagAspectRatio,
  onStatus,
}: {
  flagUrl: string; countryCode: string;
  x: number; y: number; w: number; h: number;
  preserveAspectRatio: boolean; flagAspectRatio: number;
  onStatus?: (s: string) => void;
}) {
  const [img, status] = useImage(flagUrl, "anonymous");

  useEffect(() => {
    if (status === "loaded") onStatus?.("loaded");
    else if (status === "failed") onStatus?.("fallback");
    else onStatus?.(status);
  }, [status, onStatus]);

  // Compute corrected dimensions centered within the zone
  let fX = x, fY = y, fW = w, fH = h;
  if (preserveAspectRatio) {
    const zoneRatio = w / h;
    if (zoneRatio > flagAspectRatio) {
      fH = h;
      fW = h * flagAspectRatio;
    } else {
      fW = w;
      fH = w / flagAspectRatio;
    }
    fX = x + (w - fW) / 2;
    fY = y + (h - fH) / 2;
  }

  if (status === "loaded" && img) {
    return <KImage image={img} x={fX} y={fY} width={fW} height={fH} />;
  }
  return (
    <Group>
      <Rect x={fX} y={fY} width={fW} height={fH} fill="#1a3a6a" cornerRadius={3} />
      <Text
        x={fX} y={fY} width={fW} height={fH}
        text={countryCode}
        fontSize={fH * 0.45} fontFamily="D-DIN Condensed" fontStyle="bold"
        fill="#ffffff" align="center" verticalAlign="middle"
      />
    </Group>
  );
}

// ── Debug box ────────────────────────────────────────────────
function DebugBox({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  return (
    <Rect x={x} y={y} width={w} height={h}
      fill={color.replace("0.55", "0.12")}
      stroke={color} strokeWidth={2}
    />
  );
}

// ── Main component ────────────────────────────────────────────
export default function CardCanvas({
  template, cardState, showDebugBoxes, stageRef, onLoadStatusChange,
  previewScaleRef, onPhotoDrag, displayWidth,
}: CardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Initialise directly from displayWidth when provided so there is no
  // single-frame flash at the wrong size before the ResizeObserver fires.
  const [containerWidth, setContainerWidth] = useState(displayWidth ?? 320);
  const [flagStatus, setFlagStatus] = useState<string>("loading");

  // Container width observer — skipped when displayWidth is supplied.
  useEffect(() => {
    if (displayWidth && displayWidth > 0) {
      setContainerWidth(displayWidth);
      return; // no ResizeObserver needed; parent owns the size
    }
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setContainerWidth(w);
    });
    ro.observe(el);
    const w = el.clientWidth;
    if (w > 0) setContainerWidth(w);
    return () => ro.disconnect();
  }, [displayWidth]);

  // Load template base images
  const [bgImage,      bgStatus]      = useImage(template.assets.background, "anonymous");
  const [overlayImage, overlayStatus] = useImage(template.assets.overlay,    "anonymous");

  // Determine active render mode before loading images so useImage always
  // receives a stable, correct URL on every render.
  const isCutoutMode = Boolean(
    cardState.photo.src && cardState.photo.isCutout && cardState.photo.cutoutSrc,
  );
  const activePhotoSrc = isCutoutMode
    ? (cardState.photo.cutoutSrc ?? "")
    : (cardState.photo.src ?? "");

  // Load user photo (data URL — never leaves browser)
  const [photoImg] = useImage(activePhotoSrc);

  // Load the FUT-style player silhouette (shown when no photo is uploaded)
  const [silhouetteImage] = useImage(PLAYER_SILHOUETTE);

  // Resolved layout + pixel coordinates
  const layout         = resolveLayout(template);
  const style          = template.style;
  const contentProfile = getContentProfile(template.contentProfileId);
  const isPremiumGoldV3 =
    template.id === "gold_elite_2026" ||
    template.id === "gold_crystal_2026";

  const isPremiumNonGoldV3 =
    template.id === "black_elite_2026"    ||
    template.id === "purple_holo_2026"   ||
    template.id === "blue_electric_2026" ||
    template.id === "red_fire_2026"      ||
    template.id === "silver_classic_2026"||
    template.id === "silver_chrome_2026" ||
    template.id === "world_edition_2026" ||
    template.id === "usa_host_2026"      ||
    template.id === "fangirl_pink_2026"  ||
    template.id === "green_stadium_2026";

  // ── Silhouette box — used when no photo is uploaded ──────────
  const silhouetteBox = getSilhouetteBox(layout, template.id);
  const sbX = nX(silhouetteBox.x);
  const sbY = nY(silhouetteBox.y);
  const sbW = nW(silhouetteBox.w);
  const sbH = nH(silhouetteBox.h);

  // ── Photo box — normal opaque uploaded photo ──────────────────
  const photoBox = getPhotoBox(layout, template.id);
  const pbX = nX(photoBox.x);
  const pbY = nY(photoBox.y);
  const pbW = nW(photoBox.w);
  const pbH = nH(photoBox.h);

  // ── Cutout box — transparent PNG player layer ──────────────────
  const cutoutBox = getCutoutBox(layout, template.id);
  const cbX = nX(cutoutBox.x);
  const cbY = nY(cutoutBox.y);
  const cbW = nW(cutoutBox.w);
  const cbH = nH(cutoutBox.h);

  // ── Active mask box — switches per mode ───────────────────────
  // The masked overlay hole must match whichever content is in the player zone.
  // cutout mode → cutoutBox  |  normal photo → photoBox  |  no photo → silhouetteBox
  const activeMaskX = isCutoutMode ? cbX : (cardState.photo.src ? pbX : sbX);
  const activeMaskY = isCutoutMode ? cbY : (cardState.photo.src ? pbY : sbY);
  const activeMaskW = isCutoutMode ? cbW : (cardState.photo.src ? pbW : sbW);
  const activeMaskH = isCutoutMode ? cbH : (cardState.photo.src ? pbH : sbH);

  // ── Masked overlay (Phase 1.5 engine) ───────────────────────
  // Hole is cut at the active player box so the card frame overlaps
  // the correct zone for every render mode.
  const maskedOverlay = useMaskedOverlay(
    overlayImage, overlayStatus, template.id,
    activeMaskX, activeMaskY, activeMaskW, activeMaskH,
  );

  // Per-template backdrop colour — used in the Konva Rect below
  const templateBackdrop = TEMPLATE_BACKDROPS[template.id] ?? DEFAULT_TEMPLATE_BACKDROP;

  const maskedOverlayStatus = maskedOverlay
    ? "loaded"
    : overlayStatus === "loaded" ? "masking" : overlayStatus;

  useEffect(() => {
    onLoadStatusChange?.({ background: bgStatus, overlay: maskedOverlayStatus, flag: flagStatus });
  }, [bgStatus, maskedOverlayStatus, flagStatus, onLoadStatusChange]);

  // Preview scale
  const previewScale = containerWidth / TEMPLATE_W;
  const stageW = TEMPLATE_W * previewScale;
  const stageH = TEMPLATE_H * previewScale;
  if (previewScaleRef) previewScaleRef.current = previewScale;

  // Remaining pixel zones
  const ratingX = nX(layout.rating.x);
  const ratingY = nY(layout.rating.y);
  const ratingW = nW(layout.rating.w);
  const ratingH = nH(layout.rating.h);

  const posX = nX(layout.position.x);
  const posY = nY(layout.position.y);
  const posW = nW(layout.position.w);
  const posH = nH(layout.position.h);

  const flagX = nX(layout.flag.x);
  const flagY = nY(layout.flag.y);
  const flagW = nW(layout.flag.w);
  const flagH = nH(layout.flag.h);

  const badgeX = nX(layout.badge.x);
  const badgeY = nY(layout.badge.y);
  const badgeW = nW(layout.badge.w);
  const badgeH = nH(layout.badge.h);

  const nameX = nX(layout.name.x);
  const nameY = nY(layout.name.y);
  const nameW = nW(layout.name.w);
  const nameH = nH(layout.name.h);

  const ratingFontSize = ratingH * Math.max(contentProfile.ratingFontRatio,   0.84);
  const posFontSize    = posH    * Math.max(contentProfile.positionFontRatio, 0.78);
  const nameFontSize   = nameH   * Math.max(contentProfile.nameFontRatio,    0.78);

  // Photo transform values
  const { photo } = cardState;
  const photoOffsetX = photoImg ? photoImg.naturalWidth  / 2 : 0;
  const photoOffsetY = photoImg ? photoImg.naturalHeight / 2 : 0;

  return (
    <div ref={containerRef} className="w-full">
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        scaleX={previewScale}
        scaleY={previewScale}
      >
        {/* ═══════════════════════════════════════════════════
            LAYER 1 — Visual composite (bottom → top)
            a) overlay.png — full card base, unmasked
               background.png is NOT used: it may be fully transparent.
               The unmasked overlay IS the complete card visual.
            b) Portrait — silhouette (no photo) or uploaded photo
               Clipped to portraitBox from getPortraitBox().
            c) overlay.png — same image, but masked with a portrait hole
               Sits above the portrait so the card frame overlaps
               the portrait edges, exactly as on real FUT cards.
               Because (a) already fills the full card, the hole
               in (c) reveals portrait content, not a black canvas.
        ═══════════════════════════════════════════════════ */}
        <Layer>
          {/* 0) Backdrop Rect — always first in Layer 1.
               Fills the entire Konva Stage canvas with a solid colour before
               overlay.png is drawn. For templates whose overlay.png has shaped
               transparency (gold_crystal, usa_host, fangirl_pink), this
               prevents those transparent areas from appearing as transparent
               in the exported PNG.
               For templates whose overlay.png is 100% opaque (silver_chrome,
               gold_elite, etc.), the opaque overlay pixels cover this Rect
               completely — zero visual impact.
               listening={false} keeps it non-interactive.            */}
          <Rect
            x={0} y={0}
            width={TEMPLATE_W} height={TEMPLATE_H}
            fill={templateBackdrop}
            listening={false}
          />

          {/* a) Full card base — overlay.png unmasked */}
          {overlayImage && (
            <KImage image={overlayImage} x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} />
          )}

          {/* b-1) NO PHOTO — silhouette rendered directly in the Layer.
               IMPORTANT: do NOT wrap this in a clip Group.
               A Konva clip Group clears its rectangular region before drawing,
               which punches a black hole through the overlay base in step (a).
               The clean PNG has a transparent background, so no clip needed.
               Asset: fut_player_silhouette_clean_transparent.png
               Ratio: CLEAN_SILHOUETTE_RATIO = 1046/1279                     */}
          {!photo.src && silhouetteImage && (() => {
            const silH = sbH * 0.94;
            const silW = silH * CLEAN_SILHOUETTE_RATIO;
            const silX = sbX + (sbW - silW) / 2;
            const silY = sbY + sbH * 0.02;
            return (
              <KImage
                image={silhouetteImage}
                x={silX}
                y={silY}
                width={silW}
                height={silH}
                opacity={0.56}
                listening={false}
              />
            );
          })()}

          {/* b-2) NORMAL PHOTO (Mode B) — clip Group prevents bleeding.
               Clip is correct here: opaque rectangular photo must not bleed
               outside the photo zone. Photo box is smaller so photo never
               covers name or stats.                                         */}
          {photo.src && !isCutoutMode && (
            <Group clipX={pbX} clipY={pbY} clipWidth={pbW} clipHeight={pbH}>
              {photoImg && (
                <KImage
                  image={photoImg}
                  x={photo.x}
                  y={photo.y}
                  scaleX={photo.scale}
                  scaleY={photo.scale}
                  rotation={photo.rotation}
                  offsetX={photoOffsetX}
                  offsetY={photoOffsetY}
                  draggable
                  onDragEnd={(e) => {
                    onPhotoDrag?.({ x: e.target.x(), y: e.target.y() });
                  }}
                />
              )}
            </Group>
          )}

          {/* b-3) TRANSPARENT PNG CUTOUT (Mode C) — render directly in Layer.
               NO clip Group — the PNG transparency does the masking.
               Placed at the same z-position as normal photo / silhouette:
               AFTER card base, BEFORE masked overlay, BEFORE text layers.
               Drag/zoom/rotate use the same photo state as Mode B.          */}
          {isCutoutMode && photoImg && (
            <KImage
              image={photoImg}
              x={photo.x}
              y={photo.y}
              scaleX={photo.scale}
              scaleY={photo.scale}
              rotation={photo.rotation}
              offsetX={photoOffsetX}
              offsetY={photoOffsetY}
              draggable
              onDragEnd={(e) => {
                onPhotoDrag?.({ x: e.target.x(), y: e.target.y() });
              }}
            />
          )}

          {/* c) Masked overlay */}
          {maskedOverlay ? (
            <KImage
              key={`masked-${template.id}`}
              image={maskedOverlay}
              x={0} y={0}
              width={TEMPLATE_W} height={TEMPLATE_H}
            />
          ) : overlayImage ? (
            <KImage image={overlayImage} x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} />
          ) : null}
        </Layer>

        {/* ═══════════════════════════════════════════════════
            LAYER 2 — Card content
            V3 branch for gold_elite_2026 / generic for all others
        ═══════════════════════════════════════════════════ */}
        <Layer>
          {isPremiumGoldV3 ? (() => {
            /* ─────────────────────────────────────────────────
               GOLD ELITE V3 — Premium content overlay
               Panels first (behind text), then text/images
            ───────────────────────────────────────────────── */

            // ── V3.2 local coords ──────────────────────────
            // Left meta panel (simplified, smaller)
            const leftPanelX = nX(0.080);  const leftPanelY = nY(0.090);
            const leftPanelW = nW(0.195);  const leftPanelH = nH(0.340);

            // Rating slot
            const rSlotX = nX(0.086);  const rSlotY = nY(0.095);
            const rSlotW = nW(0.188);  const rSlotH = nH(0.110);

            // Position slot
            const pSlotX = nX(0.105);  const pSlotY = nY(0.200);
            const pSlotW = nW(0.150);  const pSlotH = nH(0.052);

            // Flag slot
            const fSlotX = nX(0.118);  const fSlotY = nY(0.265);
            const fSlotW = nW(0.125);  const fSlotH = nH(0.060);

            // FC badge slot
            const bSlotX = nX(0.118);  const bSlotY = nY(0.338);
            const bSlotW = nW(0.125);  const bSlotH = nH(0.092);

            // Unified bottom content block (replaces separate nameplate + stats panel)
            const bbX = nX(0.085);  const bbY = nY(0.545);
            const bbW = nW(0.830);  const bbH = nH(0.370);

            // Inner gold separator under the name
            const lineX = nX(0.135);  const lineY = nY(0.660);
            const lineW = nW(0.730);  const lineH = Math.max(nH(0.003), 2);

            // Name slot inside bottom block
            const nSlotX = nX(0.125);  const nSlotY = nY(0.590);
            const nSlotW = nW(0.750);  const nSlotH = nH(0.070);

            // Center divider inside stats area
            const dvX = nX(0.500);    const dvY = nY(0.675);
            const dvW = Math.max(nW(0.002), 2.5);
            const dvH = nH(0.225);

            // ── V3.2 derived values ────────────────────────────
            const rawPos = cardState.player.position;
            const v3Pos  = (!rawPos || rawPos === "POS") ? "ST" : rawPos.toUpperCase();

            const v3Name = cardState.player.name.toUpperCase();
            let v3NameFs = 76;
            if (v3Name.length > 12) v3NameFs = 64;
            if (v3Name.length > 16) v3NameFs = 54;

            // Flag 4:3 aspect correction
            const flagAR  = 4 / 3;
            const fZoneAR = fSlotW / fSlotH;
            let v3fW = fSlotW, v3fH = fSlotH;
            if (fZoneAR > flagAR) { v3fH = fSlotH; v3fW = fSlotH * flagAR; }
            else                  { v3fW = fSlotW; v3fH = fSlotW / flagAR; }
            const v3fX = fSlotX + (fSlotW - v3fW) / 2;
            const v3fY = fSlotY + (fSlotH - v3fH) / 2;

            // FC badge circle
            const bcx = bSlotX + bSlotW / 2;
            const bcy = bSlotY + bSlotH / 2;
            const bR  = Math.min(bSlotW, bSlotH) * 0.36;

            return (
              <>
                {/* ══ LEFT META PANEL — border removed, elements float freely ═══ */}

                {/* ══ SLIM NAMEPLATE ═══════════════════════════════════ */}
                <Rect
                  x={nX(0.145)} y={nY(0.585)} width={nW(0.710)} height={nH(0.070)}
                  fill="rgba(0, 0, 0, 0)"
                  stroke="rgba(255, 220, 120, 0.32)" strokeWidth={1.6}
                  cornerRadius={14}
                  listening={false}
                />

                {/* Center divider between left/right stat columns */}
                <Rect
                  x={dvX - dvW / 2} y={dvY} width={dvW} height={dvH}
                  fill="rgba(255, 220, 120, 0.32)"
                  listening={false}
                />

                {/* Row chips behind each stat row */}
                {V3_STATS.map((s) => {
                  const chipX = nX(s.colX - 0.016);
                  const chipY = nY(s.rowY + 0.003);
                  const chipW = nW(s.colW + 0.032);
                  const chipH = nH(V3_ROW_H - 0.006);
                  return (
                    <Rect
                      key={`chip-${s.key}`}
                      x={chipX} y={chipY} width={chipW} height={chipH}
                      fill="rgba(10, 7, 2, 0.26)"
                      stroke="rgba(255, 220, 120, 0.28)" strokeWidth={1.2}
                      cornerRadius={10}
                      listening={false}
                    />
                  );
                })}

                {/* ══ FLAG ═══════════════════════════════════════ */}
                <Rect
                  x={fSlotX} y={fSlotY} width={fSlotW} height={fSlotH}
                  fill="rgba(0,0,0,0.30)"
                  stroke={V3_GOLD.flagBorder} strokeWidth={1.2}
                  cornerRadius={5}
                  listening={false}
                />
                <FlagZone
                  flagUrl={cardState.player.flagPath}
                  countryCode={cardState.player.countryCode}
                  x={v3fX} y={v3fY} w={v3fW} h={v3fH}
                  preserveAspectRatio={false}
                  flagAspectRatio={flagAR}
                  onStatus={setFlagStatus}
                />

                {/* ══ FC MONOGRAM ════════════════════════════════ */}
                <Circle
                  x={bcx} y={bcy} radius={bR}
                  fill="rgba(0,0,0,0.34)"
                  stroke="rgba(255,220,120,0.42)" strokeWidth={2}
                  listening={false}
                />
                <Text
                  x={bSlotX} y={bSlotY} width={bSlotW} height={bSlotH}
                  text="FC"
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={42}
                  fill={V3_GOLD.primaryText}
                  shadowColor={V3_GOLD.shadow} shadowBlur={5}
                  align="center" verticalAlign="middle"
                  listening={false}
                />

                {/* ══ RATING ═════════════════════════════════════ */}
                <Text
                  x={rSlotX} y={rSlotY} width={rSlotW} height={rSlotH}
                  text={String(cardState.player.rating)}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={132}
                  fill={V3_GOLD.primaryText}
                  stroke="rgba(70,40,0,0.48)" strokeWidth={1.4}
                  shadowColor={V3_GOLD.shadow} shadowBlur={10} shadowOffsetY={3}
                  align="center" verticalAlign="middle"
                  listening={false}
                />

                {/* ══ POSITION ═══════════════════════════════════ */}
                <Text
                  x={pSlotX} y={pSlotY} width={pSlotW} height={pSlotH}
                  text={v3Pos}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={54}
                  fill={V3_GOLD.secondaryText}
                  shadowColor={V3_GOLD.shadow} shadowBlur={6}
                  align="center" verticalAlign="middle"
                  letterSpacing={1}
                  listening={false}
                />

                {/* ══ NAME (inside bottom block) ═════════════════ */}
                <Text
                  x={nSlotX} y={nSlotY} width={nSlotW} height={nSlotH}
                  text={v3Name}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={v3NameFs}
                  fill="#FFF6C7"
                  shadowColor="rgba(0,0,0,0.90)" shadowBlur={8} shadowOffsetY={2}
                  align="center" verticalAlign="middle"
                  letterSpacing={2.4}
                  listening={false}
                />

                {/* ══ INLINE STATS (inside bottom block) ════════ */}
                {V3_STATS.map((s) => {
                  const cX  = nX(s.colX);
                  const cW  = nW(s.colW);
                  const rY  = nY(s.rowY);
                  const rH  = nH(V3_ROW_H);
                  const vW  = cW * 0.38;
                  const gap = cW * 0.045;
                  const lW  = cW * 0.575;
                  const val = cardState.stats[s.key];
                  return (
                    <Group key={`v3-${s.key}`}>
                      <Text
                        x={cX} y={rY} width={vW} height={rH}
                        text={String(val ?? "")}
                        fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={84}
                        fill="#FFF6C7"
                        stroke="rgba(70,40,0,0.38)" strokeWidth={0.9}
                        shadowColor="rgba(0,0,0,0.95)" shadowBlur={8} shadowOffsetY={2}
                        align="right" verticalAlign="middle"
                        listening={false}
                      />
                      <Text
                        x={cX + vW + gap} y={rY} width={lW} height={rH}
                        text={s.key}
                        fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={60}
                        fill="#F3CD55"
                        opacity={1}
                        stroke="rgba(70,40,0,0.30)" strokeWidth={0.6}
                        shadowColor="rgba(0,0,0,0.95)" shadowBlur={7} shadowOffsetY={2}
                        letterSpacing={1}
                        align="left" verticalAlign="middle"
                        listening={false}
                      />
                    </Group>
                  );
                })}
              </>
            );
          })() : isPremiumNonGoldV3 ? (() => {
            /* ─────────────────────────────────────────────────
               PREMIUM NON-GOLD V3 — same geometry as locked gold,
               palette driven by NON_GOLD_PALETTES map.
               Gold branch above is NOT touched.
            ───────────────────────────────────────────────── */
            const paletteId = NON_GOLD_TEMPLATE_PALETTE[template.id] ?? "dark";
            const p = NON_GOLD_PALETTES[paletteId];

            // Same coords as locked gold
            const rSlotX = nX(0.086);  const rSlotY = nY(0.095);
            const rSlotW = nW(0.188);  const rSlotH = nH(0.110);
            const pSlotX = nX(0.105);  const pSlotY = nY(0.200);
            const pSlotW = nW(0.150);  const pSlotH = nH(0.052);
            const fSlotX = nX(0.118);  const fSlotY = nY(0.265);
            const fSlotW = nW(0.125);  const fSlotH = nH(0.060);
            const bSlotX = nX(0.118);  const bSlotY = nY(0.338);
            const bSlotW = nW(0.125);  const bSlotH = nH(0.092);
            const nSlotX = nX(0.125);  const nSlotY = nY(0.590);
            const nSlotW = nW(0.750);  const nSlotH = nH(0.070);
            const dvX2 = nX(0.500);    const dvY2 = nY(0.675);
            const dvW2 = Math.max(nW(0.002), 2.5);
            const dvH2 = nH(0.225);

            const rawPos2  = cardState.player.position;
            const ngPos    = (!rawPos2 || rawPos2 === "POS") ? "ST" : rawPos2.toUpperCase();
            const ngName   = cardState.player.name.toUpperCase();
            let   ngNameFs = 76;
            if (ngName.length > 12) ngNameFs = 64;
            if (ngName.length > 16) ngNameFs = 54;

            // Flag 4:3 aspect correction
            const ngFlagAR  = 4 / 3;
            const ngFZoneAR = fSlotW / fSlotH;
            let ngfW = fSlotW, ngfH = fSlotH;
            if (ngFZoneAR > ngFlagAR) { ngfH = fSlotH; ngfW = fSlotH * ngFlagAR; }
            else                      { ngfW = fSlotW; ngfH = fSlotW / ngFlagAR; }
            const ngfX = fSlotX + (fSlotW - ngfW) / 2;
            const ngfY = fSlotY + (fSlotH - ngfH) / 2;

            const ngBcx = bSlotX + bSlotW / 2;
            const ngBcy = bSlotY + bSlotH / 2;
            const ngBR  = Math.min(bSlotW, bSlotH) * 0.36;

            return (
              <>
                {/* ══ SLIM NAMEPLATE ═══════════════════════════════ */}
                <Rect
                  x={nX(0.145)} y={nY(0.585)} width={nW(0.710)} height={nH(0.070)}
                  fill={p.nameplateFill}
                  stroke={p.stroke} strokeWidth={1.6}
                  cornerRadius={14}
                  listening={false}
                />

                {/* ══ CENTER DIVIDER ════════════════════════════════ */}
                <Rect
                  x={dvX2 - dvW2 / 2} y={dvY2} width={dvW2} height={dvH2}
                  fill={p.divider}
                  listening={false}
                />

                {/* ══ ROW CHIPS ════════════════════════════════════ */}
                {V3_STATS.map((s) => {
                  const chipX = nX(s.colX - 0.016);
                  const chipY = nY(s.rowY + 0.003);
                  const chipW = nW(s.colW + 0.032);
                  const chipH = nH(V3_ROW_H - 0.006);
                  return (
                    <Rect
                      key={`ng-chip-${s.key}`}
                      x={chipX} y={chipY} width={chipW} height={chipH}
                      fill={p.chipFill}
                      stroke={p.chipStroke} strokeWidth={1.2}
                      cornerRadius={10}
                      listening={false}
                    />
                  );
                })}

                {/* ══ FLAG ══════════════════════════════════════════ */}
                <Rect
                  x={fSlotX} y={fSlotY} width={fSlotW} height={fSlotH}
                  fill={p.metaFill}
                  stroke={p.stroke} strokeWidth={1.2}
                  cornerRadius={5}
                  listening={false}
                />
                <FlagZone
                  flagUrl={cardState.player.flagPath}
                  countryCode={cardState.player.countryCode}
                  x={ngfX} y={ngfY} w={ngfW} h={ngfH}
                  preserveAspectRatio={false}
                  flagAspectRatio={ngFlagAR}
                  onStatus={setFlagStatus}
                />

                {/* ══ FC MONOGRAM ═══════════════════════════════════ */}
                <Circle
                  x={ngBcx} y={ngBcy} radius={ngBR}
                  fill={p.metaFill}
                  stroke={p.strokeStrong} strokeWidth={2}
                  listening={false}
                />
                <Text
                  x={bSlotX} y={bSlotY} width={bSlotW} height={bSlotH}
                  text="FC"
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={42}
                  fill={p.primaryText}
                  shadowColor={p.shadow} shadowBlur={5}
                  align="center" verticalAlign="middle"
                  listening={false}
                />

                {/* ══ RATING ════════════════════════════════════════ */}
                <Text
                  x={rSlotX} y={rSlotY} width={rSlotW} height={rSlotH}
                  text={String(cardState.player.rating)}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={132}
                  fill={p.primaryText}
                  shadowColor={p.shadow} shadowBlur={10} shadowOffsetY={3}
                  align="center" verticalAlign="middle"
                  listening={false}
                />

                {/* ══ POSITION ══════════════════════════════════════ */}
                <Text
                  x={pSlotX} y={pSlotY} width={pSlotW} height={pSlotH}
                  text={ngPos}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={54}
                  fill={p.secondaryText}
                  shadowColor={p.shadow} shadowBlur={6}
                  align="center" verticalAlign="middle"
                  letterSpacing={1}
                  listening={false}
                />

                {/* ══ NAME ══════════════════════════════════════════ */}
                <Text
                  x={nSlotX} y={nSlotY} width={nSlotW} height={nSlotH}
                  text={ngName}
                  fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={ngNameFs}
                  fill={p.primaryText}
                  shadowColor={p.shadow} shadowBlur={8} shadowOffsetY={2}
                  align="center" verticalAlign="middle"
                  letterSpacing={2.4}
                  listening={false}
                />

                {/* ══ INLINE STATS ══════════════════════════════════ */}
                {V3_STATS.map((s) => {
                  const cX  = nX(s.colX);
                  const cW  = nW(s.colW);
                  const rY  = nY(s.rowY);
                  const rH  = nH(V3_ROW_H);
                  const vW  = cW * 0.38;
                  const gap = cW * 0.045;
                  const lW  = cW * 0.575;
                  const val = cardState.stats[s.key];
                  return (
                    <Group key={`ng-${s.key}`}>
                      <Text
                        x={cX} y={rY} width={vW} height={rH}
                        text={String(val ?? "")}
                        fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={84}
                        fill={p.primaryText}
                        shadowColor={p.shadow} shadowBlur={8} shadowOffsetY={2}
                        align="right" verticalAlign="middle"
                        listening={false}
                      />
                      <Text
                        x={cX + vW + gap} y={rY} width={lW} height={rH}
                        text={s.key}
                        fontFamily="D-DIN Condensed" fontStyle="bold" fontSize={60}
                        fill={p.secondaryText}
                        opacity={1}
                        shadowColor={p.shadow} shadowBlur={7} shadowOffsetY={2}
                        letterSpacing={1}
                        align="left" verticalAlign="middle"
                        listening={false}
                      />
                    </Group>
                  );
                })}
              </>
            );
          })() : (
            <>
              {/* ─────────────────────────────────────────────
                  GENERIC CONTENT — all templates except gold_elite_2026
              ───────────────────────────────────────────── */}

              {/* Flag — aspect-ratio corrected via profile */}
              <FlagZone
                flagUrl={cardState.player.flagPath}
                countryCode={cardState.player.countryCode}
                x={flagX} y={flagY} w={flagW} h={flagH}
                preserveAspectRatio={contentProfile.preserveFlagAspectRatio}
                flagAspectRatio={contentProfile.flagAspectRatio}
                onStatus={setFlagStatus}
              />

              {/* Badge — circle opacity further reduced for less visual weight */}
              <BadgeZone
                badge={cardState.badge}
                x={badgeX} y={badgeY} w={badgeW} h={badgeH}
                circleOpacity={contentProfile.badgeCircleOpacity * 0.75}
                circleStrokeOpacity={contentProfile.badgeCircleStrokeOpacity * 0.75}
                iconScale={contentProfile.badgeIconScale}
              />

              {/* Stats divider — rendered before stat text so text sits above */}
              {contentProfile.showStatsDivider && layout.stats.divider && (() => {
                const dvX = nX(layout.stats.divider.x);
                const dvY = nY(layout.stats.divider.y);
                const dvH = nH(layout.stats.divider.h);
                const dvW = Math.max(nW(layout.stats.divider.w), 1.5);
                const dvXAdj = dvX - dvW / 2;
                return (
                  <Rect
                    x={dvXAdj} y={dvY}
                    width={dvW} height={dvH}
                    fill={contentProfile.dividerColor}
                    opacity={contentProfile.dividerOpacity}
                    listening={false}
                  />
                );
              })()}

              {/* Rating */}
              <Text
                x={ratingX} y={ratingY} width={ratingW} height={ratingH}
                text={String(cardState.player.rating)}
                fontSize={ratingFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                fill={style.ratingColor} align={layout.rating.align} verticalAlign="middle"
                shadowEnabled={contentProfile.shadowEnabled}
                shadowBlur={contentProfile.ratingShadowBlur}
                shadowColor={contentProfile.shadowColor}
              />

              {/* Position */}
              <Text
                x={posX} y={posY} width={posW} height={posH}
                text={cardState.player.position}
                fontSize={posFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                fill={style.textColor} align={layout.position.align} verticalAlign="middle"
                shadowEnabled={contentProfile.shadowEnabled}
                shadowBlur={contentProfile.positionShadowBlur}
                shadowColor={contentProfile.shadowColor}
              />

              {/* Player name */}
              <Text
                x={nameX} y={nameY} width={nameW} height={nameH}
                text={cardState.player.name.toUpperCase()}
                fontSize={nameFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                letterSpacing={1.2}
                fill={style.nameColor} align={layout.name.align} verticalAlign="middle"
                shadowEnabled={contentProfile.shadowEnabled}
                shadowBlur={contentProfile.nameShadowBlur}
                shadowColor={contentProfile.shadowColor}
              />

              {/* Stats — inline FUT rows: "99 PAC" value + label side by side */}
              {[...layout.stats.left, ...layout.stats.right].map((s) => {
                const sx      = nX(s.x);
                const sy      = nY(s.y);
                const sw      = nW(s.w);
                const sh      = nH(s.h);
                const valSize = sh * 0.58;
                const lblSize = sh * 0.46;
                const valueW  = sw * 0.42;
                const gap     = sw * 0.04;
                const labelW  = sw * 0.52;
                const val = cardState.stats[s.key as StatKey];
                return (
                  <Group key={s.key}>
                    <Text
                      x={sx} y={sy} width={valueW} height={sh}
                      text={String(val ?? "")}
                      fontSize={valSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                      fill={style.statsColor} align="right" verticalAlign="middle"
                      shadowEnabled={contentProfile.shadowEnabled}
                      shadowBlur={contentProfile.statShadowBlur}
                      shadowColor={contentProfile.shadowColor}
                    />
                    <Text
                      x={sx + valueW + gap} y={sy} width={labelW} height={sh}
                      text={s.key}
                      fontSize={lblSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                      fill={style.statsColor}
                      opacity={contentProfile.statLabelOpacity}
                      align="left" verticalAlign="middle"
                      shadowEnabled={contentProfile.shadowEnabled}
                      shadowBlur={contentProfile.statShadowBlur}
                      shadowColor={contentProfile.shadowColor}
                    />
                  </Group>
                );
              })}
            </>
          )}
        </Layer>

        {/* ═══════════════════════════════════════════════════
            LAYER 3 — Debug boxes (conditional)
        ═══════════════════════════════════════════════════ */}
        {showDebugBoxes && (
          <Layer>
            <DebugBox x={sbX} y={sbY} w={sbW} h={sbH} color={DEBUG_COLORS.photo} />
            <DebugBox x={pbX} y={pbY} w={pbW} h={pbH} color={DEBUG_COLORS.photo} />
            <DebugBox x={ratingX} y={ratingY} w={ratingW} h={ratingH} color={DEBUG_COLORS.rating} />
            <DebugBox x={posX}    y={posY}    w={posW}    h={posH}    color={DEBUG_COLORS.position} />
            <DebugBox x={flagX}   y={flagY}   w={flagW}   h={flagH}   color={DEBUG_COLORS.flag} />
            <DebugBox x={badgeX}  y={badgeY}  w={badgeW}  h={badgeH}  color={DEBUG_COLORS.badge} />
            <DebugBox x={nameX}   y={nameY}   w={nameW}   h={nameH}   color={DEBUG_COLORS.name} />
            {[...layout.stats.left, ...layout.stats.right].map((s) => (
              <DebugBox key={s.key}
                x={nX(s.x)} y={nY(s.y)} w={nW(s.w)} h={nH(s.h)}
                color={DEBUG_COLORS.stats}
              />
            ))}
          </Layer>
        )}
      </Stage>
    </div>
  );
}
