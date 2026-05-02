"use client";

import { forwardRef } from "react";
import { Crown, Heart, Sparkles } from "lucide-react";
import type { CalloutTarget, FanIdentity } from "@/types";

const CARD_W = 360;
const CARD_H = 640;

const FONT_SERIF =
  "var(--font-playfair), 'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_SCRIPT =
  "var(--font-dancing), 'Dancing Script', 'Brush Script MT', cursive";

const TARGET_LABEL: Record<CalloutTarget, string> = {
  bestie: "For my bestie 💖",
  boyfriend: "For the boyfriend 💘",
  girls: "For the girls 👯‍♀️",
  everyone: "For everyone 📣",
};

interface Props {
  friendName: string;
  identity: FanIdentity;
  target: CalloutTarget;
  fromName?: string;
}

export const CalloutCard = forwardRef<HTMLDivElement, Props>(function CalloutCard(
  { friendName, identity, target, fromName },
  ref,
) {
  const accent = "#d6336c";
  const accentDeep = "#7a1330";
  const ink = "#c79454";
  const inkSoft = "#ecd0a0";
  const safeName = friendName.trim() || "Bestie";

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W,
        height: CARD_H,
        background:
          "linear-gradient(165deg, #ffe4ec 0%, #ffd1dc 45%, #ffe9d6 100%)",
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.5)",
      }}
      className="relative overflow-hidden rounded-[28px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10px] rounded-[22px]"
        style={{ border: `2px solid ${ink}` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[15px] rounded-[18px]"
        style={{ border: `1px solid ${inkSoft}` }}
      />

      <div className="relative flex h-full flex-col items-center justify-between px-7 py-8 text-center">
        <div>
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.32em]"
            style={{ color: accent }}
          >
            ⚽ Fangirl FC · Call-Out
          </div>
          <div
            className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: accentDeep, opacity: 0.7 }}
          >
            {TARGET_LABEL[target]}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Sparkles className="h-6 w-6" style={{ color: accent }} />
          <div
            className="text-[20px] italic leading-tight"
            style={{ color: accent, fontFamily: FONT_SCRIPT }}
          >
            {safeName},
          </div>
          <div
            className="text-[15px] font-bold"
            style={{ color: accentDeep, opacity: 0.8 }}
          >
            you are definitely
          </div>

          <Crown className="h-6 w-6" style={{ color: ink, fill: ink }} />

          <div className="text-7xl leading-none">{identity.emoji}</div>

          <div
            className="px-2 text-3xl font-black uppercase leading-[0.95]"
            style={{
              color: accentDeep,
              fontFamily: FONT_SERIF,
              letterSpacing: "0.005em",
            }}
          >
            {identity.title}
          </div>

          <p
            className="px-2 text-[15px] italic leading-tight"
            style={{ color: accent, fontFamily: FONT_SCRIPT }}
          >
            “{identity.slogan}”
          </p>

          <div
            className="mt-2 flex items-center gap-1.5 text-[13px] font-medium leading-snug"
            style={{ color: accentDeep, opacity: 0.85 }}
          >
            <Heart
              className="h-3 w-3"
              style={{ color: accent, fill: accent }}
            />
            {identity.shareTrigger}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-1.5">
          <div
            className="rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em]"
            style={{
              background: accent,
              color: "#fff",
            }}
          >
            Take the quiz · prove me wrong
          </div>
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.3em]"
            style={{ color: accentDeep, opacity: 0.65 }}
          >
            fangirl fc · #WC2026
          </div>
          {fromName && (
            <div
              className="text-[12px] italic leading-none"
              style={{
                color: ink,
                fontFamily: FONT_SCRIPT,
              }}
            >
              — {fromName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
