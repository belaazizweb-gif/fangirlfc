"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getFirebaseDb } from "@/lib/firebase";
import { TopNav } from "@/components/TopNav";
import { Flag, Star, Loader2, Globe, Lock } from "lucide-react";
import type { TeamRankingEntry } from "@/lib/officialStars";

const LIMIT = 50;

function rankBadge(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function TeamRow({ entry, rank }: { entry: TeamRankingEntry; rank: number }) {
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
      {/* Rank */}
      <div
        className={`w-8 shrink-0 text-center font-extrabold ${
          rank <= 3 ? "text-base" : "text-[14px] text-white/40"
        }`}
      >
        {rankBadge(rank)}
      </div>

      {/* Flag */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center text-2xl">
        {entry.flag || "🏳️"}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-white">{entry.teamName}</p>
        <p className="mt-0.5 text-[11px] text-white/40">
          {entry.memberCount} fan{entry.memberCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stars / XP */}
      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-1 text-[12px] font-extrabold text-amber-300">
          <Star className="h-3 w-3 fill-amber-300" />
          {entry.totalStars}
        </div>
        <p className="mt-0.5 text-[10px] text-white/30">{entry.totalXp} XP</p>
      </div>
    </div>
  );
}

export default function TeamRankingPage() {
  const [entries, setEntries]           = useState<TeamRankingEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [rulesBlocked, setRulesBlocked] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) { setError("Firebase not available."); setLoading(false); return; }

    const q = query(
      collection(db, "teams"),
      orderBy("rankScore", "desc"),
      limit(LIMIT),
    );

    getDocs(q)
      .then((snap) => {
        setEntries(snap.docs.map((d) => d.data() as TeamRankingEntry));
      })
      .catch((err: unknown) => {
        if (
          err instanceof FirebaseError &&
          (err.code === "permission-denied" || err.code === "PERMISSION_DENIED")
        ) {
          setRulesBlocked(true);
        } else {
          setError("Could not load team rankings. Try again later.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <Flag className="h-6 w-6 text-pink-400" />
          Team Ranking
        </div>
        <p className="mt-1 text-[13px] text-white/50">
          Top {LIMIT} countries · Stars earned by official fans
        </p>

        <TopNav />

        <div className="mt-6 flex flex-col gap-3">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-white/40">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading team rankings…
            </div>
          )}

          {/* Generic error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center text-[13px] text-red-300">
              {error}
            </div>
          )}

          {/* Rules not deployed */}
          {!loading && rulesBlocked && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-white/60">
                <Lock className="h-4 w-4" />
                Team ranking needs one setup step
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                To make team rankings public, open the{" "}
                <span className="font-bold text-white/60">Firebase Console</span> →
                Firestore → Rules and paste the contents of{" "}
                <code className="rounded bg-white/10 px-1 text-white/70">
                  firestore.rules
                </code>{" "}
                from this project. Team data is already being collected.
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && !rulesBlocked && entries.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <Globe className="h-10 w-10 text-white/20" />
              <p className="text-[14px] font-bold text-white/50">No teams yet</p>
              <p className="text-[12px] text-white/30">
                Teams appear when fans publish their official card.
              </p>
            </div>
          )}

          {/* Full leaderboard */}
          {!loading && !error && !rulesBlocked && entries.length > 0 &&
            entries.map((entry, idx) => (
              <TeamRow key={entry.teamCode} entry={entry} rank={idx + 1} />
            ))
          }
        </div>

        {!loading && !error && !rulesBlocked && entries.length > 0 && (
          <p className="mt-6 text-center text-[11px] text-white/25">
            Score = XP + stars × 100 · Top {LIMIT} teams shown
          </p>
        )}
      </div>
    </main>
  );
}
