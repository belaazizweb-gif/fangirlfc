"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirebaseDb } from "@/lib/firebase";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam } from "@/lib/teams";
import { fetchRecentOfficialShares } from "@/lib/teamRank";
import { useAuth } from "@/components/AuthProvider";
import { TopNav } from "@/components/TopNav";
import { Medal, Star, Loader2, Users, Lock, RefreshCw } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/officialStars";
import type { UserProfileFull } from "@/lib/officialCard";

const LIMIT = 50;

function rankBadge(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function EntryRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const identity = entry.officialCardIdentityId
    ? FAN_TYPES[entry.officialCardIdentityId as keyof typeof FAN_TYPES]
    : null;
  const team = entry.officialTeamCode ? getTeam(entry.officialTeamCode) : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        rank === 1
          ? "border-amber-400/40 bg-amber-400/10"
          : rank === 2
          ? "border-slate-300/30 bg-slate-300/5"
          : rank === 3
          ? "border-orange-400/30 bg-orange-400/5"
          : "border-white/8 bg-white/3"
      }`}
    >
      <div
        className={`w-8 shrink-0 text-center font-extrabold ${
          rank <= 3 ? "text-base" : "text-[14px] text-white/40"
        }`}
      >
        {rankBadge(rank)}
      </div>

      {entry.photoURL ? (
        <img
          src={entry.photoURL}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[15px]">
          {identity?.emoji ?? "⭐"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-white">
          {entry.officialCardDisplayName || entry.displayName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-white/50">
          {identity ? `${identity.emoji} ${identity.title}` : ""}
          {identity && team ? " · " : ""}
          {team ? `${team.flag} ${team.name}` : ""}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-1 text-[12px] font-extrabold text-amber-300">
          <Star className="h-3 w-3 fill-amber-300" />
          {entry.officialStars}
        </div>
        <p className="mt-0.5 text-[10px] text-white/30">{entry.officialXp} XP</p>
      </div>
    </div>
  );
}

function OwnStatsCard({ profile }: { profile: UserProfileFull }) {
  const identity = profile.officialCard
    ? FAN_TYPES[profile.officialCard.identityId]
    : null;
  const team = profile.officialCard
    ? getTeam(profile.officialCard.teamCode)
    : null;

  return (
    <div className="rounded-2xl border border-pink-300/30 bg-pink-400/10 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-pink-300/70">
        Your official stats
      </p>
      <div className="mt-3 flex items-center gap-3">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
            {identity?.emoji ?? "⭐"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">
            {profile.officialCard?.displayName || profile.displayName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-white/50">
            {identity ? `${identity.emoji} ${identity.title}` : "No official card yet"}
            {identity && team ? ` · ${team.flag} ${team.name}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 border-t border-white/10 pt-3">
        <div>
          <p className="text-[11px] text-white/40">Official stars</p>
          <div className="mt-0.5 flex items-center gap-1 text-[15px] font-extrabold text-amber-300">
            <Star className="h-3.5 w-3.5 fill-amber-300" />
            {profile.officialStars ?? 0}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-white/40">XP</p>
          <p className="mt-0.5 text-[15px] font-extrabold text-white">
            {profile.officialXp ?? 0}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/40">Rank score</p>
          <p className="mt-0.5 text-[15px] font-extrabold text-white">
            {profile.rankScore ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const { user, loading: authLoading } = useAuth();

  const [entries, setEntries]           = useState<LeaderboardEntry[]>([]);
  const [ownProfile, setOwnProfile]     = useState<UserProfileFull | null>(null);
  const [shareCount, setShareCount]     = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [rulesBlocked, setRulesBlocked] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [retryKey, setRetryKey]         = useState(0);

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    setError(null);
    setRulesBlocked(false);
    setEntries([]);

    const db = getFirebaseDb();
    if (!db) {
      setError("Couldn't load rankings right now. Check back soon or try again.");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "leaderboard"),
      orderBy("rankScore", "desc"),
      limit(LIMIT),
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000),
    );

    Promise.race([getDocs(q), timeoutPromise])
      .then((snap) => {
        setEntries(snap.docs.map((d) => d.data() as LeaderboardEntry));
      })
      .catch(async (err: unknown) => {
        if (
          err instanceof FirebaseError &&
          (err.code === "permission-denied" || err.code === "PERMISSION_DENIED")
        ) {
          setRulesBlocked(true);
          if (user) {
            try {
              const snap = await getDoc(doc(db, "users", user.uid));
              if (snap.exists()) setOwnProfile(snap.data() as UserProfileFull);
            } catch { /* ignore */ }
          }
        } else {
          setError("Couldn't load rankings right now. Check back soon or try again.");
        }
      })
      .finally(() => setLoading(false));

    // Social proof count — silent fallback on error
    fetchRecentOfficialShares(50).then((items) => setShareCount(items.length));
  }, [authLoading, user, retryKey]);

  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-2xl font-extrabold">
            <Medal className="h-6 w-6 text-amber-400" />
            Official Ranking
          </div>
          {shareCount !== null && shareCount > 0 && (
            <p className="text-[11px] text-white/30">+{shareCount} fans shared recently</p>
          )}
          {shareCount === 0 && (
            <p className="text-[11px] text-white/25">Fans are actively sharing right now</p>
          )}
        </div>
        <p className="mt-1 text-[13px] text-white/50">
          Top {LIMIT} fans by official stars · Updated on every save
        </p>

        <TopNav />

        <div className="mt-6 flex flex-col gap-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-white/40">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading rankings…
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-[14px] font-bold text-white/60">Couldn't load rankings right now.</p>
              <p className="text-[12px] text-white/40">Check back soon or try again.</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-white/80 transition hover:bg-white/20 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && rulesBlocked && (
            <>
              {ownProfile && <OwnStatsCard profile={ownProfile} />}

              {!ownProfile && !user && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Users className="h-10 w-10 text-white/20" />
                  <p className="text-[14px] font-bold text-white/50">
                    Sign in to see your stats
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[13px] font-bold text-white/60">
                  <Lock className="h-4 w-4" />
                  Public leaderboard needs one setup step
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                  To make the full ranking public, open the{" "}
                  <span className="font-bold text-white/60">Firebase Console</span>{" "}
                  → Firestore → Rules, and paste the contents of{" "}
                  <code className="rounded bg-white/10 px-1 text-white/70">
                    firestore.rules
                  </code>{" "}
                  from this project. Your own stats above are already saved.
                </p>
              </div>
            </>
          )}

          {!loading && !error && !rulesBlocked && entries.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <Users className="h-10 w-10 text-white/20" />
              <p className="text-[14px] font-bold text-white/50">No official fans yet</p>
              <p className="text-[12px] text-white/30">
                Be the first — publish your official fan card.
              </p>
            </div>
          )}

          {!loading && !error && !rulesBlocked && entries.length > 0 && (
            <>
              {entries.map((entry, idx) => (
                <EntryRow key={entry.uid} entry={entry} rank={idx + 1} />
              ))}
              <p className="mt-2 text-center text-[11px] text-white/25">
                Rank score = XP + stars × 100 · Top {LIMIT} shown
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
