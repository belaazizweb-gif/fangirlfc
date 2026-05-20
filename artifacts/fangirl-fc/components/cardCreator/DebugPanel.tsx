"use client";

import type { CardTemplateDefinition } from "@/lib/cardCreator/templateConfig";

interface LoadStatus {
  background: string;
  overlay: string;
  flag: string;
}

interface DebugPanelProps {
  template: CardTemplateDefinition;
  loadStatus: LoadStatus;
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "loaded"
      ? "text-green-400"
      : status === "failed"
        ? "text-red-400"
        : status === "fallback"
          ? "text-yellow-400"
          : "text-zinc-400";
  return <span className={`font-mono ${color}`}>{status}</span>;
}

export default function DebugPanel({ template, loadStatus }: DebugPanelProps) {
  const rows: [string, string | boolean][] = [
    ["template id", template.id],
    ["template name", template.name],
    ["enabled", template.enabled],
    ["category", template.category],
    ["family", template.family],
    ["layoutId", template.layoutId],
    ["canvas", "1086 × 1448"],
    ["background path", template.assets.background],
    ["overlay path", template.assets.overlay],
    ["thumbnail path", template.assets.thumbnail],
    ["background loaded", loadStatus.background],
    ["overlay loaded", loadStatus.overlay],
    ["flag loaded", loadStatus.flag],
  ];

  return (
    <div className="w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur p-4 text-xs font-mono space-y-1">
      <p className="text-white/60 font-semibold text-[11px] uppercase tracking-widest mb-2">
        Debug Panel
      </p>

      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-2 items-start">
          <span className="text-white/40 w-36 shrink-0">{label}</span>
          {typeof value === "boolean" ? (
            <span className={value ? "text-green-400" : "text-red-400"}>
              {value ? "true" : "false"}
            </span>
          ) : label.endsWith("loaded") ? (
            <StatusBadge status={value} />
          ) : (
            <span className="text-white/80 break-all">{value}</span>
          )}
        </div>
      ))}

      <p className="mt-3 pt-2 border-t border-white/10 text-yellow-400/80">
        ⚠ Visual validation required for photo transparency.
      </p>
    </div>
  );
}
