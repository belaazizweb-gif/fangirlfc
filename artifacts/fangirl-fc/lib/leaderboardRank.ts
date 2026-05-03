"use client";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { LeaderboardEntry } from "./officialStars";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NearbyEntry {
  rank: number;
  entry: LeaderboardEntry;
  isUser: boolean;
}

export interface RankResult {
  /** 1-indexed rank; -1 if user is not in the fetched top-100. */
  rank: number;
  /** Total entries fetched. */
  total: number;
  /** % of fetched users this user is ahead of (0–100). */
  percentile: number;
  /** Entry directly above the user in rank, or null if user is #1 / not ranked. */
  rival: LeaderboardEntry | null;
  /** rival.rankScore − user.rankScore (0 when no rival). */
  rivalDelta: number;
  /** ceil(rivalDelta / 100) — stars needed to match rival. */
  starsNeeded: number;
  /** Up to 5 nearby entries centered on the user (from better rank → worse). */
  nearby: NearbyEntry[];
}

const EMPTY: RankResult = {
  rank: -1,
  total: 0,
  percentile: 0,
  rival: null,
  rivalDelta: 0,
  starsNeeded: 0,
  nearby: [],
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchLeaderboardRank(uid: string): Promise<RankResult> {
  const db = getFirebaseDb();
  if (!db) return EMPTY;

  try {
    const snap = await getDocs(
      query(
        collection(db, "leaderboard"),
        orderBy("rankScore", "desc"),
        limit(100),
      ),
    );
    const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);
    const total   = entries.length;
    if (total === 0) return { ...EMPTY, total };

    const idx = entries.findIndex((e) => e.uid === uid);

    // User not found in top 100
    if (idx === -1) return { ...EMPTY, total };

    const rank       = idx + 1;
    const percentile = Math.round(((total - rank) / total) * 100);
    const rival      = idx > 0 ? (entries[idx - 1] ?? null) : null;
    const userScore  = entries[idx]?.rankScore ?? 0;
    const rivalDelta = rival ? Math.max(0, (rival.rankScore ?? 0) - userScore) : 0;
    const starsNeeded = rivalDelta > 0 ? Math.ceil(rivalDelta / 100) : 0;

    // ─ Nearby: 2 above + user + 2 below, clamped to array bounds ─
    const start  = Math.max(0, idx - 2);
    const end    = Math.min(total - 1, idx + 2);
    const nearby: NearbyEntry[] = [];
    for (let i = start; i <= end; i++) {
      nearby.push({ rank: i + 1, entry: entries[i]!, isUser: i === idx });
    }

    return { rank, total, percentile, rival, rivalDelta, starsNeeded, nearby };
  } catch {
    // Leaderboard is public read — this only fires on network error
    return EMPTY;
  }
}
