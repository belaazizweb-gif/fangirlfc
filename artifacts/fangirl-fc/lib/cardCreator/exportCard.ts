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
  filename = "fangirl-fc-card.png"
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
