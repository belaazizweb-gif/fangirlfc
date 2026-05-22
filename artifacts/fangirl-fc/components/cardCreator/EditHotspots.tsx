"use client";

import type { CardLayoutDefinition } from "@/lib/cardCreator/templateConfig";

export type EditSheet = "photo" | "info" | "badge" | "stats";

interface HotspotDef {
  key: string;
  sheet: EditSheet;
  icon: string;
  /** Normalized (0–1) center within the card */
  cx: number;
  cy: number;
  large?: boolean;
}

interface Props {
  layout: CardLayoutDefinition;
  onEdit: (sheet: EditSheet) => void;
}

function buildHotspots(layout: CardLayoutDefinition): HotspotDef[] {
  const { photo: pz, rating: rz, position: oz, flag: fz, badge: bz, name: nz, stats } = layout;

  const statMidY =
    stats.left.length > 0
      ? stats.left[Math.floor(stats.left.length / 2)].y +
        stats.left[Math.floor(stats.left.length / 2)].h / 2
      : 0.78;

  return [
    // Photo — large button near the top-right of the photo zone
    {
      key: "photo",
      sheet: "photo",
      icon: "📸",
      cx: pz.x + pz.w * 0.82,
      cy: pz.y + pz.h * 0.13,
      large: true,
    },
    // Rating (→ Info sheet)
    {
      key: "rating",
      sheet: "info",
      icon: "✏️",
      cx: rz.x + rz.w / 2,
      cy: rz.y + rz.h / 2,
    },
    // Position (→ Info sheet)
    {
      key: "position",
      sheet: "info",
      icon: "✏️",
      cx: oz.x + oz.w / 2,
      cy: oz.y + oz.h / 2,
    },
    // Flag / Country (→ Info sheet)
    {
      key: "flag",
      sheet: "info",
      icon: "🌍",
      cx: fz.x + fz.w / 2,
      cy: fz.y + fz.h / 2,
    },
    // Badge
    {
      key: "badge",
      sheet: "badge",
      icon: "🏅",
      cx: bz.x + bz.w / 2,
      cy: bz.y + bz.h / 2,
    },
    // Name (→ Info sheet) — right side so it doesn't hide the text
    {
      key: "name",
      sheet: "info",
      icon: "✏️",
      cx: nz.x + nz.w * 0.88,
      cy: nz.y + nz.h / 2,
    },
    // Stats — centred in the stats region
    {
      key: "stats",
      sheet: "stats",
      icon: "📊",
      cx: 0.5,
      cy: statMidY,
    },
  ];
}

/**
 * DOM overlay of circular edit-hotspot buttons positioned over the Konva card.
 *
 * Rendered as `absolute inset-0` inside the card's `relative` container.
 * These are pure DOM elements — they are NOT part of the Konva stage and
 * will never appear in the exported PNG.
 */
export default function EditHotspots({ layout, onEdit }: Props) {
  const hotspots = buildHotspots(layout);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {hotspots.map((h) => {
        // Smaller, less intrusive — 36px for the camera, 28px for text edits
        const dim = h.large ? 36 : 28;
        return (
          <button
            key={h.key}
            aria-label={`Modifier ${h.key}`}
            onClick={() => onEdit(h.sheet)}
            className="absolute pointer-events-auto rounded-full bg-black/35 border border-white/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform shadow-md hover:bg-black/55 hover:border-white/35"
            style={{
              width: dim,
              height: dim,
              left: `${h.cx * 100}%`,
              top:  `${h.cy * 100}%`,
              transform: "translate(-50%, -50%)",
              fontSize: h.large ? 15 : 10,
              lineHeight: 1,
            }}
          >
            {h.icon}
          </button>
        );
      })}
    </div>
  );
}
