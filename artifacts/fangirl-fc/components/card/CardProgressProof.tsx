"use client";

import type { CardProgressDisplay } from "@/lib/cardProgressAdapter";

interface Props {
  data: CardProgressDisplay;
  accentDeep: string;
  frameInk: string;
  frameInkSoft: string;
}

const GOLD      = "#fcd34d";
const GOLD_DIM  = "rgba(252,211,77,0.22)";
const GOLD_DEEP = "#b8860b";

export function CardProgressProof({ data, accentDeep, frameInk, frameInkSoft }: Props) {
  const { starsDisplay, topBadge, latestPenaltyGoals, latestPenaltyAttempts } = data;

  const filledStars = Math.floor(starsDisplay);
  const hasHalf     = starsDisplay - filledStars >= 0.25;
  const starsText   =
    starsDisplay === 0
      ? "0/5"
      : starsDisplay % 1 === 0
      ? `${starsDisplay.toFixed(0)}/5`
      : `${starsDisplay.toFixed(1)}/5`;

  const penaltyText =
    latestPenaltyGoals !== null && latestPenaltyAttempts !== null
      ? `${latestPenaltyGoals}/${latestPenaltyAttempts}`
      : "—";

  return (
    <div style={{ marginTop: 5, marginBottom: 2 }}>
      {/* Hairline separator — fades at edges */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${frameInkSoft}99, transparent)`,
          marginBottom: 5,
        }}
      />

      {/* Proof row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 2,
          paddingRight: 2,
          gap: 4,
        }}
      >
        {/* ── Stars ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < filledStars;
            const half   = !filled && i === filledStars && hasHalf;
            return (
              <span
                key={i}
                style={{
                  fontSize: 8,
                  lineHeight: 1,
                  color: filled ? GOLD : half ? "#e8a830" : GOLD_DIM,
                  WebkitTextStroke: filled ? `0.4px ${GOLD_DEEP}` : "none",
                }}
              >
                ★
              </span>
            );
          })}
          <span
            style={{
              fontSize: 7.5,
              fontWeight: 800,
              color: GOLD_DEEP,
              marginLeft: 3,
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            {starsText}
          </span>
        </div>

        {/* ── Top badge (center) ── */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 8,
            fontWeight: 700,
            color: accentDeep,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {topBadge ? `${topBadge.emoji} ${topBadge.name}` : "No badge yet"}
        </div>

        {/* ── Penalty ── */}
        <div
          style={{
            fontSize: 7.5,
            fontWeight: 800,
            color: frameInk,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            lineHeight: 1,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          ⚽ {penaltyText}
        </div>
      </div>
    </div>
  );
}
