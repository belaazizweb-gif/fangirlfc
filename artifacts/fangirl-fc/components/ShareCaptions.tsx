"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { FanIdentity, ShareMode } from "@/types";
import { cn } from "@/lib/cn";
import { getShareMode, fillCaption } from "@/lib/shareModes";

interface Props {
  identity: FanIdentity;
  mode?: ShareMode;
}

export function ShareCaptions({ identity, mode = "public" }: Props) {
  const meta = getShareMode(mode);
  const captions = meta.captions.map((c) => fillCaption(c, identity.title));
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
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          Caption ideas · tap to copy
        </div>
        <div className="rounded-full bg-pink-300/15 px-2 py-0.5 text-[10px] font-bold uppercase text-pink-100">
          {meta.emoji} {meta.label}
        </div>
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
              <span className="flex-1 text-white/90">{c}</span>
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
