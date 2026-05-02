"use client";

import { forwardRef } from "react";
import type { FanIdentity, Team, Template } from "@/types";
import { Star } from "lucide-react";

interface Props {
  identity: FanIdentity;
  team: Team;
  template: Template;
  displayName: string;
  selfieUrl: string | null;
  stars: number;
}

export const FanCard = forwardRef<HTMLDivElement, Props>(function FanCard(
  { identity, team, template, displayName, selfieUrl, stars },
  ref,
) {
  const filled = Math.floor(stars);
  const half = stars - filled >= 0.5;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[36px]"
      style={{
        width: 360,
        height: 640,
        background: template.background,
        color: template.text,
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Glossy diagonal highlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 22%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.10) 95%)",
          mixBlendMode: "overlay",
        }}
      />
      {/* Top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
        }}
      />
      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 110%, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%)",
        }}
      />
      {/* Giant identity emoji watermark */}
      <div
        className="pointer-events-none absolute -right-10 -top-12 text-[260px] leading-none opacity-15"
        style={{ color: template.accent }}
      >
        {identity.emoji}
      </div>
      {/* Inner border */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[28px]"
        style={{
          border: `1px solid ${template.accent}33`,
        }}
      />

      <div className="relative flex h-full flex-col p-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: template.accent }}
            />
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.4em]"
              style={{ color: template.accent }}
            >
              Fangirl FC
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const full = i < filled;
              const halfStar = !full && i === filled && half;
              return (
                <div key={i} className="relative h-3.5 w-3.5">
                  <Star
                    className="absolute inset-0 h-3.5 w-3.5"
                    strokeWidth={2}
                    style={{ color: template.accent, opacity: 0.25 }}
                  />
                  {(full || halfStar) && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: halfStar ? "50%" : "100%" }}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        style={{
                          color: template.accent,
                          fill: template.accent,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Identity headline */}
        <div className="mt-7">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70"
            style={{ color: template.accent }}
          >
            Fan Identity
          </div>
          <div
            className="mt-1 text-[34px] font-black leading-[1.02] tracking-tight"
            style={{
              color: template.text,
              textShadow: "0 2px 20px rgba(0,0,0,0.18)",
            }}
          >
            {identity.title}
          </div>
        </div>

        {/* Avatar + name */}
        <div className="mt-6 flex items-center gap-4">
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              boxShadow: `0 0 0 2px ${template.accent}, 0 8px 22px -8px rgba(0,0,0,0.45)`,
            }}
          >
            {selfieUrl ? (
              <img
                src={selfieUrl}
                alt=""
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl">{identity.emoji}</span>
            )}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[22px] font-black leading-tight"
              style={{ color: template.text }}
            >
              {displayName || "Anonymous Fan"}
            </div>
            <div
              className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-semibold"
              style={{
                background: "rgba(0,0,0,0.22)",
                color: template.text,
              }}
            >
              <span className="text-base leading-none">{team.flag}</span>
              <span>{team.name}</span>
            </div>
          </div>
        </div>

        {/* Slogan */}
        <div
          className="mt-5 rounded-2xl px-3 py-2.5 text-[14px] font-semibold italic leading-snug"
          style={{
            background: "rgba(0,0,0,0.20)",
            color: template.text,
          }}
        >
          "{identity.slogan}"
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {identity.defaultStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-2 py-2.5 text-center"
              style={{
                background: "rgba(0,0,0,0.28)",
                boxShadow: `inset 0 0 0 1px ${template.accent}22`,
              }}
            >
              <div
                className="text-[9px] font-bold uppercase tracking-wider opacity-80"
                style={{ color: template.accent }}
              >
                {s.label}
              </div>
              <div
                className="mt-0.5 text-[15px] font-black leading-tight"
                style={{ color: template.text }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <div
              className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70"
              style={{ color: template.accent }}
            >
              Rarity
            </div>
            <div className="text-xs font-bold opacity-90">
              {identity.rarity}
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70"
              style={{ color: template.accent }}
            >
              Edition
            </div>
            <div className="text-xs font-bold opacity-90">World Cup '26</div>
          </div>
        </div>
      </div>
    </div>
  );
});
