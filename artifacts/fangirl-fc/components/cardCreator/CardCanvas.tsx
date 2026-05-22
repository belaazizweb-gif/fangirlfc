"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Rect, Text, Circle, Group } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { CardTemplateDefinition } from "@/lib/cardCreator/templateConfig";
import { nX, nY, nW, nH, resolveLayout, TEMPLATE_W, TEMPLATE_H, getPortraitBox } from "@/lib/cardCreator/renderUtils";
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

// ── Player silhouette — FUT-style portrait placeholder ────────
// Inline SVG: head (ellipse) + neck (rect) + torso/shoulders (path) + arms (paths).
// viewBox 400×560 — aspect ratio used for correct silhouette sizing below.
// No background rectangle; transparent around the player shape.
const _PLAYER_SILHOUETTE_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">` +
  `<ellipse cx="200" cy="95" rx="62" ry="70" fill="#1a1a2e"/>` +
  `<rect x="177" y="158" width="46" height="35" fill="#1a1a2e"/>` +
  `<path d="M200 193L108 230L68 290L58 420L342 420L332 290L292 230Z" fill="#1a1a2e"/>` +
  `<path d="M108 230L55 240L32 320L50 340L72 280L100 250Z" fill="#1a1a2e"/>` +
  `<path d="M292 230L345 240L368 320L350 340L328 280L300 250Z" fill="#1a1a2e"/>` +
  `</svg>`;

// Pre-encoded once at module load — no runtime cost per render.
const PLAYER_SILHOUETTE = `data:image/svg+xml,${encodeURIComponent(_PLAYER_SILHOUETTE_SVG)}`;

// ── Badge zone — supports generic (emoji) + upload + none ────
function BadgeZone({ badge, x, y, w, h }: { badge: BadgeState; x: number; y: number; w: number; h: number }) {
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
        fill="rgba(0,0,0,0.50)" stroke="rgba(255,255,255,0.18)" strokeWidth={2}
      />
      <Text
        x={x} y={y} width={w} height={h}
        text={emojiMap[id]}
        fontSize={size * 0.62}
        align="center" verticalAlign="middle"
      />
    </Group>
  );
}

