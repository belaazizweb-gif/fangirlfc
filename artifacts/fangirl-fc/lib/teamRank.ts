"use client";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { TeamRankingEntry } from "./officialStars";

// ─── Team rankings ─────────────────────────────────────────────────────────────

export async function fetchTeamRankings(): Promise<TeamRankingEntry[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, "teams"), orderBy("rankScore", "desc"), limit(50)),
    );
    return snap.docs.map((d) => d.data() as TeamRankingEntry);
  } catch {
    return [];
  }
}

/** Returns 1-indexed rank of a team in the entries list, or null if not found. */
export function getTeamRank(
  entries: TeamRankingEntry[],
  teamCode: string,
): number | null {
  const idx = entries.findIndex((e) => e.teamCode === teamCode);
  return idx === -1 ? null : idx + 1;
}

// ─── Recent official shares ────────────────────────────────────────────────────

export interface RecentShareItem {
  shareId: string;
  uid: string;
  displayName: string;
  officialTeamCode: string | null;
}

/** Fetches the most recent official shares ordered by createdAt desc.
 *  Returns [] gracefully on Firestore permission errors (rules not deployed yet).
 */
export async function fetchRecentOfficialShares(
  n = 5,
): Promise<RecentShareItem[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, "official_shares"),
        orderBy("createdAt", "desc"),
        limit(n),
      ),
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        shareId:         (data.shareId as string) ?? d.id,
        uid:             (data.uid as string) ?? "",
        displayName:     (data.displayName as string) || "A fan",
        officialTeamCode:(data.officialTeamCode as string | null) ?? null,
      };
    });
  } catch {
    // Permission denied (rules not yet deployed) or network error — silent fallback
    return [];
  }
}
