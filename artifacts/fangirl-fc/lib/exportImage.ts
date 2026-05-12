"use client";

import { toPng } from "html-to-image";

async function generateCardPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#000000",
  });
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

export interface ExportShareResult {
  status: "shared" | "downloaded" | "fallback" | "error";
  dataUrl?: string;
}

export async function shareOrDownloadCard(
  node: HTMLElement,
  fileName: string,
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

  // 1. Try Web Share API with file (best mobile experience — iOS 15+, Android Chrome)
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
    // Not supported or failed — fall through to download
  }

  // 2. Try download anchor (works on desktop + Android without file share)
  try {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { status: "downloaded" };
  } catch {
    // Fall through to manual fallback
  }

  // 3. Return dataUrl so the caller can show a "long press to save" modal
  return { status: "fallback", dataUrl };
}
