"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import type Konva from "konva";
import { CARD_TEMPLATE_CONFIG, type CardTemplateId } from "@/lib/cardCreator/templateConfig";
import { type CreatorCardState, DEFAULT_CARD_STATE } from "@/lib/cardCreator/creatorState";
import { loadCardState, saveCardState, clearCardState } from "@/lib/cardCreator/localStorage";
import { resolveLayout, nX, nY, nW, nH, getPhotoBox, getCutoutBox } from "@/lib/cardCreator/renderUtils";
import { downloadCardPng, shareCardPng } from "@/lib/cardCreator/exportCard";
import BottomSheet from "./BottomSheet";
import PhotoEditorSheet from "./PhotoEditorSheet";
import InfoEditorSheet from "./InfoEditorSheet";
import BadgeEditorSheet from "./BadgeEditorSheet";
import StatsEditorSheet from "./StatsEditorSheet";
import EditHotspots from "./EditHotspots";
import type { LoadStatus } from "./CardCanvas";
import CardCanvas from "./CardCanvas";

// ── Transparent PNG detection ────────────────────────────────────────────────
//
// Loads the image into a temporary offscreen canvas and inspects the alpha
// channel. Returns true only when meaningfully transparent pixels are found.
// Any failure (bad URL, canvas unavailable, cross-origin) returns false so the
// upload flow never crashes.
async function detectMeaningfulTransparency(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.onload = () => {
        try {
          if (!img.naturalWidth || !img.naturalHeight) { resolve(false); return; }
          // Downsample to max 512px on the longest side for performance
          const maxSide = 512;
          const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
          const dw = Math.max(1, Math.round(img.naturalWidth  * scale));
          const dh = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width  = dw;
          canvas.height = dh;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(false); return; }
          ctx.drawImage(img, 0, 0, dw, dh);
          const { data } = ctx.getImageData(0, 0, dw, dh); // RGBA
          const totalPixels = dw * dh;
          let transparentCount = 0;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 250) transparentCount++;
          }
          resolve(transparentCount / totalPixels > 0.01);
        } catch {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    } catch {
      resolve(false);
    }
  });
}

// ── Background removal helpers (module-level, browser-only) ─────────────────
//
// These are plain functions — no hooks, no side-effects — so they are safe
// at module scope inside a "use client" file.

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("blobToDataUrl failed"));
    reader.readAsDataURL(blob);
  });
}

function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("loadImageDimensions failed"));
    img.src = dataUrl;
  });
}

/**
 * Downscales the image so the longest side ≤ 1600px and re-encodes as
 * image/png (preserving any alpha channel). Falls back to the original Blob
 * if the canvas operation fails.
 */
async function resizeImageForBackgroundRemoval(dataUrl: string): Promise<Blob> {
  try {
    const { width, height } = await loadImageDimensions(dataUrl);
    const MAX_SIDE = 1600;
    const longest = Math.max(width, height);
    const scale   = longest > MAX_SIDE ? MAX_SIDE / longest : 1;
    const dw = Math.max(1, Math.round(width  * scale));
    const dh = Math.max(1, Math.round(height * scale));

    return await new Promise<Blob>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = dw;
        canvas.height = dh;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("no 2d ctx")); return; }
        ctx.drawImage(img, 0, 0, dw, dh);
        // Always output image/png so any existing alpha channel is preserved
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("canvas.toBlob returned null"));
        }, "image/png");
      };
      img.onerror = () => reject(new Error("img load failed"));
      img.src = dataUrl;
    });
  } catch {
    // Safe fallback: return the original bytes as a Blob (may be JPEG, but
    // background-removal can still process it).
    return dataUrlToBlob(dataUrl);
  }
}

// CardCanvas is browser-only. CreatorScreen is already loaded with
// dynamic({ ssr: false }) from page.tsx so Konva runs only in the browser.
// Using a plain import avoids a second sequential lazy-load waterfall.

// ── Sheet type (null = no sheet open) ────────────────────────
type Sheet = "template" | "photo" | "info" | "badge" | "stats" | "save" | null;

// ── Card aspect ratio ─────────────────────────────────────────
const CARD_RATIO = 1086 / 1448; // width / height ≈ 0.75

// 152 px = top-bar (56) + bottom-bar (88) + 8 breathing room
const TOP_BOTTOM_CHROME = 152;
const H_PADDING         = 24;

function computeCardW(): number {
  if (typeof window === "undefined") return 340;
  // 86 vw — matches the spec (82–88vw) and prevents any left-side clipping.
  // Capped at 380px so the card doesn't grow too large on tablets/desktop.
  return Math.min(Math.round(window.innerWidth * 0.86), 380);
}

