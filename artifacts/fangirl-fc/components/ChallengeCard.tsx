"use client";

import Link from "next/link";
import { Star, Check } from "lucide-react";
import type { Challenge } from "@/lib/challenges";
import { cn } from "@/lib/cn";

interface Props {
  challenge: Challenge;
  done: boolean;
  onComplete: () => void;
}

const CATEGORY_TINT: Record<Challenge["category"], string> = {
  bestie: "from-pink-400/20 to-rose-300/5",
  boyfriend: "from-fuchsia-400/20 to-violet-300/5",
  girls: "from-amber-300/20 to-pink-300/5",
  matchday: "from-cyan-400/15 to-emerald-300/5",
};

export function ChallengeCard({ challenge, done, onComplete }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 backdrop-blur transition",
        done
          ? "border-emerald-300/40 from-emerald-400/15 to-emerald-300/5"
          : `border-white/10 ${CATEGORY_TINT[challenge.category]}`,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white">{challenge.title}</h3>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                <Check className="h-3 w-3" /> Done
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/60">{challenge.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-300/15 px-2 py-1 text-[11px] font-bold text-amber-200">
          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />+
          {challenge.reward}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {challenge.href !== "#" ? (
          <Link
            href={challenge.href}
            onClick={onComplete}
            className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-xs font-semibold text-white hover:bg-white/20"
          >
            {challenge.cta}
          </Link>
        ) : null}
        <button
          onClick={onComplete}
          disabled={done}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition",
            done ? "bg-emerald-400/20 text-emerald-100" : "shine-button",
          )}
        >
          {done ? "Completed" : "Mark done"}
        </button>
      </div>
    </div>
  );
}
