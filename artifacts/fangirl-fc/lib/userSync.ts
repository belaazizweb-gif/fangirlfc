"use client";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { FanIdentityId } from "@/types";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  stars: number;
  lastIdentity: FanIdentityId | null;
  unlockedIds: FanIdentityId[];
  updatedAt?: unknown;
  officialTeamCode?: string | null;
  officialCard?: {
    identityId: FanIdentityId;
    teamCode: string;
    displayName: string;
    templateId: string;
    officialSince: unknown;
    sourceCardId?: string;
  } | null;
  officialCardUpdatedAt?: unknown;
  officialStars?: number;
  officialXp?: number;
  rankScore?: number;
  officialStarActions?: Record<string, number>;
}

function localStars(): number {
  try {
    const raw = localStorage.getItem("fangirlfc.stars");
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch { return 0; }
}

function localIdentity(): FanIdentityId | null {
  try {
    return (localStorage.getItem("fangirlfc.lastIdentity") as FanIdentityId) ?? null;
  } catch { return null; }
}

function localUnlocked(): FanIdentityId[] {
  try {
    const raw = localStorage.getItem("fangirlfc.unlocked");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FanIdentityId[]) : [];
  } catch { return []; }
}

function applyProfileToLocal(profile: UserProfile) {
  try {
    const localStarsVal = localStars();
    // Merge: take the higher stars value
    const mergedStars = Math.max(profile.stars ?? 0, localStarsVal);
    localStorage.setItem("fangirlfc.stars", String(mergedStars));

    if (profile.lastIdentity) {
      localStorage.setItem("fangirlfc.lastIdentity", profile.lastIdentity);
    }

    if (profile.unlockedIds?.length) {
      const localSet = new Set(localUnlocked());
      profile.unlockedIds.forEach((id) => localSet.add(id));
      localStorage.setItem("fangirlfc.unlocked", JSON.stringify([...localSet]));
    }
  } catch { /* ignore */ }
}

export async function syncUserOnLogin(uid: string, displayName: string, email: string | null, photoURL: string | null): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // Pull cloud data and merge with local
      const profile = snap.data() as UserProfile;
      applyProfileToLocal(profile);

      // Then push merged local values back up
      const mergedStars = Math.max(profile.stars ?? 0, localStars());
      const localSet = new Set([...(profile.unlockedIds ?? []), ...localUnlocked()]);
      await setDoc(ref, {
        ...profile,
        displayName,
        email,
        photoURL,
        stars: mergedStars,
        unlockedIds: [...localSet],
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // First login — push local data to cloud
      const profile: Omit<UserProfile, "updatedAt"> = {
        uid,
        displayName,
        email,
        photoURL,
        stars: localStars(),
        lastIdentity: localIdentity(),
        unlockedIds: localUnlocked(),
      };
      await setDoc(ref, { ...profile, updatedAt: serverTimestamp() });
    }
  } catch (err) {
    console.warn("Firestore user sync failed", err);
  }
}

export async function pushLocalToCloud(uid: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const ref = doc(db, "users", uid);
    const localSet = new Set(localUnlocked());
    await setDoc(ref, {
      stars: localStars(),
      lastIdentity: localIdentity(),
      unlockedIds: [...localSet],
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore push failed", err);
  }
}
