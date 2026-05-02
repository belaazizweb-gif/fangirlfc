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
      className="relative overflow-hidden rounded-[36px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
      style={{
        width: 360,
        height: 640,
        background: template.background,
        color: template.text,
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute -right-16 -top-16 text-[280px] leading-none"
          style={{ color: template.accent }}
        >
          {identity.emoji}
        </div>
      </div>

      <div className="relative flex h-full flex-col p-7">
        <div className="flex items-center justify-between">
          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.4em]"
            style={{ color: template.accent }}
          >
            Fangirl FC
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

        <div className="mt-6 flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2"
            style={{
              borderColor: template.accent,
              background: "rgba(255,255,255,0.18)",
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
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="truncate text-2xl font-black leading-tight"
              style={{ color: template.text }}
            >
              {displayName || "Anonymous Fan"}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold opacity-80">
              <span className="text-lg leading-none">{team.flag}</span>
              <span>{team.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70"
            style={{ color: template.accent }}
          >
            Fan Identity
          </div>
          <div
            className="mt-1 text-3xl font-black leading-tight"
            style={{ color: template.text }}
          >
            {identity.title}
          </div>
          <div className="mt-2 text-sm font-semibold italic opacity-85">
            "{identity.slogan}"
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {identity.defaultStats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-2 py-2.5 text-center"
              style={{ background: "rgba(0,0,0,0.22)" }}
            >
              <div
                className="text-[9px] font-bold uppercase tracking-wider opacity-80"
                style={{ color: template.accent }}
              >
                {s.label}
              </div>
              <div
                className="mt-0.5 text-base font-black"
                style={{ color: template.text }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <div
              className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70"
              style={{ color: template.accent }}
            >
              Rarity
            </div>
            <div className="text-xs font-bold opacity-90">{identity.rarity}</div>
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80"
            style={{ color: template.accent }}
          >
            World Cup '26
          </div>
        </div>
      </div>
    </div>
  );
});
