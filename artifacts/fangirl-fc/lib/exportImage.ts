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

async function generateCardPng(node: HTMLElement): Promise<string> {
  await waitForImages(node);
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#000000",
  });
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export async function downloadCardImage(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  let dataUrl: string;
  try {
    dataUrl = await generateCardPng(node);
  } catch {
    return { status: "error" };
  }

  // iOS Safari silently ignores <a download> — show long-press modal instead.
  if (isIOS()) {
    return { status: "fallback", dataUrl };
  }

  // Desktop + Android: convert data URL → Blob URL before triggering download.
  // Raw data: URLs are not reliably downloaded on Android Chrome.
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

  if (shareUrl && typeof navigator !== "undefined" && "clipboard" in navigator) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { status: "shared" };
    } catch {
      // fall through
    }
  }

  return { status: "fallback", dataUrl };
}

export async function exportNodeAsPng(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  const dataUrl = await generateCardPng(node);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareOrDownloadCard(
  node: HTMLElement,
  fileName: string,
): Promise<ExportShareResult> {
  return shareCardImage(node, fileName);
}
