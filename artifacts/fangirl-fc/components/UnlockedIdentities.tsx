"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { FAN_TYPE_LIST } from "@/lib/fanTypes";
import { getUnlocked } from "@/lib/unlocks";
import { RARITY_META } from "@/lib/rarity";
import type { FanIdentityId } from "@/types";
import { cn } from "@/lib/cn";

export function UnlockedIdentities() {
  const [unlocked, setUnlocked] = useState<FanIdentityId[]>([]);

  useEffect(() => {
    setUnlocked(getUnlocked());
  }, []);

  const total = FAN_TYPE_LIST.length;

  return (
    <div className="rounded-3xl border border-pink-300/20 bg-gradient-to-br from-pink-400/10 via-fuchsia-400/5 to-amber-200/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-white/90">
            Fan Identity Collection
          </div>
          <div className="text-[11px] text-white/55">
            {unlocked.length}/{total} football fan types unlocked
          </div>
        </div>
        <Link
          href="/quiz"
          className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/20"
        >
          Unlock more
        </Link>
      </div>
      <p className="mt-2 text-[11px] text-white/35">
        Unlock more fan identities as you play, predict, and learn football.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {FAN_TYPE_LIST.map((f) => {
          const isUnlocked = unlocked.includes(f.id);
          const rarity = RARITY_META[f.rarityTier];
          return (
            <div
              key={f.id}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl border p-2 pt-2.5 text-center",
                isUnlocked
                  ? "border-pink-300/40 bg-white/5"
                  : "border-white/10 bg-black/20 opacity-70",
              )}
            >
              <div className="text-2xl">{isUnlocked ? f.emoji : "?"}</div>
              <div className="line-clamp-1 text-[10px] font-bold">
                {isUnlocked ? f.title : "Locked"}
              </div>
              {isUnlocked ? (
                <div
                  className={cn(
                    "rounded-full border px-1.5 py-[1px] text-[8px] font-extrabold uppercase tracking-wider",
                    rarity.border,
                    rarity.text,
                  )}
                >
                  {rarity.short} · {f.rarityPercent}%
                </div>
              ) : (
                <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-white/40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
