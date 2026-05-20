"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type Konva from "konva";
import { CARD_TEMPLATE_CONFIG, type CardTemplateId } from "@/lib/cardCreator/templateConfig";
import { type CreatorCardState, DEFAULT_CARD_STATE } from "@/lib/cardCreator/creatorState";
import { loadCardState, saveCardState, clearCardState } from "@/lib/cardCreator/localStorage";
import { resolveLayout, nX, nY, nW, nH } from "@/lib/cardCreator/renderUtils";
import { downloadCardPng, shareCardPng } from "@/lib/cardCreator/exportCard";
import BottomSheet from "./BottomSheet";
import PhotoEditorSheet from "./PhotoEditorSheet";
import InfoEditorSheet from "./InfoEditorSheet";
import BadgeEditorSheet from "./BadgeEditorSheet";
import StatsEditorSheet from "./StatsEditorSheet";
import ExportActions from "./ExportActions";
import DebugPanel from "./DebugPanel";
import type { LoadStatus } from "./CardCanvas";

const CardCanvas = dynamic(() => import("./CardCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[1086/1448] bg-[#0d0920] animate-pulse rounded-2xl" />
  ),
});

type Sheet = "template" | "photo" | "info" | "badge" | "stats" | null;

const ACTION_BUTTONS: Array<{ key: Exclude<Sheet, null>; icon: string; label: string }> = [
  { key: "template", icon: "🎨", label: "Template" },
  { key: "photo",    icon: "📸", label: "Photo"    },
  { key: "info",     icon: "✏️",  label: "Info"     },
  { key: "badge",    icon: "🏆", label: "Badge"    },
  { key: "stats",    icon: "📊", label: "Stats"    },
];

