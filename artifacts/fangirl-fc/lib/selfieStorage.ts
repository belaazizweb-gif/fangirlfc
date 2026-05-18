"use client";

const KEY = "fangirlfc.selfie";
const MAX_DIM = 900;
const QUALITY = 0.82;

/**
 * Compress a selfie data URL and persist it to localStorage.
 * Compresses to JPEG ≤900px on longest side (~50–120 KB) so it fits comfortably.
 */
export async function saveSelfie(dataUrl: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL("image/jpeg", QUALITY);
    window.localStorage.setItem(KEY, compressed);
  } catch {
    // Ignore — localStorage full or canvas unavailable.
  }
}

export function loadSelfie(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearSelfie(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
