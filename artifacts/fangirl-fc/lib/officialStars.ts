"use client";

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { TEAMS, getTeam } from "./teams";

// ─── Allowlist ────────────────────────────────────────────────────────────────

type ActionName =
  | "publish_official_card"
  | "replace_official_card"
  | "share_official_card"
  | "complete_profile";

interface ActionDef {
  stars: number;
  xp: number;
  once: boolean;
  maxCount?: number;
}

const OFFICIAL_ACTIONS: Record<ActionName, ActionDef> = {
  publish_official_card: { stars: 0.5,  xp: 50, once: true               },
  replace_official_card: { stars: 0.25, xp: 25, once: false, maxCount: 3 },
  share_official_card:   { stars: 0.5,  xp: 50, once: true               },
  complete_profile:      { stars: 0.5,  xp: 50, once: true               },
};

const VALID_ACTIONS    = new Set<string>(Object.keys(OFFICIAL_ACTIONS));
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

// ─── Internal leaderboard write ───────────────────────────────────────────────
// Use refreshOfficialLeaderboardEntry() in UI components instead.

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
  const entry: LeaderboardEntry = {
    uid,
    displayName:             fields.displayName,
    photoURL:                fields.photoURL ?? null,
    officialStars:           fields.officialStars,
    officialXp:              fields.officialXp,
    rankScore:               fields.rankScore,
    officialTeamCode:        fields.officialTeamCode ?? null,
    officialCardIdentityId:  fields.officialCardIdentityId ?? null,
    officialCardDisplayName: fields.officialCardDisplayName ?? null,
    updatedAt:               serverTimestamp(),
  };
  try {
    await setDoc(doc(db, "leaderboard", uid), entry);
  } catch (err) {
    console.warn("writeLeaderboardEntry failed", err);
  }
}

// ─── Centralized leaderboard refresh ─────────────────────────────────────────
// Reads the authoritative users/{uid} profile and mirrors safe public fields
// to leaderboard/{uid}. Call this after any write that changes user's official
// card, team, or stars. This is the single leaderboard write path for UI code.

export async function refreshOfficialLeaderboardEntry(uid: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return;
    const d = snap.data() as Record<string, unknown>;
    const card = d.officialCard as Record<string, unknown> | null | undefined;
    await writeLeaderboardEntry(uid, {
      displayName:             (d.displayName as string) ?? "",
      photoURL:                (d.photoURL as string | null) ?? null,
      officialStars:           (d.officialStars as number) ?? 0,
      officialXp:              (d.officialXp as number) ?? 0,
      rankScore:               (d.rankScore as number) ?? 0,
      officialTeamCode:        (d.officialTeamCode as string | null) ?? null,
      officialCardIdentityId:  (card?.identityId as string | null) ?? null,
      officialCardDisplayName: (card?.displayName as string | null) ?? null,
    });
  } catch (err) {
    console.warn("refreshOfficialLeaderboardEntry failed", err);
  }
}

// ─── Award stars — central progression write path ─────────────────────────────
// Single Firestore transaction that atomically:
//   1. Updates users/{uid} (stars, xp, rankScore, starActions)
//   2. Updates teams/{officialTeamCode} (totalStars, totalXp, rankScore)
// Does NOT write to leaderboard — call refreshOfficialLeaderboardEntry() after.

