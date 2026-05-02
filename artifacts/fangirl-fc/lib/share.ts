"use client";

import { customAlphabet } from "nanoid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { mockGetShare, mockSaveShare } from "./mockStore";
import type { ShareRecord } from "@/types";

const nano = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  10,
);

export function newShareId(): string {
  return nano();
}

export async function saveShare(record: ShareRecord): Promise<void> {
  const db = getFirebaseDb();
  if (db) {
    try {
      await setDoc(doc(db, "shares", record.shareId), record);
      return;
    } catch (err) {
      console.warn("Firestore save failed, using local store", err);
    }
  }
  mockSaveShare(record);
}

export async function loadShare(shareId: string): Promise<ShareRecord | null> {
  const db = getFirebaseDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, "shares", shareId));
      if (snap.exists()) {
        return snap.data() as ShareRecord;
      }
    } catch (err) {
      console.warn("Firestore load failed, falling back to local store", err);
    }
  }
  return mockGetShare(shareId);
}

export function buildShareUrl(shareId: string): string {
  if (typeof window === "undefined") return `/compare/${shareId}`;
  const origin = window.location.origin;
  return `${origin}/compare/${shareId}`;
}
