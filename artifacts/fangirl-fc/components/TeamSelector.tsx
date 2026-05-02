"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { TEAMS } from "@/lib/teams";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export function TeamSelector({ value, onChange }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return TEAMS;
    return TEAMS.filter((t) => t.name.toLowerCase().includes(term));
  }, [q]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 48 nations…"
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
        />
      </div>
      <div className="no-scrollbar -mx-1 flex max-h-56 flex-wrap gap-2 overflow-y-auto px-1 py-1">
        {filtered.map((t) => {
          const selected = t.code === value;
          return (
            <button
              key={t.code}
              onClick={() => onChange(t.code)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                selected
                  ? "border-pink-400/70 bg-pink-400/20 text-white"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-white/30",
              )}
            >
              <span className="text-base leading-none">{t.flag}</span>
              <span>{t.name}</span>
              {selected && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
