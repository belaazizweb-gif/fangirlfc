"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KImage, Rect, Text, Circle, Group } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { CardTemplateDefinition } from "@/lib/cardCreator/templateConfig";
import { nX, nY, nW, nH, resolveLayout, TEMPLATE_W, TEMPLATE_H } from "@/lib/cardCreator/renderUtils";
import type { StatKey } from "@/lib/cardCreator/renderUtils";

// ── Sample card data ──────────────────────────────────────────
export const SAMPLE_DATA = {
  rating: 91,
  position: "ST",
  countryCode: "FR",
  flag: "/flags/fr.svg",
  name: "LUCAS MOREAU",
  stats: { PAC: 89, SHO: 86, PAS: 82, DRI: 88, DEF: 45, PHY: 84 } as Record<StatKey, number>,
};

// ── Types ─────────────────────────────────────────────────────
export interface LoadStatus {
  background: string;
  overlay: string;
  flag: string;
}

interface CardCanvasProps {
  template: CardTemplateDefinition;
  showDebugBoxes: boolean;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  onLoadStatusChange?: (s: LoadStatus) => void;
  previewScaleRef?: React.MutableRefObject<number>;
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

// ── Photo placeholder silhouette ─────────────────────────────
function PhotoPlaceholder({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const headR = w * 0.16;
  const headCX = x + w * 0.5;
  const headCY = y + h * 0.28;
  const bodyW  = w * 0.55;
  const bodyH  = h * 0.42;
  const bodyX  = x + (w - bodyW) / 2;
  const bodyY  = y + h * 0.48;
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill="#1e1e30" />
      <Circle x={headCX} y={headCY} radius={headR} fill="#5a5a7a" />
      <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill="#5a5a7a" cornerRadius={8} />
    </Group>
  );
}

// ── Badge placeholder ────────────────────────────────────────
function BadgePlaceholder({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Group>
      <Rect
        x={x + w * 0.1} y={y + h * 0.1}
        width={w * 0.8} height={h * 0.8}
        fill="#2a2050" stroke="#8060c0" strokeWidth={2} cornerRadius={6}
      />
      <Text
        x={x} y={y + h * 0.3}
        width={w} height={h * 0.4}
        text="⚽" fontSize={h * 0.36}
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

  // Fallback: coloured rect + country code text
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill="#1a3a6a" cornerRadius={3} />
      <Text
        x={x} y={y}
        width={w} height={h}
        text={countryCode}
        fontSize={h * 0.45}
        fontFamily="D-DIN Condensed"
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
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
  template, showDebugBoxes, stageRef, onLoadStatusChange, previewScaleRef,
}: CardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);
  const [flagStatus, setFlagStatus] = useState<string>("loading");

  // container width observer
  useEffect(() => {
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
  }, []);

  // load template images
  const [bgImage,      bgStatus]      = useImage(template.assets.background, "anonymous");
  const [overlayImage, overlayStatus] = useImage(template.assets.overlay, "anonymous");

  // Report load status
  useEffect(() => {
    const s: LoadStatus = {
      background: bgStatus,
      overlay:    overlayStatus,
      flag:       flagStatus,
    };
    onLoadStatusChange?.(s);
  }, [bgStatus, overlayStatus, flagStatus, onLoadStatusChange]);

  const previewScale = containerWidth / TEMPLATE_W;
  const stageW = TEMPLATE_W * previewScale;
  const stageH = TEMPLATE_H * previewScale;

  if (previewScaleRef) previewScaleRef.current = previewScale;

  const layout = resolveLayout(template);
  const style  = template.style;

  const photoX = nX(layout.photo.x);
  const photoY = nY(layout.photo.y);
  const photoW = nW(layout.photo.w);
  const photoH = nH(layout.photo.h);

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

  const ratingFontSize  = ratingH * 0.75;
  const posFontSize     = posH    * 0.65;
  const nameFontSize    = nameH   * 0.7;

  return (
    <div ref={containerRef} className="w-full">
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        scaleX={previewScale}
        scaleY={previewScale}
      >
        {/* ── Layer 1: Background + photo placeholder ── */}
        <Layer>
          {bgImage ? (
            <KImage image={bgImage} x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} />
          ) : (
            <Rect x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} fill="#111122" />
          )}
          <PhotoPlaceholder x={photoX} y={photoY} w={photoW} h={photoH} />
        </Layer>

        {/* ── Layer 2: Overlay + all card elements (render order per config) ── */}
        <Layer>
          {/* overlay.png sits on top of the photo */}
          {overlayImage && (
            <KImage image={overlayImage} x={0} y={0} width={TEMPLATE_W} height={TEMPLATE_H} />
          )}

          {/* Rating */}
          <Text
            x={ratingX} y={ratingY} width={ratingW} height={ratingH}
            text={String(SAMPLE_DATA.rating)}
            fontSize={ratingFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
            fill={style.ratingColor} align={layout.rating.align} verticalAlign="middle"
            shadowEnabled={style.shadow} shadowBlur={style.shadow ? 6 : 0} shadowColor="rgba(0,0,0,0.6)"
          />

          {/* Position */}
          <Text
            x={posX} y={posY} width={posW} height={posH}
            text={SAMPLE_DATA.position}
            fontSize={posFontSize} fontFamily="D-DIN Condensed" fontStyle="bold"
            fill={style.textColor} align={layout.position.align} verticalAlign="middle"
            shadowEnabled={style.shadow} shadowBlur={style.shadow ? 4 : 0} shadowColor="rgba(0,0,0,0.6)"
          />

          {/* Flag */}
          <FlagZone
            flagUrl={SAMPLE_DATA.flag} countryCode={SAMPLE_DATA.countryCode}
            x={flagX} y={flagY} w={flagW} h={flagH}
            onStatus={setFlagStatus}
          />

          {/* Badge placeholder */}
          <BadgePlaceholder x={badgeX} y={badgeY} w={badgeW} h={badgeH} />

          {/* Player name */}
          <Text
            x={nameX} y={nameY} width={nameW} height={nameH}
            text={SAMPLE_DATA.name}
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
            return (
              <Group key={s.key}>
                <Text
                  x={sx} y={sy} width={sw} height={valH}
                  text={String(SAMPLE_DATA.stats[s.key as StatKey] ?? "")}
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

        {/* ── Layer 3: Debug boxes (optional) ── */}
        {showDebugBoxes && (
          <Layer>
            <DebugBox x={photoX}  y={photoY}  w={photoW}  h={photoH}  color={DEBUG_COLORS.photo} />
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
