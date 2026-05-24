"use client";

import type { CardLayoutDefinition } from "@/lib/cardCreator/templateConfig";

export type EditSheet = "photo" | "info" | "badge" | "stats";

interface HotspotDef {
  key: string;
  sheet: EditSheet;
  icon: string;
  cx: number;
  cy: number;
  large?: boolean;
}

function buildHotspots(layout: CardLayoutDefinition): HotspotDef[] {
  const { photo: pz, flag: fz, badge: bz, stats } = layout;

  const statMidY =
    stats.left.length > 0
      ? stats.left[Math.floor(stats.left.length / 2)].y +
        stats.left[Math.floor(stats.left.length / 2)].h / 2
      : 0.76;

  return [
    {
      key: "photo",
      sheet: "photo",
      icon: "📸",
      cx: pz.x + pz.w * 0.82,
      cy: pz.y + pz.h * 0.13,
      large: true,
    },
    {
      key: "info",
      sheet: "info",
      icon: "✏️",
      cx: 0.305,
      cy: 0.215,
    },
    {
      key: "flag",
      sheet: "info",
      icon: "🌍",
      cx: fz.x + fz.w / 2,
      cy: fz.y + fz.h / 2,
    },
    {
      key: "badge",
      sheet: "badge",
      icon: "🏅",
      cx: bz.x + bz.w / 2,
      cy: bz.y + bz.h / 2,
    },
    {
      key: "stats",
      sheet: "stats",
      icon: "📊",
      cx: 0.80,
      cy: statMidY,
    },
    {
      key: "name",
      sheet: "info",
      icon: "🖊️",
      cx: 0.50,
      cy: 0.62,
    },
  ];
}

/**
 * DOM overlay of edit hotspot buttons over the Konva card.
 * All hotspots are always visible — tap any to open the relevant editor.
 * These are pure DOM — never part of the Konva stage, never in the exported PNG.
 */
export default function EditHotspots({
  layout,
  onEdit,
}: {
  layout: CardLayoutDefinition;
  onEdit: (sheet: EditSheet) => void;
}) {
  const hotspots = buildHotspots(layout);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="false">
      {hotspots.map((h) => {
        const dim = h.large ? 34 : 27;
        return (
          <button
            key={h.key}
            aria-label={`Modifier ${h.key}`}
            onClick={() => onEdit(h.sheet)}
            className="absolute pointer-events-auto rounded-full backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width:      dim,
              height:     dim,
              left:       `${h.cx * 100}%`,
              top:        `${h.cy * 100}%`,
              transform:  "translate(-50%, -50%)",
              fontSize:   h.large ? 14 : 11,
              lineHeight: 1,
              background: "rgba(0,0,0,0.55)",
              border:     "1px solid rgba(255,220,120,0.45)",
              opacity:    0.90,
              boxShadow:  "0 2px 8px rgba(0,0,0,0.45)",
            }}
          >
            {h.icon}
          </button>
        );
      })}
    </div>
  );
}
