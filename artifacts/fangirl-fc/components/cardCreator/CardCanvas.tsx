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
            flag → badge → divider → rating → position → name → stats
        ═══════════════════════════════════════════════════ */}
        <Layer>
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
            // Clamp to at least 1.5px so it's always visible
            const dvW = Math.max(nW(layout.stats.divider.w), 1.5);
            // Keep the divider centered on its original x coordinate
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
            const sx     = nX(s.x);
            const sy     = nY(s.y);
            const sw     = nW(s.w);
            const sh     = nH(s.h);
            const valSize = sh * 0.58;
            const lblSize = sh * 0.46;
            // Inline layout: value right-aligned | gap | label left-aligned
            const valueW = sw * 0.42;
            const gap    = sw * 0.04;
            const labelW = sw * 0.52;
            const val = cardState.stats[s.key as StatKey];
            return (
              <Group key={s.key}>
                {/* Stat value — right-aligned */}
                <Text
                  x={sx} y={sy} width={valueW} height={sh}
                  text={String(val ?? "")}
                  fontSize={valSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                  fill={style.statsColor} align="right" verticalAlign="middle"
                  shadowEnabled={contentProfile.shadowEnabled}
                  shadowBlur={contentProfile.statShadowBlur}
                  shadowColor={contentProfile.shadowColor}
                />
                {/* Stat label — left-aligned, reduced opacity */}
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
