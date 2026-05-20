"use client";

import { useRef } from "react";
import type { BadgeState, BadgeId } from "@/lib/cardCreator/creatorState";

const GENERIC_BADGES: Array<{ id: BadgeId; emoji: string; label: string }> = [
  { id: "shield",    emoji: "🛡️", label: "Shield"    },
  { id: "star",      emoji: "⭐", label: "Star"      },
  { id: "crown",     emoji: "👑", label: "Crown"     },
  { id: "lion",      emoji: "🦁", label: "Lion"      },
  { id: "ball",      emoji: "⚽", label: "Ball"      },
  { id: "lightning", emoji: "⚡", label: "Lightning" },
];

interface Props {
  badge: BadgeState;
  onChange: (badge: BadgeState) => void;
}

export default function BadgeEditorSheet({ badge, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      onChange({ type: "upload", src });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const activeId = badge.type === "generic" ? badge.id : null;

  return (
    <div className="space-y-5 pb-2">
      {/* Generic badges grid */}
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Generic Badges</p>
        <div className="grid grid-cols-3 gap-3">
          {GENERIC_BADGES.map(({ id, emoji, label }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ type: "generic", id })}
                className={[
                  "flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all active:scale-95",
                  isActive
                    ? "bg-pink-600/25 border-pink-500/60"
                    : "bg-white/6 border-white/10 hover:bg-white/10",
                ].join(" ")}
              >
                <span className="text-3xl">{emoji}</span>
                <span className={`text-xs font-medium ${isActive ? "text-pink-300" : "text-white/60"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload custom */}
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Custom Badge</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className={[
            "w-full py-3.5 rounded-xl border transition-all active:scale-95 text-sm font-medium",
            badge.type === "upload"
              ? "bg-pink-600/25 border-pink-500/60 text-pink-300"
              : "bg-white/6 border-white/10 hover:bg-white/10 text-white/70",
          ].join(" ")}
        >
          {badge.type === "upload" ? "🖼️ Replace Custom Badge" : "🖼️ Upload Custom Badge"}
        </button>
        {badge.type === "upload" && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.src}
              alt="Custom badge"
              className="w-12 h-12 object-contain rounded-lg bg-black/30"
            />
            <span className="text-sm text-white/60 flex-1">Custom badge uploaded</span>
            <button
              onClick={() => onChange({ type: "generic", id: "shield" })}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* None */}
      <button
        onClick={() => onChange({ type: "none" })}
        className={[
          "w-full py-3 rounded-xl border text-sm transition-all",
          badge.type === "none"
            ? "border-white/30 text-white/60 bg-white/8"
            : "border-white/10 text-white/30 hover:text-white/50 hover:border-white/20",
        ].join(" ")}
      >
        No Badge
      </button>
    </div>
  );
}
