"use client";

import type { StatKey } from "@/lib/cardCreator/renderUtils";

const STAT_KEYS: StatKey[] = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];

const PRESETS: Record<string, Record<StatKey, number>> = {
  Attacker:   { PAC: 90, SHO: 88, PAS: 75, DRI: 85, DEF: 35, PHY: 72 },
  Midfielder: { PAC: 78, SHO: 70, PAS: 88, DRI: 82, DEF: 65, PHY: 74 },
  Defender:   { PAC: 70, SHO: 45, PAS: 68, DRI: 60, DEF: 88, PHY: 82 },
};

interface Props {
  stats: Record<StatKey, number>;
  onChange: (stats: Record<StatKey, number>) => void;
}

function clamp(v: number) { return Math.min(99, Math.max(1, v)); }

export default function StatsEditorSheet({ stats, onChange }: Props) {
  const setStat = (key: StatKey, value: number) =>
    onChange({ ...stats, [key]: clamp(value) });

  const randomize = () => {
    const rand = () => Math.floor(Math.random() * 59) + 40; // 40–98
    onChange({ PAC: rand(), SHO: rand(), PAS: rand(), DRI: rand(), DEF: rand(), PHY: rand() });
  };

  return (
    <div className="space-y-5 pb-2">
      {/* Preset buttons */}
      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Presets</p>
        <div className="flex gap-2">
          {Object.keys(PRESETS).map((label) => (
            <button
              key={label}
              onClick={() => onChange(PRESETS[label])}
              className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 text-xs font-semibold text-white/70 active:scale-95 transition-all"
            >
              {label}
            </button>
          ))}
          <button
            onClick={randomize}
            className="flex-1 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-semibold text-purple-300 active:scale-95 transition-all"
          >
            🎲 Random
          </button>
        </div>
      </div>

      {/* Stat sliders */}
      <div className="space-y-4">
        {STAT_KEYS.map((key) => (
          <div key={key}>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xs font-bold text-white/60 w-8 shrink-0">{key}</span>
              <input
                type="range"
                min={1} max={99} step={1}
                value={stats[key]}
                onChange={(e) => setStat(key, parseInt(e.target.value))}
                className="flex-1 h-2 accent-pink-500 cursor-pointer"
              />
              <input
                type="number"
                min={1} max={99}
                value={stats[key]}
                onChange={(e) => setStat(key, parseInt(e.target.value) || 1)}
                className="w-12 bg-white/8 border border-white/15 rounded-lg text-center text-sm font-bold text-white focus:outline-none focus:border-pink-500/60 py-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
