"use client";

import { useEffect, useState } from "react";
import { TEMPLATE_W, TEMPLATE_H } from "@/lib/cardCreator/renderUtils";

/**
 * Creates an offscreen canvas copy of overlay.png with a transparent rectangle
 * punched out at the exact photo zone coordinates.
 *
 * Why: overlay.png files are 100% opaque — even in the photo area. The photo
 * would be invisible without this masking step.
 *
 * Technique: Canvas 2D `destination-out` composite operation clears pixels
 * inside fillRect, leaving genuine alpha=0 transparency there.
 *
 * The result is cached per (templateId + photo zone dimensions) via useState.
 * A new canvas is created only when the inputs actually change.
 */
export function useMaskedOverlay(
  overlayImage: HTMLImageElement | undefined,
  overlayStatus: string,
  templateId: string,
  photoX: number,
  photoY: number,
  photoW: number,
  photoH: number,
): HTMLCanvasElement | null {
  const [maskedCanvas, setMaskedCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run once the image is fully loaded
    if (overlayStatus !== "loaded" || !overlayImage) {
      setMaskedCanvas(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width  = TEMPLATE_W;   // 1086
    canvas.height = TEMPLATE_H;   // 1448

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("[useMaskedOverlay] Could not get 2D context");
      return;
    }

    // Step 1 — draw full overlay onto offscreen canvas
    ctx.drawImage(overlayImage, 0, 0, TEMPLATE_W, TEMPLATE_H);

    // Step 2 — switch to destination-out: subsequent draws erase pixels
    ctx.globalCompositeOperation = "destination-out";

    // Step 3 — fill the photo zone with any colour; only alpha matters here
    //           This sets every pixel in the zone to alpha=0 (fully transparent)
    ctx.fillStyle = "#000000";
    ctx.fillRect(
      Math.round(photoX),
      Math.round(photoY),
      Math.round(photoW),
      Math.round(photoH),
    );

    // Step 4 — restore composite operation for any future draws
    ctx.globalCompositeOperation = "source-over";

    setMaskedCanvas(canvas);
  // Regenerate when template changes or photo zone dimensions change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayImage, overlayStatus, templateId, photoX, photoY, photoW, photoH]);

  return maskedCanvas;
}
