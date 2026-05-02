"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { FanIdentity } from "@/types";
import { cn } from "@/lib/cn";

interface Props {
  identity: FanIdentity;
}

export function ShareCaptions({ identity }: Props) {
  const captions = [
    "This is literally me 😭",
    "Which fan are you?",
    "Tag your football bestie 👯‍♀️",
    `I got ${identity.title}. What did you get?`,
  ];
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
        Caption ideas · tap to copy
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {captions.map((c, i) => {
          const copied = copiedIdx === i;
          return (
            <button
              key={c}
              onClick={() => copy(c, i)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                copied
                  ? "border-pink-400/60 bg-pink-400/15"
                  : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
              )}
            >
              <span className="flex-1 truncate text-white/90">{c}</span>
              {copied ? (
                <Check className="h-4 w-4 text-pink-200" />
              ) : (
                <Copy className="h-4 w-4 text-white/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