export async function awardOfficialStars(
  uid: string,
  action: string,
): Promise<AwardResult> {
  if (!VALID_ACTIONS.has(action)) {
    return { ok: false, awarded: false, error: `Unknown action: ${action}` };
  }
  const def = OFFICIAL_ACTIONS[action as ActionName];
  const db = getFirebaseDb();
  if (!db) return { ok: false, awarded: false, error: "Firebase not available." };

  try {
    const txResult = await runTransaction(db, async (tx) => {
      // ── READS (all before any writes) ──────────────────────────────────────
      const userRef  = doc(db, "users", uid);
      const userSnap = await tx.get(userRef);

      const data           = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
      const currentStars   = (data.officialStars   as number) ?? 0;
      const currentXp      = (data.officialXp      as number) ?? 0;
      const currentActions = (data.officialStarActions as Record<string, number>) ?? {};
      const actionCount    = currentActions[action] ?? 0;
      const teamCode       = (data.officialTeamCode as string) ?? null;

      // Eligibility check
      const eligible =
        def.once
          ? actionCount < 1
          : def.maxCount === undefined || actionCount < def.maxCount;

      // Conditionally read team doc (all reads must precede writes)
      let teamData: Record<string, unknown> = {};
      if (eligible && teamCode && VALID_TEAM_CODES.has(teamCode)) {
        const teamSnap = await tx.get(doc(db, "teams", teamCode));
        teamData = teamSnap.exists() ? (teamSnap.data() as Record<string, unknown>) : {};
      }

      if (!eligible) {
        return {
          awarded:         false,
          newOfficialStars: currentStars,
          newXp:           currentXp,
          newRankScore:    currentXp + currentStars * 100,
        };
      }

      // ── COMPUTE ────────────────────────────────────────────────────────────
      const newStars     = Math.round((currentStars + def.stars) * 100) / 100;
      const newXp        = currentXp + def.xp;
      const newRankScore = newXp + newStars * 100;
      const newActions   = { ...currentActions, [action]: actionCount + 1 };

      // ── WRITES ─────────────────────────────────────────────────────────────
      tx.set(userRef, {
        officialStars:       newStars,
        officialXp:          newXp,
        rankScore:           newRankScore,
        officialStarActions: newActions,
        updatedAt:           serverTimestamp(),
      }, { merge: true });

      // Team aggregate — incremental, no historical recalculation
      if (teamCode && VALID_TEAM_CODES.has(teamCode)) {
        const team         = getTeam(teamCode)!;
        const prevTotal    = (teamData.totalStars  as number) ?? 0;
        const prevTotalXp  = (teamData.totalXp     as number) ?? 0;
        const memberCount  = (teamData.memberCount  as number) ?? 0;
        const newTotal     = Math.round((prevTotal + def.stars) * 100) / 100;
        const newTotalXp   = prevTotalXp + def.xp;
        tx.set(doc(db, "teams", teamCode), {
          teamCode,
          teamName:   team.name,
          flag:       team.flag ?? "",
          totalStars: newTotal,
          totalXp:    newTotalXp,
          rankScore:  newTotalXp + newTotal * 100,
          memberCount,
          updatedAt:  serverTimestamp(),
        }, { merge: true });
      }

      return { awarded: true, newOfficialStars: newStars, newXp, newRankScore };
    });

    return {
      ok:               true,
      awarded:          txResult.awarded,
      stars:            txResult.awarded ? def.stars : 0,
      xp:               txResult.awarded ? def.xp : 0,
      newOfficialStars: txResult.newOfficialStars,
      newRankScore:     txResult.newRankScore,
    };
  } catch (err) {
    console.warn("awardOfficialStars failed", err);
    return { ok: false, awarded: false, error: "Failed to award stars." };
  }
}

// ─── Team member count aggregation ───────────────────────────────────────────
// Call when a user confirms a team change.
// MVP LIMITATION: historical stars are NOT moved to the new team.
// Only future star awards will go to the new team.
// This is intentional — team star recalculation requires a Cloud Function (Phase 4+).

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

      // ── WRITES ─────────────────────────────────────────────────────────────
      const newTeam = getTeam(newTeamCode)!;
      tx.set(newTeamRef, {
        teamCode:   newTeamCode,
        teamName:   newTeam.name,
        flag:       newTeam.flag ?? "",
        memberCount: ((newTeamData.memberCount as number) ?? 0) + 1,
        totalStars: (newTeamData.totalStars as number) ?? 0,
        totalXp:    (newTeamData.totalXp    as number) ?? 0,
        rankScore:  (newTeamData.rankScore  as number) ?? 0,
        updatedAt:  serverTimestamp(),
      }, { merge: true });

      if (changeOld) {
        const oldTeam = getTeam(oldTeamCode!)!;
        tx.set(doc(db, "teams", oldTeamCode!), {
          teamCode:   oldTeamCode!,
          teamName:   oldTeam.name,
          flag:       oldTeam.flag ?? "",
          memberCount: Math.max(0, ((oldTeamData.memberCount as number) ?? 0) - 1),
          totalStars: (oldTeamData.totalStars as number) ?? 0,
          totalXp:    (oldTeamData.totalXp    as number) ?? 0,
          rankScore:  (oldTeamData.rankScore  as number) ?? 0,
          updatedAt:  serverTimestamp(),
        }, { merge: true });
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