// ── Flag with safe SVG fallback ──────────────────────────────
function FlagZone({
  flagUrl, countryCode, x, y, w, h, onStatus,
}: {
  flagUrl: string; countryCode: string;
  x: number; y: number; w: number; h: number;
  onStatus?: (s: string) => void;
}) {
  const [img, status] = useImage(flagUrl, "anonymous");

  useEffect(() => {
    if (status === "loaded") onStatus?.("loaded");
    else if (status === "failed") onStatus?.("fallback");
    else onStatus?.(status);
  }, [status, onStatus]);

  if (status === "loaded" && img) {
    return <KImage image={img} x={x} y={y} width={w} height={h} />;
  }
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill="#1a3a6a" cornerRadius={3} />
      <Text
        x={x} y={y} width={w} height={h}
        text={countryCode}
        fontSize={h * 0.45} fontFamily="D-DIN Condensed" fontStyle="bold"
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

  // Load user photo (data URL — never leaves browser)
  const [photoImg] = useImage(cardState.photo.src || "");

  // Load the FUT-style player silhouette (shown when no photo is uploaded)
  const [silhouetteImage] = useImage(PLAYER_SILHOUETTE);

  // Resolved layout + pixel coordinates
  const layout = resolveLayout(template);
  const style  = template.style;

  // ── Portrait box — single source of truth for all photo/silhouette geometry
  // Uses getPortraitBox so future per-template overrides require only one line
  // in PORTRAIT_OVERRIDES (renderUtils.ts) rather than changes here.
  const portraitBox = getPortraitBox(layout, template.id);
  const pX = nX(portraitBox.x);
  const pY = nY(portraitBox.y);
  const pW = nW(portraitBox.w);
  const pH = nH(portraitBox.h);

  // ── Masked overlay (Phase 1.5 engine) ───────────────────────
  // Hole is cut at the portrait box so it always matches the photo/silhouette.
  const maskedOverlay = useMaskedOverlay(
    overlayImage, overlayStatus, template.id,
    pX, pY, pW, pH,
  );

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

  const ratingFontSize = ratingH * 0.75;
  const posFontSize    = posH    * 0.65;
  const nameFontSize   = nameH   * 0.7;

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
            LAYER 1 — Base card composite
            a) background.png
            b) user photo (or placeholder) clipped to photo zone
            c) masked overlay (hole at photo zone)
        ═══════════════════════════════════════════════════ */}
        <Layer>
          {/* a) Background */}
          {bgImage ? (
            <KImage image={bgImage} x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} />
          ) : (
            <Rect x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} fill="#111122" />
          )}

          {/* b) Portrait layer — clipped to portrait box (getPortraitBox)
               State 1 (no photo): FUT-style player silhouette
               State 2 (photo uploaded): user photo, drag/zoom/rotate
               These are two strictly separate states — never combined.     */}
          <Group clipX={pX} clipY={pY} clipWidth={pW} clipHeight={pH}>
            {photo.src && photoImg ? (
              /*
               * UPLOADED PHOTO — contained within portrait box.
               * x/y = center of photo in logical canvas coordinates.
               * offsetX/offsetY = pivot at natural image center.
               * scaleX/scaleY rotate around that center pivot.
               *
               * TODO: background removal service will replace photo.src
               * with a transparent PNG cutout (cardState.photo.cutoutSrc).
               */
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
            ) : (
              // NO PHOTO — render FUT-style player silhouette
              // SVG aspect ratio: 400 / 560
              // Silhouette height = portrait height × 0.92, centered both axes
              silhouetteImage && (() => {
                const svgAspect = 400 / 560;
                const silH = pH * 0.92;
                const silW = silH * svgAspect;
                return (
                  <KImage
                    image={silhouetteImage}
                    x={pX + (pW - silW) / 2}
                    y={pY + (pH - silH) / 2}
                    width={silW}
                    height={silH}
                    opacity={0.82}
                    listening={false}
                  />
                );
              })()
            )}
          </Group>

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
            flag → badge → rating → position → name → stats
        ═══════════════════════════════════════════════════ */}
        <Layer>
          {/* Flag */}
          <FlagZone
            flagUrl={cardState.player.flagPath}
            countryCode={cardState.player.countryCode}
            x={flagX} y={flagY} w={flagW} h={flagH}
            onStatus={setFlagStatus}
          />

          {/* Badge */}
          <BadgeZone
            badge={cardState.badge}
            x={badgeX} y={badgeY} w={badgeW} h={badgeH}
          />

          {/* Rating */}
          <Text
            x={ratingX} y={ratingY} width={ratingW} height={ratingH}
            text={String(cardState.player.rating)}
            fontSize={ratingFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
            fill={style.ratingColor} align={layout.rating.align} verticalAlign="middle"
            shadowEnabled={style.shadow} shadowBlur={style.shadow ? 6 : 0} shadowColor="rgba(0,0,0,0.6)"
          />

          {/* Position */}
          <Text
            x={posX} y={posY} width={posW} height={posH}
            text={cardState.player.position}
            fontSize={posFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
            fill={style.textColor} align={layout.position.align} verticalAlign="middle"
            shadowEnabled={style.shadow} shadowBlur={style.shadow ? 4 : 0} shadowColor="rgba(0,0,0,0.6)"
          />

          {/* Player name */}
          <Text
            x={nameX} y={nameY} width={nameW} height={nameH}
            text={cardState.player.name.toUpperCase()}
            fontSize={nameFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
            fill={style.nameColor} align={layout.name.align} verticalAlign="middle"
            shadowEnabled={style.shadow} shadowBlur={style.shadow ? 6 : 0} shadowColor="rgba(0,0,0,0.7)"
          />

          {/* Stats */}
          {[...layout.stats.left, ...layout.stats.right].map((s) => {
            const sx      = nX(s.x);
            const sy      = nY(s.y);
            const sw      = nW(s.w);
            const sh      = nH(s.h);
            const valH    = sh * 0.55;
            const lblH    = sh * 0.4;
            const valSize = valH * 0.88;
            const lblSize = lblH * 0.72;
            const val = cardState.stats[s.key as StatKey];
            return (
              <Group key={s.key}>
                <Text
                  x={sx} y={sy} width={sw} height={valH}
                  text={String(val ?? "")}
                  fontSize={valSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                  fill={style.statsColor} align="center" verticalAlign="middle"
                  shadowEnabled={style.shadow} shadowBlur={style.shadow ? 4 : 0} shadowColor="rgba(0,0,0,0.6)"
                />
                <Text
                  x={sx} y={sy + valH} width={sw} height={lblH}
                  text={s.key}
                  fontSize={lblSize} fontFamily="D-DIN Condensed" fontStyle="bold"
                  fill={style.statsColor} align="center" verticalAlign="middle"
                  shadowEnabled={style.shadow} shadowBlur={style.shadow ? 3 : 0} shadowColor="rgba(0,0,0,0.6)"
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
            <DebugBox x={pX}  y={pY}  w={pW}  h={pH}  color={DEBUG_COLORS.photo} />
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
