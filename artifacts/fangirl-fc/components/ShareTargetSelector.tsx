"use client";

import type { ShareMode } from "@/types";
import { SHARE_MODE_LIST } from "@/lib/shareModes";
import { cn } from "@/lib/cn";

interface Props {
  value: ShareMode;
  onChange: (m: ShareMode) => void;
}

export function ShareTargetSelector({ value, onChange }: Props) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[15px] font-bold text-white">
        Who are you sending this to?
      </div>
      <p className="mt-0.5 text-[12px] text-white/60">
        We'll tweak your share copy and compare link.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {SHARE_MODE_LIST.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition",
                active
                  ? "border-pink-400 bg-pink-500/75 text-white shadow-[0_4px_22px_-4px_rgba(236,72,153,0.65)]"
                  : "border-white/10 bg-white/5 text-white/55 hover:bg-white/[0.12] hover:text-white/80",
              )}
            >
              <span className="text-lg">{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
