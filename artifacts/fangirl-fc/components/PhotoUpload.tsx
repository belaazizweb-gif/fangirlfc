"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoUpload({ value, onChange }: Props) {
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
    <div>
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
            className="h-16 w-16 rounded-full border border-white/20 object-cover"
          />
          <div className="flex-1 text-xs text-white/60">
            Stored only on your device. Never uploaded.
          </div>
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
          Add a selfie (optional, stays on your device)
        </button>
      )}
    </div>
  );
}