export default function CreatorScreen() {
  // ── State ────────────────────────────────────────────────────
  const [cardState,   setCardState]   = useState<CreatorCardState>(DEFAULT_CARD_STATE);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [exporting,    setExporting]    = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemoveError, setBgRemoveError] = useState<string | null>(null);

  // Initialised from window on first (client-only) render — no hydration mismatch
  // because page.tsx loads this component with dynamic({ ssr: false }).
  const [cardW, setCardW] = useState<number>(computeCardW);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadStatus, setLoadStatus] = useState<LoadStatus>({
    background: "loading", overlay: "loading", flag: "loading",
  });

  // ── Refs ─────────────────────────────────────────────────────
  const stageRef        = useRef<Konva.Stage | null>(null);
  const previewScaleRef = useRef<number>(1);

  // ── Keep card width in sync with resize ──────────────────────
  useEffect(() => {
    const onResize = () => setCardW(computeCardW());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Load from localStorage ───────────────────────────────────
  useEffect(() => {
    const saved = loadCardState();
    if (saved) setCardState(saved);
  }, []);

  // ── Autosave (debounced 500 ms) ──────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => saveCardState(cardState), 500);
    return () => clearTimeout(t);
  }, [cardState]);

  // ── Derived ──────────────────────────────────────────────────
  const selectedTemplate = CARD_TEMPLATE_CONFIG.templates.find(
    (t) => t.id === cardState.templateId,
  ) ?? CARD_TEMPLATE_CONFIG.templates[0];

  const layout = resolveLayout(selectedTemplate);

  const enabledTemplates = CARD_TEMPLATE_CONFIG.templates.filter((t) => t.enabled);

  // ── Handlers ─────────────────────────────────────────────────
  const handleTemplateSelect = useCallback((id: CardTemplateId) => {
    setCardState((prev) => ({ ...prev, templateId: id }));
  }, []);

  const handlePhotoDrag = useCallback((pos: { x: number; y: number }) => {
    setCardState((prev) => ({ ...prev, photo: { ...prev.photo, ...pos } }));
  }, []);

  const handlePhotoSelect = useCallback(
    async (src: string, naturalWidth: number, naturalHeight: number) => {
      // Detect PNG transparency only for PNG data URLs.
      const isPng = src.startsWith("data:image/png");
      const isCutout = isPng && await detectMeaningfulTransparency(src);

      if (isCutout) {
        // ── Mode C: transparent PNG cutout ──────────────────────────
        // Use the player-sized cutout box; Math.min so the cutout is never
        // cropped — user can zoom/drag in after upload.
        const box = getCutoutBox(layout, selectedTemplate.id);
        const cX = nX(box.x);
        const cY = nY(box.y);
        const cW = nW(box.w);
        const cH = nH(box.h);
        const rawScale = Math.min(cW / naturalWidth, cH / naturalHeight) * 0.98;
        const scale = Math.min(3, Math.max(0.1, rawScale));
        setCardState((prev) => ({
          ...prev,
          photo: {
            src,
            cutoutSrc: src,
            isCutout: true,
            cutoutSource: "manual" as const,
            x: cX + cW / 2,
            y: cY + cH / 2,
            scale,
            rotation: 0,
            naturalWidth,
            naturalHeight,
          },
        }));
      } else {
        // ── Mode B: normal opaque photo ─────────────────────────────
        // Cover scale fills the photo box edge-to-edge; ×1.02 adds bleed.
        // Stale cutoutSrc / cutoutSource must be cleared so Mode C never lingers.
        const box = getPhotoBox(layout, selectedTemplate.id);
        const pX = nX(box.x);
        const pY = nY(box.y);
        const pW = nW(box.w);
        const pH = nH(box.h);
        const rawScale = Math.max(pW / naturalWidth, pH / naturalHeight) * 1.02;
        const scale = Math.min(3, Math.max(0.2, rawScale));
        setCardState((prev) => ({
          ...prev,
          photo: {
            src,
            cutoutSrc: null,
            isCutout: false,
            cutoutSource: undefined,
            x: pX + pW / 2,
            y: pY + pH / 2,
            scale,
            rotation: 0,
            naturalWidth,
            naturalHeight,
          },
        }));
      }
    },
    [layout, selectedTemplate.id],
  );

  // ── AI Background Removal ─────────────────────────────────────
  const handleRemoveBackground = useCallback(async () => {
    const originalSrc = cardState.photo.src;
    if (!originalSrc || isRemovingBg) return;

    // ── Engine selector (localStorage flag — for internal testing only) ──────
    // Default: "imgly" (@imgly/background-removal, AGPL-3.0, current production engine).
    // Set localStorage.setItem("fangirl_bg_engine", "modnet") + reload to test MODNet.
    const BG_REMOVER_ENGINE =
      typeof window !== "undefined" &&
      window.localStorage.getItem("fangirl_bg_engine") === "modnet"
        ? "modnet"
        : "imgly";

    setBgRemoveError(null);
    setIsRemovingBg(true);

    try {
      const inputBlob = await resizeImageForBackgroundRemoval(originalSrc);

      let outputBlob: Blob;
      if (BG_REMOVER_ENGINE === "modnet") {
        const { removeBackgroundModnet } = await import(
          "@/lib/cardCreator/removeBackgroundModnet"
        );
        outputBlob = await removeBackgroundModnet(inputBlob);
      } else {
        // Default production engine — @imgly/background-removal (AGPL-3.0).
        // TODO: Remove once MODNet is validated and set as default.
        const { removeBackground } = await import("@imgly/background-removal");
        outputBlob = await removeBackground(inputBlob);
      }

      const cutoutDataUrl = await blobToDataUrl(outputBlob);
      const { width: cutoutWidth, height: cutoutHeight } = await loadImageDimensions(cutoutDataUrl);

      // Fit cutout into the player zone using contain (Math.min) so it never
      // gets cropped on initial placement — user can zoom/drag after.
      const box  = getCutoutBox(layout, selectedTemplate.id);
      const cX   = nX(box.x);
      const cY   = nY(box.y);
      const cW   = nW(box.w);
      const cH   = nH(box.h);
      const rawScale = Math.min(cW / cutoutWidth, cH / cutoutHeight) * 0.98;
      const scale    = Math.min(3, Math.max(0.1, rawScale));

      // CardCanvas derives offsetX = naturalWidth / 2, offsetY = naturalHeight / 2
      // from the loaded image's natural dimensions on every render.
      // Setting naturalWidth/naturalHeight to the cutout's dimensions here ensures
      // the pivot is always correct for drag / zoom / rotate.
      setCardState((prev) => ({
        ...prev,
        photo: {
          ...prev.photo,
          src:          originalSrc,   // original src preserved as fallback
          cutoutSrc:    cutoutDataUrl,
          isCutout:     true,
          cutoutSource: "ai" as const,
          naturalWidth:  cutoutWidth,
          naturalHeight: cutoutHeight,
          x:       cX + cW / 2,
          y:       cY + cH / 2,
          scale,
          rotation: 0,
        },
      }));
    } catch {
      setBgRemoveError(
        "Background removal failed. You can keep the original photo or try another image.",
      );
      // Photo state is NOT touched on failure — original photo remains visible.
    } finally {
      setIsRemovingBg(false);
    }
  }, [cardState.photo.src, isRemovingBg, layout, selectedTemplate.id]);

  const handleResetConfirm = useCallback(() => {
    clearCardState();
    setCardState(DEFAULT_CARD_STATE);
    setResetPending(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      downloadCardPng(
        stageRef.current,
        previewScaleRef.current,
        `fangirl-fc-player-card-${cardState.templateId}.png`,
      );
    } finally {
      setExporting(false);
    }
  }, [cardState.templateId]);

  const handleShare = useCallback(async () => {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      await shareCardPng(stageRef.current, previewScaleRef.current, cardState.templateId);
    } finally {
      setExporting(false);
    }
  }, [cardState.templateId]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="h-full bg-[#0b0613] text-white flex flex-col overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-white/6">
        {/* Left — reset control */}
        {resetPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetPending(false)}
              className="text-xs text-white/50 px-2.5 py-1.5 rounded-lg border border-white/12 hover:bg-white/6 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleResetConfirm}
              className="text-xs text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/40 hover:bg-red-500/10 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetPending(true)}
            aria-label="Réinitialiser la carte"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors text-lg"
          >
            ↺
          </button>
        )}

        {/* Centre — title */}
        <h1 className="text-sm font-bold tracking-wide select-none">
          Créateur de cartes FC
        </h1>

        {/* Right — language indicator */}
        <span className="text-[11px] font-semibold text-white/40 bg-white/8 px-2 py-1 rounded-md tracking-wider select-none">
          FR
        </span>
      </div>

      {/* ── Card area (flex-1, fills remaining space) ──────────── */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {/*
          cardW is computed from window.innerWidth on first client render
          (page.tsx wraps this component with dynamic({ ssr: false }) so
          window is always available — no hydration mismatch possible).
        */}
        <div
          className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/70"
          style={{
            width:  cardW,
            height: Math.round(cardW / CARD_RATIO),
          }}
        >
          {/* Konva canvas — displayWidth bypasses the ResizeObserver race so
              the stage is sized correctly on the first render frame.          */}
          <CardCanvas
            template={selectedTemplate}
            cardState={cardState}
            showDebugBoxes={false}
            stageRef={stageRef}
            onLoadStatusChange={setLoadStatus}
            previewScaleRef={previewScaleRef}
            onPhotoDrag={handlePhotoDrag}
            displayWidth={cardW}
          />

          {/* DOM hotspot overlay — NOT exported (pure DOM, outside Konva stage) */}
          <EditHotspots
            layout={layout}
            onEdit={(sheet) => setActiveSheet(sheet)}
          />
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-3 pb-6 flex gap-3">
        {/* Carte — opens template selector */}
        <button
          onClick={() => setActiveSheet("template")}
          className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all border border-white/15 font-bold text-sm flex items-center justify-center gap-2"
        >
          <span className="text-base">🃏</span>
          <span>Carte</span>
        </button>

        {/* Sauvegarder — opens save/export sheet */}
        <button
          onClick={() => setActiveSheet("save")}
          disabled={exporting}
          className="flex-1 py-4 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
          {exporting ? (
            <span className="animate-pulse text-sm">Export…</span>
          ) : (
            <>
              <span className="text-base">⬇</span>
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM SHEETS — only the open one is in the DOM
      ═══════════════════════════════════════════════════════ */}

      {/* Template / Carte sheet */}
      <BottomSheet
        isOpen={activeSheet === "template"}
        onClose={() => setActiveSheet(null)}
        title="Choisir un modèle"
      >
        <div className="grid grid-cols-3 gap-3 pb-2">
          {enabledTemplates.map((t) => {
            const isActive = t.id === cardState.templateId;
            return (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className={[
                  "flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all active:scale-95",
                  isActive
                    ? "border-pink-500/70 bg-pink-500/10"
                    : "border-white/10 hover:border-white/25 bg-white/5",
                ].join(" ")}
              >
                <div
                  className={[
                    "relative w-full aspect-[1086/1448] rounded-xl overflow-hidden bg-[#1a0d2e]",
                    isActive ? "ring-2 ring-pink-500" : "",
                  ].join(" ")}
                >
                  <Image
                    src={t.assets.thumbnail}
                    alt={t.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                    unoptimized
                    loading="lazy"
                  />
                </div>
                <span
                  className={[
                    "text-[10px] text-center leading-tight font-medium",
                    isActive ? "text-pink-400" : "text-white/60",
                  ].join(" ")}
                >
                  {t.name.replace(" 2026", "")}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setActiveSheet(null)}
          className="w-full py-3.5 mt-2 rounded-xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-bold text-sm"
        >
          Confirmer
        </button>
      </BottomSheet>

      {/* Photo sheet */}
      <BottomSheet
        isOpen={activeSheet === "photo"}
        onClose={() => setActiveSheet(null)}
        title="Photo du joueur"
      >
        <PhotoEditorSheet
          photo={cardState.photo}
          onChange={(photo) => setCardState((prev) => ({ ...prev, photo }))}
          onPhotoSelect={handlePhotoSelect}
          template={selectedTemplate}
          onRemoveBackground={handleRemoveBackground}
          isRemovingBg={isRemovingBg}
          bgRemoveError={bgRemoveError}
        />
      </BottomSheet>

      {/* Info sheet */}
      <BottomSheet
        isOpen={activeSheet === "info"}
        onClose={() => setActiveSheet(null)}
        title="Informations joueur"
      >
        <InfoEditorSheet
          player={cardState.player}
          onChange={(player) => setCardState((prev) => ({ ...prev, player }))}
        />
      </BottomSheet>

      {/* Badge sheet */}
      <BottomSheet
        isOpen={activeSheet === "badge"}
        onClose={() => setActiveSheet(null)}
        title="Badge"
      >
        <BadgeEditorSheet
          badge={cardState.badge}
          onChange={(badge) => setCardState((prev) => ({ ...prev, badge }))}
        />
      </BottomSheet>

      {/* Stats sheet */}
      <BottomSheet
        isOpen={activeSheet === "stats"}
        onClose={() => setActiveSheet(null)}
        title="Statistiques"
      >
        <StatsEditorSheet
          stats={cardState.stats}
          onChange={(stats) => setCardState((prev) => ({ ...prev, stats }))}
        />
      </BottomSheet>

      {/* Save / Export sheet */}
      <BottomSheet
        isOpen={activeSheet === "save"}
        onClose={() => setActiveSheet(null)}
        title="Sauvegarder la carte"
      >
        <div className="space-y-4 pb-2">
          <p className="text-sm text-white/50 text-center">
            Téléchargez votre carte en PNG haute résolution
          </p>
          <button
            onClick={() => { void handleDownload(); setActiveSheet(null); }}
            className="w-full py-4 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-bold flex items-center justify-center gap-3"
          >
            <span className="text-xl">⬇</span>
            <span>Télécharger PNG</span>
          </button>
          <button
            onClick={() => { void handleShare(); setActiveSheet(null); }}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all font-bold border border-white/15 flex items-center justify-center gap-3"
          >
            <span className="text-xl">↑</span>
            <span>Partager la carte</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
