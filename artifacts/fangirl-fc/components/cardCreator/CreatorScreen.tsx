"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type Konva from "konva";
import { CARD_TEMPLATE_CONFIG, type CardTemplateId } from "@/lib/cardCreator/templateConfig";
import { type CreatorCardState, DEFAULT_CARD_STATE } from "@/lib/cardCreator/creatorState";
import { loadCardState, saveCardState, clearCardState } from "@/lib/cardCreator/localStorage";
import { resolveLayout, nX, nY, nW, nH, getPhotoBox } from "@/lib/cardCreator/renderUtils";
import { downloadCardPng, shareCardPng } from "@/lib/cardCreator/exportCard";
import BottomSheet from "./BottomSheet";
import PhotoEditorSheet from "./PhotoEditorSheet";
import InfoEditorSheet from "./InfoEditorSheet";
import BadgeEditorSheet from "./BadgeEditorSheet";
import StatsEditorSheet from "./StatsEditorSheet";
import EditHotspots from "./EditHotspots";
import type { LoadStatus } from "./CardCanvas";

// Konva/canvas is browser-only
const CardCanvas = dynamic(() => import("./CardCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0d0920] animate-pulse rounded-xl" />
  ),
});

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
  const [exporting,   setExporting]   = useState(false);
  const [resetPending, setResetPending] = useState(false);

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
    (src: string, naturalWidth: number, naturalHeight: number) => {
      const photoBox = getPhotoBox(layout, selectedTemplate.id);
      const pX = nX(photoBox.x);
      const pY = nY(photoBox.y);
      const pW = nW(photoBox.w);
      const pH = nH(photoBox.h);
      // Contain scale: image fits inside photo box without cropping.
      // Multiplied by 0.92 so the initial crop has a small margin —
      // prevents the photo from filling the full card on first load.
      const rawScale = Math.min(pW / naturalWidth, pH / naturalHeight) * 0.92;
      const scale    = Math.min(3, Math.max(0.2, rawScale));
      setCardState((prev) => ({
        ...prev,
        photo: { src, x: pX + pW / 2, y: pY + pH / 2, scale, rotation: 0, naturalWidth, naturalHeight },
      }));
    },
    [layout, selectedTemplate.id],
  );

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
