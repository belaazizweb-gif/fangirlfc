"use client";

import { useRef } from "react";
import { Camera, X, Maximize2, User, Square } from "lucide-react";
import type { SelfieFit } from "@/types";
import { cn } from "@/lib/cn";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  fit: SelfieFit;
  onFitChange: (f: SelfieFit) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
}

const FIT_OPTIONS: { id: SelfieFit; label: string; icon: typeof User; help: string }[] = [
  { id: "fit", label: "Fit", icon: Maximize2, help: "Full outfit, no crop" },
  { id: "portrait", label: "Portrait", icon: User, help: "Face-friendly crop" },
  { id: "fill", label: "Fill", icon: Square, help: "Edge-to-edge" },
];

export function PhotoUpload({
  value,
  onChange,
  fit,
  onFitChange,
  zoom,
  onZoomChange,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
          />
          <div className="flex-1 text-xs text-white/60">
            Stored only on your device. Never uploaded.
          </div>
          <button
            onClick={() => ref.current?.click()}
            className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/80 hover:bg-white/20"
          >
            Change
          </button>
          <button
            onClick={() => onChange(null)}
            className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm text-white/70 hover:bg-white/10"
        >
          <Camera className="h-4 w-4" />
          Add a selfie · close-up, outfit, or matchday photo
        </button>
      )}

      {value && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Adjust your photo
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {FIT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = fit === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onFitChange(opt.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition",
                    active
                      ? "border-pink-300 bg-pink-300/15 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                  aria-pressed={active}
                  title={opt.help}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label
              htmlFor="zoom-slider"
              className="text-[11px] font-bold uppercase tracking-wider text-white/60"
            >
              Zoom
            </label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="flex-1 accent-pink-400"
            />
            <span className="w-10 text-right text-[11px] font-bold text-white/70">
              {zoom.toFixed(2)}x
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-white/45">
            Photo never leaves your device. Image is never distorted.
          </p>
        </div>
      )}
    </div>
  );
}
