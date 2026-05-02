"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import type { FanIdentityId, GroupMember } from "@/types";
import { FAN_TYPE_LIST } from "@/lib/fanTypes";
import { TEAMS } from "@/lib/teams";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";

interface Props {
  onAdd: (member: Omit<GroupMember, "id">) => void;
}

export function GroupBuilder({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [identityId, setIdentityId] = useState<FanIdentityId>("chaotic");
  const [teamCode, setTeamCode] = useState<string>(TEAMS[0]!.code);
  const [stars, setStars] = useState<number>(2.5);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      identityId,
      teamCode,
      stars: Math.max(0, Math.min(5, stars)),
    });
    trackEvent("group_member_added", { identityId });
    setName("");
    setStars(2.5);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-full border border-pink-300/40 bg-pink-400/15 px-4 py-2.5 text-sm font-bold text-pink-50 hover:bg-pink-400/25"
      >
        <UserPlus className="h-4 w-4" /> Add a member
      </button>
    );
  }

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 24))}
          placeholder="Sara, Boyfriend, etc."
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
          Fan identity
        </label>
        <div className="no-scrollbar -mx-1 mt-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {FAN_TYPE_LIST.map((t) => {
            const active = t.id === identityId;
            return (
              <button
                key={t.id}
                onClick={() => setIdentityId(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition",
                  active
                    ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                )}
              >
                <span>{t.emoji}</span>
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
          Team
        </label>
        <select
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
        >
          {TEAMS.map((t) => (
            <option key={t.code} value={t.code} className="bg-black">
              {t.flag} {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/55">
          Fangirl level
          <span className="text-amber-200">
            ★ {stars % 1 === 0 ? stars : stars.toFixed(1)}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={stars}
          onChange={(e) => setStars(Number(e.target.value))}
          className="mt-1 w-full accent-pink-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-pink-400/30 px-4 py-2 text-sm font-bold text-pink-50 hover:bg-pink-400/40 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}
