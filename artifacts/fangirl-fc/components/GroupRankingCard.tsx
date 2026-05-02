"use client";

import { forwardRef } from "react";
import { Crown } from "lucide-react";
import type { LocalGroup } from "@/types";
import { FAN_TYPES } from "@/lib/fanTypes";
import { rankMembers, dominantIdentity, groupAverageStars } from "@/lib/groups";
import { getTeam } from "@/lib/teams";

const CARD_W = 360;
const CARD_H = 640;

const FONT_SERIF =
  "var(--font-playfair), 'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT =
  "var(--font-dancing), 'Dancing Script', 'Brush Script MT', cursive";

const RANK_BG = ["#fcd34d", "#e5e7eb", "#d4a574", "#ffe4ec", "#ffe4ec"];

interface Props {
  group: LocalGroup;
}

export const GroupRankingCard = forwardRef<HTMLDivElement, Props>(
  function GroupRankingCard({ group }, ref) {
    const ranked = rankMembers(group).slice(0, 5);
    const avg = groupAverageStars(group);
    const dom = dominantIdentity(group);
    const domTitle = dom ? FAN_TYPES[dom]?.title ?? "Mixed" : "Mixed";

    const accent = "#d6336c";
    const accentDeep = "#7a1330";
    const ink = "#c79454";
    const inkSoft = "#ecd0a0";

    return (
      <div
        ref={ref}
        style={{
          width: CARD_W,
          height: CARD_H,
          background:
            "linear-gradient(165deg, #ffe4ec 0%, #ffd1dc 45%, #ffe9d6 100%)",
          boxShadow:
            "0 30px 80px -30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.5)",
        }}
        className="relative overflow-hidden rounded-[28px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[10px] rounded-[22px]"
          style={{ border: `2px solid ${ink}` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[15px] rounded-[18px]"
          style={{ border: `1px solid ${inkSoft}` }}
        />

        <div className="relative flex h-full flex-col px-6 py-7">
          <div className="text-center">
            <div
              className="text-[9px] font-extrabold uppercase tracking-[0.4em]"
              style={{ color: accent }}
            >
              ⚽ Fangirl FC Group Ranking
            </div>
            <div
              className="mt-1 text-[24px] font-black leading-tight"
              style={{
                color: accentDeep,
                fontFamily: FONT_SERIF,
                letterSpacing: "0.005em",
              }}
            >
              {group.name}
            </div>
            <div
              className="mt-0.5 text-[13px] italic"
              style={{ color: accent, fontFamily: FONT_SCRIPT }}
            >
              dominant vibe · {domTitle}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            {ranked.length === 0 && (
              <div
                className="rounded-2xl border-2 border-dashed bg-white/40 p-6 text-center text-sm"
                style={{
                  borderColor: ink,
                  color: accentDeep,
                  opacity: 0.7,
                }}
              >
                No members yet — add some squad
              </div>
            )}
            {ranked.map((m) => {
              const id = FAN_TYPES[m.identityId];
              const team = getTeam(m.teamCode);
              const bg = RANK_BG[m.rank - 1] ?? "#fff";
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: `1px solid ${inkSoft}`,
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black"
                    style={{
                      background: bg,
                      color: accentDeep,
                      border: `1px solid ${ink}`,
                    }}
                  >
                    {m.rank}
                  </div>
                  <div className="text-2xl leading-none">{id?.emoji}</div>
                  <div className="flex-1 overflow-hidden">
                    <div
                      className="truncate text-[13px] font-black uppercase"
                      style={{
                        color: accentDeep,
                        fontFamily: FONT_SERIF,
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      className="truncate text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: accent }}
                    >
                      {id?.title} · {team?.flag} {team?.name}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-0.5 text-[12px] font-extrabold"
                    style={{ color: accentDeep }}
                  >
                    <span style={{ color: "#b8860b" }}>★</span>
                    {m.stars % 1 === 0 ? m.stars : m.stars.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Crown className="h-4 w-4" style={{ color: ink, fill: ink }} />
              <div
                className="text-[11px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: accentDeep }}
              >
                squad avg ·{" "}
                {avg % 1 === 0 ? avg : avg.toFixed(1)} ★
              </div>
            </div>
            <div
              className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.3em]"
              style={{ color: accentDeep, opacity: 0.6 }}
            >
              built on fangirl fc · #WC2026
            </div>
          </div>
        </div>
      </div>
    );
  },
);
