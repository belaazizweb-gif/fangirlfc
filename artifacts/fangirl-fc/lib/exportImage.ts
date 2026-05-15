"use client";

import { toPng } from "html-to-image";

export interface ExportShareResult {
  status: "shared" | "downloaded" | "fallback" | "error";
  dataUrl?: string;
}

export async function waitForImages(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
  await Promise.all(
    imgs.map((img) => {
      const decodeIt = (el: HTMLImageElement) =>
        el.decode ? el.decode().catch(() => {}) : Promise.resolve();

      if (img.complete && img.naturalHeight !== 0) {
        return decodeIt(img);
      }
      return new Promise<void>((resolve) => {
        const cleanup = () => resolve();
        img.addEventListener("load", () => decodeIt(img).then(cleanup), { once: true });
        img.addEventListener("error", cleanup, { once: true });
        setTimeout(cleanup, 4000);
      });
    }),
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

async function generateCardPng(node: HTMLElement): Promise<string> {
  await waitForImages(node);
  const opts = { cacheBust: true, pixelRatio: 3, backgroundColor: "#000000" };
  // iOS Safari often produces a blank canvas on the first toPng call due to
  // WebKit's deferred rendering. A warm-up pass + short delay ensures a full render.
  if (isIOS()) {
    await toPng(node, opts).catch(() => {});
    await new Promise((r) => setTimeout(r, 100));
  }
  return toPng(node, opts);
}

/**
 * Shared download logic used by both "Download image" and "Download story card".
 *
 * iOS:  1st try → native share sheet (user taps "Save Image" — no extra step).
 *        Fallback → long-press modal if share API unavailable or user cancels.
 * Android / Desktop: Blob URL anchor click → direct download to Files.
 */
async function triggerDownload(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  let dataUrl: string;
  try {
    dataUrl = await generateCardPng(node);
  } catch {
    return { status: "error" };
  }

  if (isIOS()) {
    // Prefer the native share sheet — gives the user a "Save Image" option directly.
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });
      if ("canShare" in navigator && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Fangirl FC Card 💖" });
        return { status: "shared" };
      }
    } catch (err) {
      // AbortError = user dismissed the share sheet intentionally.
      if ((err as Error).name === "AbortError") return { status: "error" };
      // Any other error → fall through to long-press modal.
    }
    // Last resort: show the image in a modal for long-press saving.
    return { status: "fallback", dataUrl };
  }

  // Android + Desktop: convert data URL → Blob URL for reliable file download.
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return { status: "downloaded" };
  } catch {
    return { status: "fallback", dataUrl };
  }
}

export async function downloadCardImage(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  return triggerDownload(node, fileName);
}

/**
 * Same download logic as downloadCardImage — now includes iOS share sheet +
 * Android Blob URL instead of the old silent-failure data: URL approach.
 */
export async function exportNodeAsPng(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  return triggerDownload(node, fileName);
}

export async function shareCardImage(
  node: HTMLElement,
  fileName: string,
  shareUrl?: string | null,
): Promise<ExportShareResult> {
  let dataUrl: string;
  try {
    dataUrl = await generateCardPng(node);
  } catch {
    return { status: "error" };
  }

  if (typeof navigator === "undefined") {
    return { status: "fallback", dataUrl };
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: "image/png" });
    if ("canShare" in navigator && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "My Fangirl FC Card 💖",
        text: "World Cup 2026 — I got my Fangirl Card!",
      });
      return { status: "shared" };
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return { status: "error" };
  }

  if (shareUrl && "clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { status: "shared" };
    } catch {
      // fall through
    }
  }

  return { status: "fallback", dataUrl };
}

export async function shareOrDownloadCard(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  return shareCardImage(node, fileName);
}
