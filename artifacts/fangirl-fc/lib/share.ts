"use client";

import { customAlphabet } from "nanoid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { mockGetShare, mockSaveShare } from "./mockStore";
import { FAN_TYPES } from "./fanTypes";
import type { ShareRecord, FanIdentityId } from "@/types";

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

export function buildShareUrl(shareId: string, mode?: string): string {
  const suffix = mode && mode !== "public" ? `?mode=${mode}` : "";
  if (typeof window === "undefined") return `/compare/${shareId}${suffix}`;
  const origin = window.location.origin;
  return `${origin}/compare/${shareId}${suffix}`;
}

// ---------- Cross-device payload encoding (no backend) ----------

export interface SharePayload {
  v: 1;
  identityId: FanIdentityId;
  displayName: string;
  teamCode: string;
  templateId: string;
  stars: number;
  createdAt: number;
  mode?: string;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(bin)
      : Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? "=".repeat(4 - (norm.length % 4)) : "";
  const bin =
    typeof atob !== "undefined"
      ? atob(norm + pad)
      : Buffer.from(norm + pad, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeSharePayload(record: ShareRecord, mode?: string): string {
  const payload: SharePayload = {
    v: 1,
    identityId: record.identityId,
    displayName: (record.displayName || "Anonymous Fan").slice(0, 40),
    teamCode: record.teamCode,
    templateId: record.templateId,
    stars: Math.max(0, Math.min(99, Math.floor(record.stars || 0))),
    createdAt: record.createdAt,
    ...(mode && mode !== "public" ? { mode } : {}),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return b64urlEncode(bytes);
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  if (!encoded || typeof encoded !== "string" || encoded.length > 2000) {
    return null;
  }
  try {
    const bytes = b64urlDecode(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Partial<SharePayload>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== 1) return null;
    if (
      typeof parsed.identityId !== "string" ||
      !(parsed.identityId in FAN_TYPES)
    ) {
      return null;
    }
    if (
      typeof parsed.teamCode !== "string" ||
      typeof parsed.templateId !== "string" ||
      typeof parsed.displayName !== "string" ||
      typeof parsed.stars !== "number" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }
    return {
      v: 1,
      identityId: parsed.identityId as FanIdentityId,
      displayName: parsed.displayName.slice(0, 40),
      teamCode: parsed.teamCode,
      templateId: parsed.templateId,
      stars: Math.max(0, Math.min(99, Math.floor(parsed.stars))),
      createdAt: parsed.createdAt,
      ...(typeof parsed.mode === "string" ? { mode: parsed.mode } : {}),
    };
  } catch {
    return null;
  }
}

export function buildPayloadShareUrl(
  record: ShareRecord,
  mode?: string,
): string {
  const encoded = encodeSharePayload(record, mode);
  const suffix = mode && mode !== "public" ? `?mode=${mode}` : "";
  if (typeof window === "undefined") return `/compare/p/${encoded}${suffix}`;
  return `${window.location.origin}/compare/p/${encoded}${suffix}`;
}
