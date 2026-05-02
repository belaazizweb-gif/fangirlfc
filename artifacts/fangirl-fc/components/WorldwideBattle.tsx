"use client";

import { useEffect, useState } from "react";
import { Globe2, Swords } from "lucide-react";
import type { GlobalGroup, LocalGroup } from "@/types";
import { FAN_TYPES } from "@/lib/fanTypes";
import { GLOBAL_GROUPS, battle } from "@/lib/globalGroups";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

interface Props {
  yourGroup: LocalGroup | null;
}

export function WorldwideBattle({ yourGroup }: Props) {
  const [opponentId, setOpponentId] = useState<string>(
    GLOBAL_GROUPS[0]!.id,
  );

  useEffect(() => {
    trackEvent("worldwide_battle_viewed", {
      hasGroup: Boolean(yourGroup),
    });
  }, [yourGroup]);

  const opponent = GLOBAL_GROUPS.find((g) => g.id === opponentId)!;
  const result =
    yourGroup && yourGroup.members.length > 0
      ? battle(yourGroup, opponent)
      : null;
  const opponentDom = FAN_TYPES[opponent.dominantIdentity];

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-cyan-200" />
          <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/75">
            Worldwide Battle
          </div>
        </div>
        <p className="mt-1 text-[11px] text-white/55">
          Demo global rankings — live rankings coming soon.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          {GLOBAL_GROUPS.map((g) => {
            const dom = FAN_TYPES[g.dominantIdentity];
            const active = g.id === opponentId;
            return (
              <button
                key={g.id}
                onClick={() => setOpponentId(g.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                  active
                    ? "border-cyan-300/50 bg-cyan-400/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <span className="text-2xl leading-none">{g.flag}</span>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-[13px] font-bold text-white">
                    {g.name}
                  </div>
                  <div className="truncate text-[10px] uppercase tracking-wider text-white/55">
                    {g.country} · {g.membersCount} fans · {dom?.title}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-[12px] font-extrabold text-amber-200">
                  <span>★</span>
                  {g.averageStars.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-500/15 via-cyan-400/10 to-pink-500/10 p-4">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-fuchsia-100">
          <Swords className="h-3.5 w-3.5" />
          Your group vs {opponent.name}
        </div>

        {!yourGroup || yourGroup.members.length === 0 ? (
          <p className="mt-3 text-sm text-white/65">
            Build your local squad first, then battle the world.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <SidePanel
                title={yourGroup.name}
                sub="Your squad"
                score={result!.yourScore}
                tint="from-pink-500/20 to-fuchsia-400/15"
              />
              <div className="text-center text-[10px] font-extrabold uppercase tracking-wider text-white/55">
                vs
              </div>
              <SidePanel
                title={opponent.name}
                sub={`${opponentDom?.emoji ?? ""} ${opponentDom?.title ?? ""}`}
                score={result!.theirScore}
                tint="from-cyan-400/20 to-emerald-400/10"
              />
            </div>
            <div className="mt-3 rounded-xl bg-black/30 px-3 py-2.5 text-center">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-200">
                🏆 {result!.winnerLabel}
              </div>
              <div className="mt-0.5 text-[12px] text-white/80">
                {result!.flavor}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SidePanel({
  title,
  sub,
  score,
  tint,
}: {
  title: string;
  sub: string;
  score: number;
  tint: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-gradient-to-br p-2.5 text-center",
        tint,
      )}
    >
      <div className="line-clamp-2 text-[11px] font-bold uppercase tracking-wider text-white">
        {title}
      </div>
      <div className="mt-0.5 text-[10px] text-white/65">{sub}</div>
      <div className="mt-1 text-2xl font-black text-white">{score}</div>
    </div>
  );
}
