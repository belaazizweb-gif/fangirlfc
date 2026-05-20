"use client";

import { useRef } from "react";
import type { CreatorPhotoState } from "@/lib/cardCreator/creatorState";
import type { CardTemplateDefinition } from "@/lib/cardCreator/templateConfig";
import { resolveLayout, nX, nY, nW, nH } from "@/lib/cardCreator/renderUtils";

interface Props {
  photo: CreatorPhotoState;
  onChange: (photo: CreatorPhotoState) => void;
  onPhotoSelect: (src: string, naturalWidth: number, naturalHeight: number) => void;
  template: CardTemplateDefinition;
}

export default function PhotoEditorSheet({ photo, onChange, onPhotoSelect, template }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => onPhotoSelect(src, img.naturalWidth, img.naturalHeight);
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetPosition = () => {
    if (!photo.src || photo.naturalWidth === 0 || photo.naturalHeight === 0) return;
    const layout = resolveLayout(template);
    const pX = nX(layout.photo.x);
    const pY = nY(layout.photo.y);
    const pW = nW(layout.photo.w);
    const pH = nH(layout.photo.h);
    const rawScale = Math.max(pW / photo.naturalWidth, pH / photo.naturalHeight);
    const scale = Math.min(3, Math.max(0.5, rawScale));
    onChange({ ...photo, x: pX + pW / 2, y: pY + pH / 2, scale, rotation: 0 });
  };

  return (
    <div className="space-y-5 pb-2">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload / Replace */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-semibold text-sm"
      >
        {photo.src ? "📷 Replace Photo" : "📷 Upload Photo"}
      </button>

      {photo.src && (
        <>
          {/* Drag hint */}
          <p className="text-xs text-white/40 text-center -mt-2">
            Drag the photo directly on the card to reposition it
          </p>

          {/* Zoom slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/80">Zoom</label>
              <span className="text-sm font-mono text-pink-400">{photo.scale.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min={0.5} max={3} step={0.01}
              value={photo.scale}
              onChange={(e) => onChange({ ...photo, scale: parseFloat(e.target.value) })}
              className="w-full h-2 accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
              <span>0.5×</span><span>3×</span>
            </div>
          </div>

          {/* Rotate slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/80">Rotate</label>
              <span className="text-sm font-mono text-pink-400">{photo.rotation.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min={-15} max={15} step={0.5}
              value={photo.rotation}
              onChange={(e) => onChange({ ...photo, rotation: parseFloat(e.target.value) })}
              className="w-full h-2 accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
              <span>-15°</span><span>+15°</span>
            </div>
          </div>

          {/* Reset / Remove */}
          <div className="flex gap-3">
            <button
              onClick={handleResetPosition}
              className="flex-1 py-3 rounded-xl bg-white/8 hover:bg-white/12 active:scale-95 transition-all text-sm text-white/70 font-medium"
            >
              Reset Position
            </button>
            <button
              onClick={() =>
                onChange({ src: null, x: 0, y: 0, scale: 1, rotation: 0, naturalWidth: 0, naturalHeight: 0 })
              }
              className="flex-1 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 active:scale-95 transition-all text-sm text-red-400 font-medium"
            >
              Remove Photo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
