"use client";

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseDb, getFirebaseFunctions } from "./firebase";
import { TEAMS, getTeam } from "./teams";

// ─── Allowlist (frontend reference — authority lives in the Cloud Function) ───

const VALID_TEAM_CODES = new Set(TEAMS.map((t) => t.code));

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AwardResult {
  ok: boolean;
  awarded: boolean;
  stars?: number;
  xp?: number;
  newOfficialStars?: number;
  newRankScore?: number;
  error?: string;
}

// Shape returned by the awardOfficialStarsSecure Cloud Function
interface SecureFnResult {
  awarded: boolean;
  action: string;
  starsDelta: number;
  xpDelta: number;
  officialStars: number;
  officialXp: number;
  rankScore: number;
  reason?: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  officialStars: number;
  officialXp: number;
  rankScore: number;
  officialTeamCode: string | null;
  officialCardIdentityId: string | null;
  officialCardDisplayName: string | null;
  updatedAt: unknown;
}

export interface TeamRankingEntry {
  teamCode: string;
  teamName: string;
  flag: string;
  totalStars: number;
  totalXp: number;
  rankScore: number;
  memberCount: number;
  updatedAt: unknown;
}

// ─── Award stars — secure Cloud Function call ─────────────────────────────────
// Calls awardOfficialStarsSecure (Firebase Cloud Function).
// The function performs all progression writes server-side:
//   users/{uid}, teams/{teamCode}, leaderboard/{uid}
// NO client-side star writes happen here. No silent fallback.

export async function awardOfficialStars(
  _uid: string,     // uid kept in signature for call-site compatibility; function uses auth context
  action: string,
): Promise<AwardResult> {
  const functions = getFirebaseFunctions();
  if (!functions) {
    return {
      ok: false,
      awarded: false,
      error: "Firebase Functions not available. Check your Firebase configuration.",
    };
  }

  try {
    const fn = httpsCallable<{ action: string }, SecureFnResult>(
      functions,
      "awardOfficialStarsSecure",
    );
    const result = await fn({ action });
    const d = result.data;

    return {
      ok:               true,
      awarded:          d.awarded,
      stars:            d.starsDelta,
      xp:               d.xpDelta,
      newOfficialStars: d.officialStars,
      newRankScore:     d.rankScore,
    };
  } catch (err: unknown) {
    // Surface a clear, specific error — never fall back to client-side writes.
    const code = (err as { code?: string }).code ?? "";
    const message = (err as { message?: string }).message ?? "";

    if (code === "functions/not-found" || code === "functions/unimplemented") {
      return {
        ok: false,
        awarded: false,
        error:
          "Secure progression Cloud Function not yet deployed. " +
          "Run: firebase deploy --only functions,firestore:rules",
      };
    }
    if (code === "functions/unauthenticated") {
      return { ok: false, awarded: false, error: "You must be signed in to earn stars." };
    }
    if (code === "functions/invalid-argument") {
      return { ok: false, awarded: false, error: `Invalid action: ${message}` };
    }

    console.warn("awardOfficialStars (secure) failed", err);
    return {
      ok: false,
      awarded: false,
      error: "Could not contact progression service. Try again later.",
    };
  }
}

// ─── Leaderboard display refresh (client — display fields only) ───────────────
// Reads the authoritative users/{uid} profile and mirrors DISPLAY fields only
// to leaderboard/{uid}. Score fields (officialStars, officialXp, rankScore)
// are written exclusively by the Cloud Function — merge:true preserves them.

export async function refreshOfficialLeaderboardEntry(uid: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;
    const d = snap.data() as Record<string, unknown>;
    const card = d.officialCard as Record<string, unknown> | null | undefined;

    // Only display fields — scores stay as written by the Cloud Function
    await setDoc(
      doc(db, "leaderboard", uid),
      {
        uid,
        displayName:             (d.displayName as string) ?? "",
        photoURL:                (d.photoURL as string | null) ?? null,
        officialTeamCode:        (d.officialTeamCode as string | null) ?? null,
        officialCardIdentityId:  (card?.identityId as string | null) ?? null,
        officialCardDisplayName: (card?.displayName as string | null) ?? null,
        updatedAt:               serverTimestamp(),
      },
      { merge: true },   // preserves officialStars/officialXp/rankScore written by backend
    );
  } catch (err) {
    console.warn("refreshOfficialLeaderboardEntry failed", err);
  }
}

