/**
 * MODNet background removal helper.
 *
 * Uses @huggingface/transformers (Apache-2.0) + Xenova/modnet.
 * Runs entirely client-side — no server, no API, no upload.
 *
 * Exported contract:
 *   removeBackgroundModnet(inputBlob: Blob): Promise<Blob>
 *
 * Used as an optional alternative engine in CreatorScreen.tsx.
 * Default production engine remains @imgly/background-removal.
 * This module is only loaded when the localStorage flag is set:
 *   localStorage.setItem("fangirl_bg_engine", "modnet")
 *
 * First MODNet load may take 30–60 seconds depending on network/device
 * because the model is downloaded by Transformers.js.
 * Treat only explicit errors as failures — a long first load is NOT a failure.
 */

// ── Task fallback order ────────────────────────────────────────────────────────
//
// "background-removal" is the canonical Transformers.js task for MODNet, but
// some builds or versions surface it under "image-segmentation" instead.
// We try both in order so the helper works across Transformers.js versions.

const MODNET_TASKS = ["background-removal", "image-segmentation"] as const;
type ModnetTask = (typeof MODNET_TASKS)[number];

// ── Lazy singleton ─────────────────────────────────────────────────────────────
//
// The pipeline is expensive to initialise (model download + ONNX setup).
// We create it once and reuse the same instances on every subsequent call.
// Typed as `unknown` because @huggingface/transformers types are resolved at
// runtime; all shape validation is performed explicitly below.

interface PipelineSingleton {
  pipe: unknown;
  task: ModnetTask;
}

let singletonPromise: Promise<PipelineSingleton> | null = null;

async function getPipeline(): Promise<PipelineSingleton> {
  if (!singletonPromise) {
    singletonPromise = (async () => {
      // Dynamic import keeps transformers out of the initial JS bundle.
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

      // Both tasks failed — surface both error messages.
      throw new Error(
        `MODNet: failed to initialise pipeline with any supported task.\n` +
          errors.map((e) => `  • ${e}`).join("\n"),
      );
    })();
  }
  return singletonPromise;
}

// ── Result → Blob extraction ───────────────────────────────────────────────────
//
// Transformers.js output shapes vary by task and version.
// We support the three shapes observed in practice:
//
//   Case A — result is Array and result[0].output has toBlob()
//             { pipeline result: [{ output: RawImage }] }
//
//   Case B — result is Array and result[0] itself has toBlob()
//             { pipeline result: [RawImage] }
//
//   Case C — result is a non-array object that directly has toBlob()
//             { pipeline result: RawImage }

type MaybeBlobSource = { toBlob?: () => Promise<unknown> };

async function extractBlob(raw: unknown): Promise<Blob> {
  // Case A: Array where result[0].output is the image
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as Record<string, unknown>;

    // Case A — result[0].output.toBlob()
    if (first && typeof first === "object" && "output" in first) {
      const output = first.output as MaybeBlobSource;
      if (typeof output?.toBlob === "function") {
        const blob = await output.toBlob();
        if (blob instanceof Blob) return blob;
        throw new Error("MODNet output did not produce a Blob (Case A)");
      }
    }

    // Case B — result[0].toBlob()
    const asSource = raw[0] as MaybeBlobSource;
    if (typeof asSource?.toBlob === "function") {
      const blob = await asSource.toBlob();
      if (blob instanceof Blob) return blob;
      throw new Error("MODNet output did not produce a Blob (Case B)");
    }

    throw new Error(
      "MODNet: unexpected array result shape. " +
        "result[0] keys: " +
        Object.keys(raw[0] as object).join(", "),
    );
  }

  // Case C — result directly has toBlob()
  const asSource = raw as MaybeBlobSource;
  if (raw && typeof raw === "object" && typeof asSource.toBlob === "function") {
    const blob = await asSource.toBlob();
    if (blob instanceof Blob) return blob;
    throw new Error("MODNet output did not produce a Blob (Case C)");
  }

  throw new Error(
    "MODNet: pipeline returned an unrecognised output shape. " +
      "Type: " +
      typeof raw +
      (Array.isArray(raw)
        ? `, length: ${(raw as unknown[]).length}`
        : ""),
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
