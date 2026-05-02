"use client";

import { Star } from "lucide-react";
import { MAX_STARS } from "@/lib/stars";
import { cn } from "@/lib/cn";

interface Props {
  stars: number;
  hint?: string;
  compact?: boolean;
}

export function StarProgress({ stars, hint, compact }: Props) {
  const filled = Math.floor(stars);
  const half = stars - filled >= 0.5;
  const display = stars % 1 === 0 ? `${stars}` : `${stars.toFixed(1)}`;

  return (
    <div className={cn("flex flex-col items-center gap-2", compact && "gap-1")}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_STARS }).map((_, i) => {
            const isFilled = i < filled;
            const isHalf = !isFilled && i === filled && half;
            return (
              <div key={i} className="relative h-6 w-6">
                <Star
                  className="absolute inset-0 h-6 w-6 text-white/15"
                  strokeWidth={2}
                />
                {(isFilled || isHalf) && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: isHalf ? "50%" : "100%" }}
                  >
                    <Star
                      className="h-6 w-6 fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(246,196,83,0.6)]"
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[11px] font-bold text-amber-200">
          ⭐ {display}/{MAX_STARS}
        </span>
      </div>
      {hint && !compact && (
        <p className="text-center text-xs text-white/60">{hint}</p>
      )}
    </div>
  );
}
