"use client";

import {
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

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
  publish_official_card: { stars: 0.5, xp: 50,  once: true              },
  replace_official_card: { stars: 0.25, xp: 25, once: false, maxCount: 3 },
  share_official_card:   { stars: 0.5, xp: 50,  once: true              },
  complete_profile:      { stars: 0.5, xp: 50,  once: true              },
};

const VALID_ACTIONS = new Set<string>(Object.keys(OFFICIAL_ACTIONS));

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

// ─── Leaderboard write ────────────────────────────────────────────────────────

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
    displayName: fields.displayName,
    photoURL: fields.photoURL ?? null,
    officialStars: fields.officialStars,
    officialXp: fields.officialXp,
    rankScore: fields.rankScore,
    officialTeamCode: fields.officialTeamCode ?? null,
    officialCardIdentityId: fields.officialCardIdentityId ?? null,
    officialCardDisplayName: fields.officialCardDisplayName ?? null,
    updatedAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, "leaderboard", uid), entry);
  } catch (err) {
    console.warn("writeLeaderboardEntry failed", err);
  }
}

// ─── Award stars (Firestore transaction) ─────────────────────────────────────

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
      const ref = doc(db, "users", uid);
      const snap = await tx.get(ref);

      const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
      const currentStars    = (data.officialStars    as number) ?? 0;
      const currentXp       = (data.officialXp       as number) ?? 0;
      const currentActions  = (data.officialStarActions as Record<string, number>) ?? {};
      const actionCount     = currentActions[action] ?? 0;

      if (def.once && actionCount >= 1) {
        return {
          awarded: false,
          newOfficialStars: currentStars,
          newXp: currentXp,
          newRankScore: currentXp + currentStars * 100,
        };
      }
      if (!def.once && def.maxCount !== undefined && actionCount >= def.maxCount) {
        return {
          awarded: false,
          newOfficialStars: currentStars,
          newXp: currentXp,
          newRankScore: currentXp + currentStars * 100,
        };
      }

      const newStars     = Math.round((currentStars + def.stars) * 100) / 100;
      const newXp        = currentXp + def.xp;
      const newRankScore = newXp + newStars * 100;
      const newActions   = { ...currentActions, [action]: actionCount + 1 };

      tx.set(ref, {
        officialStars:       newStars,
        officialXp:          newXp,
        rankScore:           newRankScore,
        officialStarActions: newActions,
        updatedAt:           serverTimestamp(),
      }, { merge: true });

      return { awarded: true, newOfficialStars: newStars, newXp, newRankScore };
    });

    return {
      ok:              true,
      awarded:         txResult.awarded,
      stars:           txResult.awarded ? def.stars : 0,
      xp:              txResult.awarded ? def.xp : 0,
      newOfficialStars: txResult.newOfficialStars,
      newRankScore:    txResult.newRankScore,
    };
  } catch (err) {
    console.warn("awardOfficialStars failed", err);
    return { ok: false, awarded: false, error: "Failed to award stars." };
  }
}

// ─── complete_profile helper (call after login if conditions met) ─────────────
// Trigger from AuthProvider or syncUserOnLogin when user has displayName + (email | photoURL).
// Not auto-triggered here — import and call manually when appropriate.
export async function maybeAwardCompleteProfile(
  uid: string,
  profile: { displayName?: string | null; email?: string | null; photoURL?: string | null },
): Promise<AwardResult> {
  const hasName  = !!(profile.displayName?.trim());
  const hasIdent = !!(profile.email || profile.photoURL);
  if (!hasName || !hasIdent) return { ok: true, awarded: false };
  return awardOfficialStars(uid, "complete_profile");
}
