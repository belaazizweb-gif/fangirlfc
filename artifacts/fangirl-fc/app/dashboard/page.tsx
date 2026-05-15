"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { SaveProgressBanner } from "@/components/SaveProgressBanner";
import { useAuth } from "@/components/AuthProvider";
import { readProgression } from "@/lib/progression";
import { getFootballIQLevel } from "@/lib/footballIqEngine";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getBadge } from "@/lib/badges";
import { getIdentityStars } from "@/lib/stars";
import type { FanIdentityId } from "@/types";

interface DashboardData {
  identityId: FanIdentityId | null;
  iqLevel: number;
  penaltyBest: number;
  topBadgeId: string | null;
  stars: number;
  level: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const id =
      (window.localStorage.getItem("fangirlfc.lastIdentity") as FanIdentityId | null) ?? null;
    const prog = readProgression();
    setData({
      identityId: id,
      iqLevel: getFootballIQLevel(prog.footballIQ.totalCorrect),
      penaltyBest: prog.penalty.bestScore,
      topBadgeId: prog.badges.length > 0 ? prog.badges[prog.badges.length - 1]! : null,
      stars: id ? getIdentityStars(id) : 0,
      level: prog.level,
    });
  }, []);

  const identity = data?.identityId ? FAN_TYPES[data.identityId] ?? null : null;
  const badgeDef = data?.topBadgeId ? getBadge(data.topBadgeId as Parameters<typeof getBadge>[0]) : null;
  const cardHref = identity ? `/card?id=${identity.id}` : "/quiz";

  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-lg px-4 py-6">
        <TopNav />

        <div className="mt-6 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-black">My Dashboard</h1>
            {!authLoading && !user && (
              <p className="mt-1 text-[12px] text-white/40">Playing as guest</p>
            )}
            {!authLoading && user && (
              <p className="mt-1 text-[12px] text-white/40">
                Welcome back, {user.displayName ?? "Fan"} 👋
              </p>
            )}
          </div>

          <SaveProgressBanner
            title="Save your Fangirl Card"
            message="Sign in to keep your stars, badges, IQ level and share link."
          />

          {data && (
            <>
              {identity ? (
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-400/20 text-3xl">
                    {identity.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-white">{identity.title}</p>
                    <p className="text-[11px] text-white/50 truncate">{identity.slogan}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-[13px] font-bold text-amber-300">
                        {data.stars.toFixed(1)} ⭐
                      </span>
                      <span className="text-[11px] text-white/35">· Fangirl Level {data.level}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl mb-2">🃏</p>
                  <p className="text-[13px] font-bold text-white/70">No card yet</p>
                  <p className="mt-1 text-[11px] text-white/40">Take the quiz to get your fan identity</p>
                  <Link
                    href="/quiz"
                    className="mt-3 inline-block rounded-full bg-pink-500 px-5 py-2 text-[12px] font-bold text-white hover:bg-pink-400"
                  >
                    Take the quiz
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-indigo-300">{data.iqLevel}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">IQ Level</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-amber-300">{data.penaltyBest}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">Best Score</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  {badgeDef ? (
                    <>
                      <p className="text-xl">{badgeDef.emoji}</p>
                      <p className="text-[10px] text-white/40 mt-0.5 truncate">{badgeDef.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl text-white/20">🏅</p>
                      <p className="text-[10px] text-white/30 mt-0.5">No badge yet</p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">
              Today&apos;s next steps
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/football-iq"
                className="flex items-center gap-3 rounded-xl border border-indigo-300/30 bg-indigo-400/8 px-4 py-3 transition hover:bg-indigo-400/15 active:scale-[0.99]"
              >
                <span className="text-xl shrink-0">🧠</span>
                <div>
                  <p className="text-[13px] font-bold text-indigo-100">Get World Cup Ready</p>
                  <p className="text-[11px] text-white/40">Daily Football IQ challenge</p>
                </div>
              </Link>
              <Link
                href="/penalty"
                className="flex items-center gap-3 rounded-xl border border-amber-300/30 bg-amber-400/8 px-4 py-3 transition hover:bg-amber-400/15 active:scale-[0.99]"
              >
                <span className="text-xl shrink-0">⚽</span>
                <div>
                  <p className="text-[13px] font-bold text-amber-100">Play Penalty Queen</p>
                  <p className="text-[11px] text-white/40">Earn stars and badges</p>
                </div>
              </Link>
              <Link
                href={cardHref}
                className="flex items-center gap-3 rounded-xl border border-pink-300/30 bg-pink-400/8 px-4 py-3 transition hover:bg-pink-400/15 active:scale-[0.99]"
              >
                <span className="text-xl shrink-0">🃏</span>
                <div>
                  <p className="text-[13px] font-bold text-pink-100">Download your card</p>
                  <p className="text-[11px] text-white/40">Share your Fangirl identity</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
