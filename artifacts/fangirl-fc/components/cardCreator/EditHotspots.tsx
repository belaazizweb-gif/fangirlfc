"use client";

import { useState } from "react";
import type { CardLayoutDefinition } from "@/lib/cardCreator/templateConfig";

export type EditSheet = "photo" | "info" | "badge" | "stats";

interface HotspotDef {
  key: string;
  sheet: EditSheet;
  icon: string;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  large?: boolean;
  photoOnly?: boolean;
}

function buildHotspots(layout: CardLayoutDefinition): HotspotDef[] {
  const { photo: pz, flag: fz, badge: bz, stats } = layout;

  const statMidY =
    stats.left.length > 0
      ? stats.left[Math.floor(stats.left.length / 2)].y +
        stats.left[Math.floor(stats.left.length / 2)].h / 2
      : 0.76;

  return [
    // Always visible — photo
    {
      key: "photo",
      sheet: "photo",
      icon: "📸",
      cx: pz.x + pz.w * 0.82,
      cy: pz.y + pz.h * 0.13,
      tx: pz.x + pz.w * 0.82,
      ty: pz.y + pz.h * 0.13,
      large: true,
      photoOnly: true,
    },
    // Edit-mode only — info (consolidated: rating + position + name)
    {
      key: "info",
      sheet: "info",
      icon: "✏️",
      cx: 0.305,
      cy: 0.215,
      tx: 0.175,
      ty: 0.215,
    },
    // Edit-mode only — flag
    {
      key: "flag",
      sheet: "info",
      icon: "🌍",
      cx: fz.x + fz.w / 2,
      cy: fz.y + fz.h / 2,
      tx: fz.x + fz.w / 2,
      ty: fz.y + fz.h / 2,
    },
    // Edit-mode only — badge
    {
      key: "badge",
      sheet: "badge",
      icon: "🏅",
      cx: bz.x + bz.w / 2,
      cy: bz.y + bz.h / 2,
      tx: bz.x + bz.w / 2,
      ty: bz.y + bz.h / 2,
    },
    // Edit-mode only — stats
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
 * DOM overlay of edit hotspot buttons over the Konva card.
 *
 * Default (editMode=false): only the 📸 photo hotspot + an "✏️ Edit" toggle button.
 * Tap "Edit" to reveal the remaining 4 callout hotspots with SVG arrow lines.
 *
 * These are pure DOM — never part of the Konva stage, never in the exported PNG.
 */
export default function EditHotspots({
  layout,
  onEdit,
}: {
  layout: CardLayoutDefinition;
  onEdit: (sheet: EditSheet) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const hotspots = buildHotspots(layout);

  const visibleHotspots = editMode
    ? hotspots
    : hotspots.filter((h) => h.photoOnly);

  const arrowHotspots = visibleHotspots.filter((h) => {
    const dx = (h.tx - h.cx) * 100;
    const dy = (h.ty - h.cy) * 100;
    return Math.sqrt(dx * dx + dy * dy) >= 1.5;
  });

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="false">

      {/* SVG arrow lines — only when editMode is on */}
      {editMode && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          {arrowHotspots.map((h) => (
            <g key={`arrow-${h.key}`}>
              <line
                x1={h.cx * 100} y1={h.cy * 100}
                x2={h.tx * 100} y2={h.ty * 100}
                stroke="rgba(255,220,120,0.55)"
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
              />
              <circle
                cx={h.tx * 100} cy={h.ty * 100}
                r="0.9"
                fill="rgba(255,220,120,0.80)"
              />
            </g>
          ))}
        </svg>
      )}

      {/* Hotspot buttons */}
      {visibleHotspots.map((h) => {
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

      {/* "✏️ Edit" toggle — always visible, positioned bottom-right outside card */}
      <button
        onClick={() => setEditMode((v) => !v)}
        className="absolute pointer-events-auto rounded-full backdrop-blur-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
        style={{
          right:      "-2px",
          bottom:     "-38px",
          height:     30,
          paddingLeft:  10,
          paddingRight: 10,
          fontSize:   12,
          fontWeight: 600,
          lineHeight: 1,
          color:      "#fff",
          background: editMode ? "rgba(180,140,0,0.72)" : "rgba(0,0,0,0.68)",
          border:     "1px solid rgba(255,220,120,0.55)",
          boxShadow:  "0 2px 10px rgba(0,0,0,0.50)",
          whiteSpace: "nowrap",
        }}
        aria-label={editMode ? "Fermer l'édition" : "Modifier la carte"}
      >
        ✏️ {editMode ? "Fermer" : "Modifier"}
      </button>
    </div>
  );
}
