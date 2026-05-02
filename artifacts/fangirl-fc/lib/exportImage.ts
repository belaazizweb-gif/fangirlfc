"use client";

import { toPng } from "html-to-image";

export async function exportNodeAsPng(
  node: HTMLElement,
  fileName: string,
): Promise<void> {
  // Card renders at 360x640 (9:16). pixelRatio 3 → 1080x1920 export.
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: "#000000",
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
