"use client";

import type { FanIdentity, RarityTier } from "@/types";
import { RARITY_META, rarityHook } from "@/lib/rarity";
import { cn } from "@/lib/cn";

interface Props {
  identity?: FanIdentity;
  tier?: RarityTier;
  percent?: number;
  size?: "sm" | "md";
  showHook?: boolean;
  className?: string;
}

export function RarityBadge({
  identity,
  tier,
  percent,
  size = "md",
  showHook = false,
  className,
}: Props) {
  const t = identity?.rarityTier ?? tier ?? "common";
  const meta = RARITY_META[t];
  const pct = identity?.rarityPercent ?? percent;
  const hookText = identity ? rarityHook(identity) : meta.label;

  return (
    <span
      className={cn(
        "inline-flex flex-col items-start gap-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border bg-gradient-to-r font-extrabold uppercase tracking-[0.18em]",
          meta.gradient,
          meta.border,
          meta.text,
          size === "sm"
            ? "px-2 py-[3px] text-[9px]"
            : "px-2.5 py-1 text-[10px]",
        )}
      >
        <span>{meta.emoji}</span>
        <span>{meta.short}</span>
        {pct !== undefined && (
          <span className="opacity-80">· {pct}%</span>
        )}
      </span>
      {showHook && (
        <span className="text-[10px] font-semibold text-white/65">
          {hookText}
        </span>
      )}
    </span>
  );
}
