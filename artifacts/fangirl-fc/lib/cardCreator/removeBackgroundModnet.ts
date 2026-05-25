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
 */

// ── Lazy singleton ────────────────────────────────────────────────────────────
//
// The pipeline is expensive to initialise (model download + ONNX/WebGPU setup).
// We create it once and reuse the same Promise on every subsequent call.
// Typed as `unknown` here because @huggingface/transformers types are only
// available after install; the runtime result is validated strictly below.

let pipelinePromise: Promise<unknown> | null = null;

async function getPipeline(): Promise<unknown> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      // Dynamic import keeps this module out of the initial JS bundle.
      const { pipeline } = await import("@huggingface/transformers");
      return pipeline("background-removal", "Xenova/modnet");
    })();
  }
  return pipelinePromise;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function removeBackgroundModnet(inputBlob: Blob): Promise<Blob> {
  const remover = await getPipeline();

  if (typeof remover !== "function") {
    throw new Error(
      "MODNet: pipeline() did not return a callable. Got: " + typeof remover,
    );
  }

  // Pass the Blob directly — Transformers.js accepts Blob, URL, or ImageData.
  const results = await (remover as (input: Blob) => Promise<unknown[]>)(inputBlob);

  // Validate result shape strictly.
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(
      "MODNet: expected non-empty array from pipeline. Got: " +
        JSON.stringify(results),
    );
  }

  const first = results[0] as Record<string, unknown>;

  if (
    !first ||
    typeof first !== "object" ||
    !("output" in first) ||
    first.output == null
  ) {
    throw new Error(
      "MODNet: result[0].output is missing or null. Got keys: " +
        Object.keys(first ?? {}).join(", "),
    );
  }

  const output = first.output as { toBlob?: () => Promise<Blob> };

  if (typeof output.toBlob !== "function") {
    throw new Error(
      "MODNet: result[0].output.toBlob is not a function. " +
        "Available keys: " +
        Object.keys(output).join(", "),
    );
  }

  const resultBlob = await output.toBlob();

  if (!(resultBlob instanceof Blob)) {
    throw new Error(
      "MODNet: toBlob() did not return a Blob. Got: " + typeof resultBlob,
    );
  }

  return resultBlob;
}
