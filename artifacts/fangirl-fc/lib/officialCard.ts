"use client";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { FAN_TYPES } from "./fanTypes";
import { TEAMS } from "./teams";
import { TEMPLATES } from "./templates";
import type { FanIdentityId } from "@/types";

export interface OfficialCardData {
  identityId: FanIdentityId;
  teamCode: string;
  displayName: string;
  templateId: string;
  officialSince: unknown;
  sourceCardId?: string;
}

export interface UserProfileFull {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  stars: number;
  lastIdentity: FanIdentityId | null;
  unlockedIds: FanIdentityId[];
  updatedAt?: unknown;
  officialTeamCode?: string | null;
  officialCard?: OfficialCardData | null;
  officialCardUpdatedAt?: unknown;
}

// ---------- Validation ----------

const VALID_IDENTITY_IDS = new Set(Object.keys(FAN_TYPES));
const VALID_TEAM_CODES = new Set(TEAMS.map((t) => t.code));
const VALID_TEMPLATE_IDS = new Set(TEMPLATES.map((t) => t.id));

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateOfficialCard(params: {
  identityId: string;
  teamCode: string;
  displayName: string;
  templateId: string;
}): ValidationResult {
  if (!VALID_IDENTITY_IDS.has(params.identityId)) {
    return { ok: false, error: "Invalid fan identity." };
  }
  if (!VALID_TEAM_CODES.has(params.teamCode)) {
    return { ok: false, error: "Invalid team code." };
  }
  if (!VALID_TEMPLATE_IDS.has(params.templateId)) {
    return { ok: false, error: "Invalid card template." };
  }
  const name = params.displayName.trim();
  if (!name) {
    return { ok: false, error: "Display name cannot be empty." };
  }
  if (name.length > 24) {
    return { ok: false, error: "Display name must be 24 characters or less." };
  }
  return { ok: true };
}

// ---------- Firestore reads ----------

export async function getUserProfile(
  uid: string,
): Promise<UserProfileFull | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfileFull;
  } catch (err) {
    console.warn("getUserProfile failed", err);
    return null;
  }
}

// ---------- Firestore writes ----------

export async function setOfficialTeam(
  uid: string,
  teamCode: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!VALID_TEAM_CODES.has(teamCode)) {
    return { ok: false, error: "Invalid team code." };
  }
  const db = getFirebaseDb();
  if (!db) return { ok: false, error: "Firebase not available." };
  try {
    await setDoc(
      doc(db, "users", uid),
      { officialTeamCode: teamCode, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return { ok: true };
  } catch (err) {
    console.warn("setOfficialTeam failed", err);
    return { ok: false, error: "Failed to save official team. Try again." };
  }
}

export async function setOfficialCard(
  uid: string,
  card: {
    identityId: string;
    teamCode: string;
    displayName: string;
    templateId: string;
    sourceCardId?: string;
  },
  opts: { updateTeam?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const v = validateOfficialCard(card);
  if (!v.ok) return { ok: false, error: v.error };

  const db = getFirebaseDb();
  if (!db) return { ok: false, error: "Firebase not available." };

  const officialCard: OfficialCardData = {
    identityId: card.identityId as FanIdentityId,
    teamCode: card.teamCode,
    displayName: card.displayName.trim().slice(0, 24),
    templateId: card.templateId,
    officialSince: serverTimestamp(),
    ...(card.sourceCardId ? { sourceCardId: card.sourceCardId } : {}),
  };

  const update: Partial<UserProfileFull> & Record<string, unknown> = {
    officialCard,
    officialCardUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (opts.updateTeam) {
    update.officialTeamCode = card.teamCode;
  }

  try {
    await setDoc(doc(db, "users", uid), update, { merge: true });
    return { ok: true };
  } catch (err) {
    console.warn("setOfficialCard failed", err);
    return { ok: false, error: "Failed to save official card. Try again." };
  }
}