export default function CreatorScreen() {
  const [cardState,      setCardState]      = useState<CreatorCardState>(DEFAULT_CARD_STATE);
  const [activeSheet,    setActiveSheet]    = useState<Sheet>(null);
  const [showDebugBoxes, setShowDebugBoxes] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [loadStatus,     setLoadStatus]     = useState<LoadStatus>({
    background: "loading", overlay: "loading", flag: "loading",
  });
  const [exporting, setExporting] = useState(false);

  const stageRef       = useRef<Konva.Stage | null>(null);
  const previewScaleRef = useRef<number>(1);

  // ── Load from localStorage on first mount ───────────────────
  useEffect(() => {
    const saved = loadCardState();
    if (saved) setCardState(saved);
  }, []);

  // ── Autosave — debounced 500 ms after last change ───────────
  useEffect(() => {
    const timer = setTimeout(() => saveCardState(cardState), 500);
    return () => clearTimeout(timer);
  }, [cardState]);

  // ── Derived ─────────────────────────────────────────────────
  const selectedTemplate = CARD_TEMPLATE_CONFIG.templates.find(
    (t) => t.id === cardState.templateId,
  ) ?? CARD_TEMPLATE_CONFIG.templates[0];

  // ── Handlers ────────────────────────────────────────────────
  const handleTemplateSelect = useCallback((id: CardTemplateId) => {
    setCardState((prev) => ({ ...prev, templateId: id }));
  }, []);

  const handlePhotoDrag = useCallback((pos: { x: number; y: number }) => {
    setCardState((prev) => ({
      ...prev,
      photo: { ...prev.photo, ...pos },
    }));
  }, []);

  /**
   * Called when a new photo file is selected.
   * Computes a "cover" initial scale and centres the photo inside the zone.
   */
  const handlePhotoSelect = useCallback(
    (src: string, naturalWidth: number, naturalHeight: number) => {
      const layout = resolveLayout(selectedTemplate);
      const pX = nX(layout.photo.x);
      const pY = nY(layout.photo.y);
      const pW = nW(layout.photo.w);
      const pH = nH(layout.photo.h);
      // Cover-fit scale, clamped to the slider range (0.5 – 3)
      const rawScale = Math.max(pW / naturalWidth, pH / naturalHeight);
      const scale = Math.min(3, Math.max(0.5, rawScale));
      setCardState((prev) => ({
        ...prev,
        photo: {
          src,
          x: pX + pW / 2,
          y: pY + pH / 2,
          scale,
          rotation: 0,
          naturalWidth,
          naturalHeight,
        },
      }));
    },
    [selectedTemplate],
  );

  const [resetPending, setResetPending] = useState(false);

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

  const enabledTemplates = CARD_TEMPLATE_CONFIG.templates.filter((t) => t.enabled);

  return (
    <div className="min-h-screen bg-[#0b0613] text-white flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold leading-tight">Card Creator</h1>
          <p className="text-xs text-white/40">Create your football player card</p>
        </div>
        {resetPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetPending(false)}
              className="text-xs text-white/50 border border-white/12 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/8"
            >
              Cancel
            </button>
            <button
              onClick={handleResetConfirm}
              className="text-xs text-red-400 border border-red-500/40 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-red-500/15"
            >
              Confirm Reset
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetPending(true)}
            className="text-xs text-white/40 hover:text-red-400 border border-white/12 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Card preview ────────────────────────────────────── */}
      <div className="shrink-0 flex justify-center px-4 py-2">
        <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
          <CardCanvas
            template={selectedTemplate}
            cardState={cardState}
            showDebugBoxes={showDebugBoxes}
            stageRef={stageRef}
            onLoadStatusChange={setLoadStatus}
            previewScaleRef={previewScaleRef}
            onPhotoDrag={handlePhotoDrag}
          />
        </div>
      </div>

      {/* ── Action row ──────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-3">
        <div className="grid grid-cols-5 gap-2">
          {ACTION_BUTTONS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSheet(key)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-white/6 hover:bg-white/10 active:scale-95 transition-all border border-white/10"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] text-white/60 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Export row ──────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-3">
        <ExportActions
          exporting={exporting}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>

      {/* ── Debug toggle (subtle) ───────────────────────────── */}
      <div className="shrink-0 px-4 pb-5 flex gap-2">
        <button
          onClick={() => setShowDebugPanel((v) => !v)}
          className="text-[10px] text-white/20 hover:text-white/40 border border-white/8 px-3 py-1.5 rounded-lg transition-colors"
        >
          {showDebugPanel ? "Hide debug" : "Debug"}
        </button>
        {showDebugPanel && (
          <button
            onClick={() => setShowDebugBoxes((v) => !v)}
            className={[
              "text-[10px] border px-3 py-1.5 rounded-lg transition-colors",
              showDebugBoxes
                ? "text-cyan-400 border-cyan-500/40 bg-cyan-500/10"
                : "text-white/20 border-white/8 hover:text-white/40",
            ].join(" ")}
          >
            {showDebugBoxes ? "Hide boxes" : "Boxes"}
          </button>
        )}
      </div>

      {showDebugPanel && (
        <div className="px-4 pb-6">
          <DebugPanel template={selectedTemplate} loadStatus={loadStatus} />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          BOTTOM SHEETS
      ═══════════════════════════════════════════════════ */}

      {/* Template sheet */}
      <BottomSheet
        isOpen={activeSheet === "template"}
        onClose={() => setActiveSheet(null)}
        title="Choose Template"
      >
        <div className="grid grid-cols-3 gap-3 pb-2">
          {enabledTemplates.map((t) => {
            const isActive = t.id === cardState.templateId;
            return (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className={[
                  "flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all",
                  isActive
                    ? "border-pink-500/70 bg-pink-500/10"
                    : "border-white/10 hover:border-white/25 bg-white/5",
                ].join(" ")}
              >
                <div className={`relative w-full aspect-[1086/1448] rounded-xl overflow-hidden ${isActive ? "ring-2 ring-pink-500" : ""}`}>
                  <Image
                    src={t.assets.thumbnail}
                    alt={t.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className={`text-[10px] text-center leading-tight font-medium ${isActive ? "text-pink-400" : "text-white/60"}`}>
                  {t.name.replace(" 2026", "")}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setActiveSheet(null)}
          className="w-full py-3.5 mt-2 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-sm"
        >
          Done
        </button>
      </BottomSheet>

      {/* Photo sheet */}
      <BottomSheet
        isOpen={activeSheet === "photo"}
        onClose={() => setActiveSheet(null)}
        title="Player Photo"
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
        title="Player Info"
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
        title="Player Stats"
      >
        <StatsEditorSheet
          stats={cardState.stats}
          onChange={(stats) => setCardState((prev) => ({ ...prev, stats }))}
        />
      </BottomSheet>
    </div>
  );
}
