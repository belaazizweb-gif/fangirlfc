"use client";

import { useState } from "react";
import type { CreatorPlayerState } from "@/lib/cardCreator/creatorState";
import { POSITIONS } from "@/lib/cardCreator/positions";
import { COUNTRIES } from "@/lib/cardCreator/countries";

interface Props {
  player: CreatorPlayerState;
  onChange: (player: CreatorPlayerState) => void;
}

export default function InfoEditorSheet({ player, onChange }: Props) {
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const clampRating = (v: number) => Math.min(99, Math.max(1, v));

  return (
    <div className="space-y-6 pb-2">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Player Name</label>
        <input
          type="text"
          maxLength={18}
          value={player.name}
          onChange={(e) => onChange({ ...player, name: e.target.value.toUpperCase() })}
          placeholder="PLAYER NAME"
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white font-bold tracking-wider placeholder:text-white/25 focus:outline-none focus:border-pink-500/60 transition-colors"
        />
        <p className="text-[10px] text-white/30 mt-1 text-right">{player.name.length}/18</p>
      </div>

      {/* Rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/80">Rating</label>
          <input
            type="number"
            min={1} max={99}
            value={player.rating}
            onChange={(e) => onChange({ ...player, rating: clampRating(parseInt(e.target.value) || 1) })}
            className="w-16 bg-white/8 border border-white/15 rounded-lg px-2 py-1 text-white font-bold text-center text-lg focus:outline-none focus:border-pink-500/60"
          />
        </div>
        <input
          type="range"
          min={1} max={99} step={1}
          value={player.rating}
          onChange={(e) => onChange({ ...player, rating: parseInt(e.target.value) })}
          className="w-full h-2 accent-pink-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>1</span><span>99</span>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-3">Position</label>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => onChange({ ...player, position: pos })}
              className={[
                "px-3 py-1.5 rounded-lg text-sm font-bold transition-all",
                player.position === pos
                  ? "bg-pink-600 text-white"
                  : "bg-white/8 text-white/60 hover:bg-white/15 border border-white/10",
              ].join(" ")}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
        <input
          type="text"
          placeholder="Search country…"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-pink-500/60 transition-colors mb-3"
        />
        <div className="max-h-48 overflow-y-auto space-y-1 overscroll-contain">
          {filteredCountries.map((c) => (
            <button
              key={c.code}
              onClick={() =>
                onChange({ ...player, countryCode: c.code, flagPath: c.flag })
              }
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                player.countryCode === c.code
                  ? "bg-pink-600/30 border border-pink-500/40 text-white"
                  : "bg-white/5 hover:bg-white/10 text-white/70",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.flag}
                alt={c.code}
                width={24}
                height={16}
                className="rounded-sm object-cover shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="font-medium">{c.name}</span>
              <span className="ml-auto text-xs text-white/40">{c.code}</span>
              {player.countryCode === c.code && (
                <span className="text-pink-400 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
