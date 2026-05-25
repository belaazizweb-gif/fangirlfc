/**
 * MODNet background removal helper.
 *
 * Uses @huggingface/transformers (Apache-2.0) + Xenova/modnet.
 * Runs entirely client-side — no server, no API, no upload.
 *
 * Exported contract:
 *   removeBackgroundModnet(inputBlob: Blob): Promise<Blob>
 *
 * Used as the default production engine in CreatorScreen.tsx.
 * Emergency @imgly fallback available via ?bg_engine=imgly URL param.
 *
 * First MODNet load may take 30–60 seconds depending on network/device
 * because the model is downloaded by Transformers.js.
 * Treat only explicit errors as failures — a long first load is NOT a failure.
 *
 * Canvas compatibility note:
 * RawImage.toBlob() inside @huggingface/transformers uses OffscreenCanvas,
 * which is NOT available on iOS Safari < 16.4. We bypass it entirely and use
 * the raw pixel data (.data/.width/.height/.channels) with HTMLCanvasElement
 * + canvas.toBlob() — which has universal browser support.
 */

// ── Task fallback order ────────────────────────────────────────────────────────
//
// "background-removal" is the canonical Transformers.js task for MODNet, but
// some builds surface it under "image-segmentation" instead.
// We try both in order so the helper works across versions.

const MODNET_TASKS = ["background-removal", "image-segmentation"] as const;
type ModnetTask = (typeof MODNET_TASKS)[number];

// ── Lazy singleton ─────────────────────────────────────────────────────────────
//
// The pipeline is expensive to initialise (model download + ONNX setup).
// We create it once and reuse the same instance on every subsequent call.

interface PipelineSingleton {
  pipe: unknown;
  task: ModnetTask;
}

let singletonPromise: Promise<PipelineSingleton> | null = null;

async function getPipeline(): Promise<PipelineSingleton> {
  if (!singletonPromise) {
    singletonPromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");

      const errors: string[] = [];

      for (const task of MODNET_TASKS) {
        try {
          const pipe = await pipeline(task, "Xenova/modnet");
          if (process.env.NODE_ENV !== "production") {
            console.info(`[MODNet] Loaded Xenova/modnet with task: ${task}`);
          }
          return { pipe, task };
        } catch (err) {
          errors.push(
            `task="${task}": ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      throw new Error(
        `MODNet: failed to initialise pipeline with any supported task.\n` +
          errors.map((e) => `  • ${e}`).join("\n"),
      );
    })();
  }
  return singletonPromise;
}

// ── RawImage-shaped result type ────────────────────────────────────────────────
//
// @huggingface/transformers RawImage has: data (Uint8ClampedArray|Uint8Array),
// width (number), height (number), channels (1|2|3|4).
// The background-removal pipeline with Xenova/modnet outputs RGBA (channels=4).

interface RawImageLike {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
  channels: number;
}

function isRawImageLike(v: unknown): v is RawImageLike {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    (obj.data instanceof Uint8ClampedArray || obj.data instanceof Uint8Array) &&
    typeof obj.width === "number" &&
    typeof obj.height === "number" &&
    typeof obj.channels === "number"
  );
}

// ── Pixel data → Blob via HTMLCanvasElement ────────────────────────────────────
//
// We intentionally avoid RawImage.toBlob() because it calls OffscreenCanvas
// internally, which is not available on iOS Safari < 16.4 and some WebViews.
// HTMLCanvasElement.toBlob() has universal browser support.

async function rawImageToBlob(img: RawImageLike): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("MODNet: could not obtain a 2D canvas context");
  }

  // Build RGBA data — ImageData constructor requires exactly 4 channels.
  let rgba: Uint8ClampedArray;
  if (img.channels === 4) {
    rgba =
      img.data instanceof Uint8ClampedArray
        ? img.data
        : new Uint8ClampedArray(
            img.data.buffer,
            img.data.byteOffset,
            img.data.byteLength,
          );
  } else {
    // Expand to RGBA.  Background-removal normally outputs 4 channels, but we
    // handle other channel counts defensively.
    const px = img.width * img.height;
    rgba = new Uint8ClampedArray(px * 4);
    for (let i = 0; i < px; i++) {
      const s = i * img.channels;
      const d = i * 4;
      rgba[d] = img.data[s];
      rgba[d + 1] = img.channels > 1 ? img.data[s + 1] : img.data[s];
      rgba[d + 2] = img.channels > 2 ? img.data[s + 2] : img.data[s];
      rgba[d + 3] = img.channels > 3 ? img.data[s + 3] : 255;
    }
  }

  // new Uint8ClampedArray(rgba) forces a copy with a plain ArrayBuffer,
  // satisfying TypeScript's ImageData constructor overload constraint.
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), img.width, img.height), 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("MODNet: canvas.toBlob() returned null"));
      }
    }, "image/png");
  });
}

// ── Result shape normalisation ─────────────────────────────────────────────────
//
// The background-removal pipeline with Xenova/modnet and a single (non-array)
// input returns a single RawImage directly:
//   pipe(blob) → RawImage   (result[0] from inner map, not wrapped in array)
//
// Some versions / tasks may return an array or a nested shape.  We handle all
// observed shapes:
//
//   Shape 1 — single RawImage (primary, confirmed for Xenova/modnet)
//   Shape 2 — Array of RawImages  [RawImage, ...]
//   Shape 3 — Array of {output: RawImage}  [{output: RawImage}, ...]

async function extractBlob(raw: unknown): Promise<Blob> {
  // Shape 1 — single RawImage
  if (isRawImageLike(raw)) {
    return rawImageToBlob(raw);
  }

  // Shape 2 / Shape 3 — array
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as unknown;

    // Shape 2 — result[0] is a RawImage
    if (isRawImageLike(first)) {
      return rawImageToBlob(first);
    }

    // Shape 3 — result[0].output is a RawImage
    if (first && typeof first === "object") {
      const output = (first as Record<string, unknown>).output;
      if (isRawImageLike(output)) {
        return rawImageToBlob(output as RawImageLike);
      }
    }

    throw new Error(
      "MODNet: unexpected array result shape. result[0] keys: " +
        Object.keys(raw[0] as object).join(", "),
    );
  }

  throw new Error(
    "MODNet: pipeline returned an unrecognised output. " +
      "Type: " +
      typeof raw +
      (Array.isArray(raw) ? `, length: ${(raw as unknown[]).length}` : ""),
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function removeBackgroundModnet(inputBlob: Blob): Promise<Blob> {
  const { pipe, task } = await getPipeline();

  if (typeof pipe !== "function") {
    throw new Error(
      `MODNet (task="${task}"): pipeline did not return a callable. Got: ${typeof pipe}`,
    );
  }

  const raw = await (pipe as (input: Blob) => Promise<unknown>)(inputBlob);

  return extractBlob(raw);
}
