"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { FanIdentityId } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OfficialShareRecord {
  shareId: string;
  uid: string;
  officialTeamCode: string | null;
  identityId: FanIdentityId;
  templateId: string;
  displayName: string;
  shareUrl: string;
  createdAt: unknown;
}

// ─── Firestore write ──────────────────────────────────────────────────────────
// Analytics/debug only — not used for reward authority.
// Rule: auth user can create own record; no update/delete; no public read.

export async function saveOfficialShareRecord(
  record: Omit<OfficialShareRecord, "createdAt">,
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await setDoc(doc(db, "official_shares", record.shareId), {
      ...record,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Fire-and-forget — analytics failure must not block the share flow.
    console.warn("saveOfficialShareRecord failed (analytics only):", err);
  }
}
