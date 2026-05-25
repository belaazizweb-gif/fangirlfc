"use client";

import { Sparkles, Lock } from "lucide-react";
import Link from "next/link";

const TEASER_STICKERS = [
  "🏆","⚽","🇧🇷","🇦🇷","👑","⚡","🌸","🧠",
  "😭","💖","🏟️","🎽","🥅","📸","🌍","💅",
];

export default function StickersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl border border-pink-300/30 bg-gradient-to-br from-pink-500/20 via-fuchsia-400/10 to-amber-300/15 p-6">
        <div className="absolute -right-8 -top-8 text-[160px] leading-none opacity-15">
          🏷️
        </div>
        <span className="relative inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-100 backdrop-blur">
          <Sparkles className="h-3 w-3" /> Coming soon
        </span>
        <h1 className="relative mt-3 text-2xl font-black leading-tight">
          Sticker Tracker · World Cup 2026
        </h1>
        <p className="relative mt-2 text-sm text-white/75">
          Track every sticker, swap doubles, and brag about your full album. Coming in a future update.
        </p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">
          Sticker preview · unlocks at launch
        </div>
        <div className="grid grid-cols-4 gap-2">
          {TEASER_STICKERS.map((s, i) => (
            <div
              key={i}
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/8 text-2xl"
            >
              <span className="blur-sm select-none">{s}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Lock className="h-3.5 w-3.5 text-white/50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-[13px] font-bold text-white/60">Not available yet</p>
        <p className="mt-1 text-[12px] text-white/40">
          Stickers are coming in a future update. Check back soon.
        </p>
      </div>

      <Link
        href="/creator"
        className="shine-button flex items-center justify-center rounded-full px-6 py-3.5 text-sm"
      >
        Create your FC Card while you wait
      </Link>
    </div>
  );
}
