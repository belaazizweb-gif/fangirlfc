import type Konva from "konva";

/**
 * Export the Konva stage as a full-resolution PNG (1086 × 1448).
 *
 * The stage is displayed at a reduced previewScale for mobile, so we
 * compensate with pixelRatio = 1 / previewScale, which causes Konva to
 * render at the full logical canvas size (TEMPLATE_W × TEMPLATE_H).
 */
export function downloadCardPng(
  stage: Konva.Stage,
  previewScale: number,
  filename = "fangirl-fc-player-card.png"
): void {
  const pixelRatio = previewScale > 0 ? 1 / previewScale : 1;
  const dataUrl = stage.toDataURL({ pixelRatio, mimeType: "image/png" });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Share the card PNG via the Web Share API (with files support).
 * Falls back to downloadCardPng if Web Share is unavailable or doesn't
 * support file sharing (e.g. most desktop browsers).
 */
export async function shareCardPng(
  stage: Konva.Stage,
  previewScale: number,
  templateId: string
): Promise<void> {
  const filename = `fangirl-fc-player-card-${templateId}.png`;
  const pixelRatio = previewScale > 0 ? 1 / previewScale : 1;
  const dataUrl = stage.toDataURL({ pixelRatio, mimeType: "image/png" });

  // Try Web Share API with file
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Player Card",
          text: "Check out my Fangirl FC player card! ⚽",
        });
        return;
      }
    } catch (err) {
      // User cancelled or share failed — fall through to download
      if ((err as Error).name !== "AbortError") {
        console.warn("[shareCardPng] Web Share failed, falling back to download", err);
      } else {
        return; // User deliberately cancelled
      }
    }
  }

  // Fallback: trigger download
  downloadCardPng(stage, previewScale, filename);
}
