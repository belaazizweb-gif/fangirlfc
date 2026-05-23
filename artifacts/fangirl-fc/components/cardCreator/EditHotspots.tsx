"use client";

import type { CardLayoutDefinition } from "@/lib/cardCreator/templateConfig";

export type EditSheet = "photo" | "info" | "badge" | "stats";

interface HotspotDef {
  key: string;
  sheet: EditSheet;
  icon: string;
  /** Normalized (0–1) center of the button on the card */
  cx: number;
  cy: number;
  /** Normalized (0–1) arrow-tip target point (set equal to cx/cy for no arrow) */
  tx: number;
  ty: number;
  large?: boolean;
}

function buildHotspots(layout: CardLayoutDefinition): HotspotDef[] {
  const { photo: pz, flag: fz, badge: bz, stats } = layout;

  const statMidY =
    stats.left.length > 0
      ? stats.left[Math.floor(stats.left.length / 2)].y +
        stats.left[Math.floor(stats.left.length / 2)].h / 2
      : 0.78;

  // 5 hotspots after consolidating the 4 redundant info→info buttons
  // (rating, position, flag, name all opened "info") into one.
  return [
    // 1 — Photo (large, no arrow line)
    {
      key: "photo",
      sheet: "photo",
      icon: "📸",
      cx: pz.x + pz.w * 0.82,
      cy: pz.y + pz.h * 0.13,
      tx: pz.x + pz.w * 0.82,
      ty: pz.y + pz.h * 0.13,
      large: true,
    },
    // 2 — Info (consolidated: covers rating + position + name)
    //     Button sits just right of the left meta panel; arrow points back left.
    {
      key: "info",
      sheet: "info",
      icon: "✏️",
      cx: 0.305,
      cy: 0.215,
      tx: 0.175,
      ty: 0.215,
    },
    // 3 — Flag / Nation (opens info sheet — same as before)
    {
      key: "flag",
      sheet: "info",
      icon: "🌍",
      cx: fz.x + fz.w / 2,
      cy: fz.y + fz.h / 2,
      tx: fz.x + fz.w / 2,
      ty: fz.y + fz.h / 2,
    },
    // 4 — Badge / Club
    {
      key: "badge",
      sheet: "badge",
      icon: "🏅",
      cx: bz.x + bz.w / 2,
      cy: bz.y + bz.h / 2,
      tx: bz.x + bz.w / 2,
      ty: bz.y + bz.h / 2,
    },
    // 5 — Stats (button on right edge, arrow points left to stats centre)
    {
      key: "stats",
      sheet: "stats",
      icon: "📊",
      cx: 0.915,
      cy: statMidY,
      tx: 0.50,
      ty: statMidY,
    },
  ];
}

/**
 * DOM overlay of arrow-callout edit buttons positioned over the Konva card.
 *
 * Rendered as `absolute inset-0` inside the card's `relative` container.
 * These are pure DOM elements — NOT part of the Konva stage and will never
 * appear in the exported PNG.
 *
 * Visual style: small pill buttons with a gold border, connected to their
 * target area via a thin SVG dashed line ending in a dot.
 *
 * Applied globally to all templates (B4 strategy — no templateId needed).
 */
export default function EditHotspots({ layout, onEdit }: { layout: CardLayoutDefinition; onEdit: (sheet: EditSheet) => void }) {
  const hotspots = buildHotspots(layout);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">

      {/* SVG arrow lines — drawn below buttons so buttons appear on top */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ pointerEvents: "none" }}
      >
        {hotspots.map((h) => {
          // Only draw when button and target are meaningfully different
          const dx = (h.tx - h.cx) * 100;
          const dy = (h.ty - h.cy) * 100;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1.5) return null;
          return (
            <g key={`arrow-${h.key}`}>
              {/* Connector line */}
              <line
                x1={h.cx * 100} y1={h.cy * 100}
                x2={h.tx * 100} y2={h.ty * 100}
                stroke="rgba(255,220,120,0.55)"
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
              />
              {/* Target dot */}
              <circle
                cx={h.tx * 100} cy={h.ty * 100}
                r="0.9"
                fill="rgba(255,220,120,0.80)"
              />
            </g>
          );
        })}
      </svg>

      {/* Callout buttons */}
      {hotspots.map((h) => {
        const dim = h.large ? 34 : 27;
        return (
          <button
            key={h.key}
            aria-label={`Modifier ${h.key}`}
            onClick={() => onEdit(h.sheet)}
            className="absolute pointer-events-auto rounded-full backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width:       dim,
              height:      dim,
              left:        `${h.cx * 100}%`,
              top:         `${h.cy * 100}%`,
              transform:   "translate(-50%, -50%)",
              fontSize:    h.large ? 14 : 11,
              lineHeight:  1,
              background:  "rgba(0,0,0,0.55)",
              border:      "1px solid rgba(255,220,120,0.45)",
              opacity:     0.90,
              boxShadow:   "0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            {h.icon}
          </button>
        );
      })}
    </div>
  );
}
