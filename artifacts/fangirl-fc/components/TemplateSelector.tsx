"use client";

import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {TEMPLATES.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex w-28 shrink-0 flex-col items-stretch gap-1 rounded-2xl border-2 p-1 text-left transition",
              selected
                ? "border-pink-400 shadow-[0_0_0_4px_rgba(255,77,191,0.18)]"
                : "border-white/10 hover:border-white/30",
            )}
          >
            <div
              className="h-20 rounded-xl"
              style={{ background: t.background }}
            />
            <div className="px-1.5 pb-1.5 pt-0.5">
              <div className="text-xs font-bold">{t.name}</div>
              <div className="line-clamp-1 text-[10px] text-white/50">
                {t.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
