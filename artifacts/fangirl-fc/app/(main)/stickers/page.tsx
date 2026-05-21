"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Check, Sparkles, Lock } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const KEY = "fangirlfc.waitlist";

const TEASER_STICKERS = [
  "🏆","⚽","🇧🇷","🇦🇷","👑","⚡","🌸","🧠",
  "😭","💖","🏟️","🎽","🥅","📸","🌍","💅",
];

export default function StickersPage() {
  const [email, setEmail] = useState("");
  const [stored, setStored] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStored(window.localStorage.getItem(KEY));
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes("@")) return;
    window.localStorage.setItem(KEY, trimmed);
    setStored(trimmed);
    trackEvent("sticker_waitlist_clicked", { email: trimmed });
  };

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
          Track every sticker, swap doubles, and brag about your full album.
          Drop your email for founder access.
        </p>
      </div>

      {/* Teaser sticker grid */}
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

      <form
        onSubmit={submit}
        className="glass flex flex-col gap-3 rounded-2xl p-4"
      >
        <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          Founder access waitlist
        </label>
        {stored ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2.5 text-sm text-emerald-100">
            <Check className="h-4 w-4" />
            You're on the list as <strong className="ml-1">{stored}</strong>
          </div>
        ) : (
          <>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bestie.com"
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shine-button rounded-full px-6 py-3 text-sm"
            >
              Get founder access
            </button>
            <p className="text-[10px] text-white/45">
              Stored locally only. We'll wire up the real list later.
            </p>
          </>
        )}
      </form>

      <Link
        href="/card?id=princess"
        className="shine-button flex items-center justify-center rounded-full px-6 py-3.5 text-sm"
      >
        Make your Fangirl Card while you wait
      </Link>
    </div>
  );
}
