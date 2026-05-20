"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type Konva from "konva";
import {
  CARD_TEMPLATE_CONFIG,
  type CardTemplateId,
} from "@/lib/cardCreator/templateConfig";
import TemplateSelector from "./TemplateSelector";
import DebugPanel from "./DebugPanel";
import type { LoadStatus } from "./CardCanvas";
import { downloadCardPng } from "@/lib/cardCreator/exportCard";
import { DEFAULT_CARD_STATE, type CreatorCardState } from "@/lib/cardCreator/creatorState";

// Dynamically import CardCanvas (Konva is browser-only)
const CardCanvas = dynamic(() => import("./CardCanvas"), { ssr: false });

const DEFAULT_TEMPLATE_ID: CardTemplateId = "gold_elite_2026";

export default function CreatorPreviewScreen() {
  const [selectedId, setSelectedId] = useState<CardTemplateId>(DEFAULT_TEMPLATE_ID);
  const [showDebugBoxes, setShowDebugBoxes] = useState(false);
  const [showDisabledTemplates, setShowDisabledTemplates] = useState(false);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>({
    background: "loading",
    overlay:    "loading",
    flag:       "loading",
  });
  const [exporting, setExporting] = useState(false);

  const stageRef      = useRef<Konva.Stage | null>(null);
  const previewScaleRef = useRef<number>(1);

  const selectedTemplate = CARD_TEMPLATE_CONFIG.templates.find(
    (t) => t.id === selectedId
  )!;

  // Build a minimal card state so the updated CardCanvas receives required props
  const cardState: CreatorCardState = {
    ...DEFAULT_CARD_STATE,
    templateId: selectedId,
  };

  const handleDownload = useCallback(async () => {
    if (!stageRef.current) return;
    setExporting(true);
    try {
      downloadCardPng(stageRef.current, previewScaleRef.current, `fangirl-fc-${selectedId}.png`);
    } finally {
      setExporting(false);
    }
  }, [selectedId]);

  const enabledCount = CARD_TEMPLATE_CONFIG.templates.filter((t) => t.enabled).length;

  return (
    <div className="min-h-screen bg-[#0b0613] text-white">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-white">Card Creator Preview</h1>
        <p className="text-xs text-white/40 mt-0.5">Render engine test — editor coming next</p>
      </div>

      {/* ── Template selector ── */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-white/40 uppercase tracking-widest">Templates</span>
          <button
            onClick={() => setShowDisabledTemplates((v) => !v)}
            className={[
              "text-[10px] px-2 py-0.5 rounded border transition-colors",
              showDisabledTemplates
                ? "border-yellow-500/60 text-yellow-400 bg-yellow-500/10"
                : "border-white/15 text-white/40 hover:border-white/30",
            ].join(" ")}
          >
            {showDisabledTemplates
              ? `Showing all (${CARD_TEMPLATE_CONFIG.templates.length})`
              : `Show disabled (${CARD_TEMPLATE_CONFIG.templates.length - enabledCount})`}
          </button>
        </div>
        <TemplateSelector
          selectedId={selectedId}
          showDisabled={showDisabledTemplates}
          onSelect={setSelectedId}
        />
      </div>

      {/* ── Card preview ── */}
      <div className="px-4 pb-4 flex justify-center">
        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <CardCanvas
            template={selectedTemplate}
            cardState={cardState}
            showDebugBoxes={showDebugBoxes}
            stageRef={stageRef}
            onLoadStatusChange={setLoadStatus}
            previewScaleRef={previewScaleRef}
          />
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-wait"
        >
          {exporting ? "Exporting…" : "⬇ Download PNG"}
        </button>

        {/* Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDebugBoxes((v) => !v)}
            className={[
              "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
              showDebugBoxes
                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8",
            ].join(" ")}
          >
            {showDebugBoxes ? "Hide debug boxes" : "Show debug boxes"}
          </button>
        </div>
      </div>

      {/* ── Load status pills ── */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {(["background", "overlay", "flag"] as const).map((k) => {
          const s = loadStatus[k];
          const color =
            s === "loaded"   ? "bg-green-500/20 text-green-300 border-green-500/30" :
            s === "failed"   ? "bg-red-500/20 text-red-300 border-red-500/30" :
            s === "fallback" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
            "bg-white/5 text-white/30 border-white/10";
          return (
            <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${color}`}>
              {k}: {s}
            </span>
          );
        })}
      </div>

      {/* ── Debug panel ── */}
      <div className="px-4 pb-8">
        <DebugPanel template={selectedTemplate} loadStatus={loadStatus} />
      </div>
    </div>
  );
}
