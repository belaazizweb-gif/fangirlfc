"use client";

import { useRef, useState } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import type { LocalGroup } from "@/types";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam } from "@/lib/teams";
import { rankMembers, groupSuperlatives } from "@/lib/groups";
import { exportNodeAsPng } from "@/lib/exportImage";
import { trackEvent } from "@/lib/analytics";
import { showToast } from "@/lib/toast";
import { GroupRankingCard } from "./GroupRankingCard";

interface Props {
  group: LocalGroup;
  onRemoveMember: (memberId: string) => void;
}

export function GroupLeaderboard({ group, onRemoveMember }: Props) {
  const ranked = rankMembers(group);
  const supers = groupSuperlatives(group);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await exportNodeAsPng(
        cardRef.current,
        `fangirl-group-${group.name.toLowerCase().replace(/\s+/g, "-")}.png`,
      );
      trackEvent("group_ranking_exported", {
        groupId: group.id,
        members: group.members.length,
      });
      showToast({
        kind: "info",
        title: "Squad ranking saved",
        detail: "Send it to the group chat",
        emoji: "🏆",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/65">
            Leaderboard
          </div>
          <div className="text-[11px] font-bold text-white/55">
            {group.members.length} member{group.members.length === 1 ? "" : "s"}
          </div>
        </div>

        {ranked.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-[12px] text-white/55">
            Add members to see the ranking ✨
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            {ranked.map((m) => {
              const id = FAN_TYPES[m.identityId];
              const team = getTeam(m.teamCode);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-400/20 text-[12px] font-black text-pink-50">
                    {m.rank}
                  </div>
                  <div className="text-xl leading-none">{id?.emoji}</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-[13px] font-bold text-white">
                      {m.name}
                    </div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-white/55">
                      {id?.title} · {team?.flag} {team?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-[12px] font-extrabold text-amber-200">
                    <span>★</span>
                    {m.stars % 1 === 0 ? m.stars : m.stars.toFixed(1)}
                  </div>
                  <button
                    aria-label="Remove member"
                    onClick={() => onRemoveMember(m.id)}
                    className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {supers.length > 0 && (
        <div className="glass rounded-2xl p-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/65">
            Squad superlatives
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {supers.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-pink-400/10 to-amber-300/5 px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-pink-100">
                  <span>{s.emoji}</span>
                  {s.label}
                </div>
                <div className="mt-1 truncate text-[12px] font-bold text-white">
                  {s.member.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={busy || ranked.length === 0}
        className="flex items-center justify-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-black transition hover:bg-white disabled:opacity-40"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Share group ranking
      </button>

      {/* Off-screen export node */}
      <div
        aria-hidden
        className="pointer-events-none fixed -left-[9999px] top-0"
      >
        <GroupRankingCard ref={cardRef} group={group} />
      </div>
    </div>
  );
}