// ─── Team member count aggregation ───────────────────────────────────────────
// Updates memberCount only — score fields (totalStars, totalXp, rankScore)
// are owned by the Cloud Function and must NOT be written from the client.
// merge:true preserves the existing backend score values.
//
// MVP LIMITATION: historical stars are NOT moved to the new team.
// Only future star awards will go to the new team.
// Full recalculation requires a Cloud Function in a later phase.

export async function adjustTeamMemberCount(
  newTeamCode: string,
  oldTeamCode?: string | null,
): Promise<void> {
  if (!VALID_TEAM_CODES.has(newTeamCode)) return;
  const db = getFirebaseDb();
  if (!db) return;

  const changeOld =
    !!oldTeamCode &&
    VALID_TEAM_CODES.has(oldTeamCode) &&
    oldTeamCode !== newTeamCode;

  try {
    await runTransaction(db, async (tx) => {
      // ── READS ─────────────────────────────────────────────────────────────
      const newTeamRef  = doc(db, "teams", newTeamCode);
      const newTeamSnap = await tx.get(newTeamRef);
      const newTeamData = newTeamSnap.exists()
        ? (newTeamSnap.data() as Record<string, unknown>)
        : {};

      let oldTeamData: Record<string, unknown> = {};
      if (changeOld) {
        const oldTeamSnap = await tx.get(doc(db, "teams", oldTeamCode!));
        oldTeamData = oldTeamSnap.exists()
          ? (oldTeamSnap.data() as Record<string, unknown>)
          : {};
      }

      // ── WRITES — memberCount + identity fields only ────────────────────────
      // totalStars / totalXp / rankScore are deliberately omitted here.
      // merge:true ensures the backend-written score fields are preserved.
      const newTeam = getTeam(newTeamCode)!;
      tx.set(
        newTeamRef,
        {
          teamCode:    newTeamCode,
          teamName:    newTeam.name,
          flag:        newTeam.flag ?? "",
          memberCount: ((newTeamData.memberCount as number) ?? 0) + 1,
          updatedAt:   serverTimestamp(),
        },
        { merge: true },
      );

      if (changeOld) {
        const oldTeam = getTeam(oldTeamCode!)!;
        tx.set(
          doc(db, "teams", oldTeamCode!),
          {
            teamCode:    oldTeamCode!,
            teamName:    oldTeam.name,
            flag:        oldTeam.flag ?? "",
            memberCount: Math.max(0, ((oldTeamData.memberCount as number) ?? 0) - 1),
            updatedAt:   serverTimestamp(),
          },
          { merge: true },
        );
      }
    });
  } catch (err) {
    console.warn("adjustTeamMemberCount failed", err);
  }
}

// ─── complete_profile helper ─────────────────────────────────────────────────
// Call after login when user has displayName + (email | photoURL).
// Not auto-triggered — import and call explicitly when appropriate.
export async function maybeAwardCompleteProfile(
  uid: string,
  profile: { displayName?: string | null; email?: string | null; photoURL?: string | null },
): Promise<AwardResult> {
  const hasName  = !!(profile.displayName?.trim());
  const hasIdent = !!(profile.email || profile.photoURL);
  if (!hasName || !hasIdent) return { ok: true, awarded: false };
  return awardOfficialStars(uid, "complete_profile");
}

// ─── writeLeaderboardEntry (kept for API compat — scores written by backend) ──
// @deprecated: prefer refreshOfficialLeaderboardEntry for display updates.
// Score fields here are passed through but the Cloud Function is authoritative.
export async function writeLeaderboardEntry(
  uid: string,
  fields: {
    displayName: string;
    photoURL: string | null;
    officialStars: number;
    officialXp: number;
    rankScore: number;
    officialTeamCode?: string | null;
    officialCardIdentityId?: string | null;
    officialCardDisplayName?: string | null;
  },
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await setDoc(
      doc(db, "leaderboard", uid),
      {
        uid,
        displayName:             fields.displayName,
        photoURL:                fields.photoURL ?? null,
        officialTeamCode:        fields.officialTeamCode ?? null,
        officialCardIdentityId:  fields.officialCardIdentityId ?? null,
        officialCardDisplayName: fields.officialCardDisplayName ?? null,
        updatedAt:               serverTimestamp(),
      },
      { merge: true },  // score fields preserved from backend writes
    );
  } catch (err) {
    console.warn("writeLeaderboardEntry failed", err);
  }
}
