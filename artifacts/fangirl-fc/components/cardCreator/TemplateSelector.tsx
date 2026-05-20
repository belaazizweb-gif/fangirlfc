"use client";

import Image from "next/image";
import { CARD_TEMPLATE_CONFIG, type CardTemplateId } from "@/lib/cardCreator/templateConfig";

interface TemplateSelectorProps {
  selectedId: CardTemplateId;
  showDisabled: boolean;
  onSelect: (id: CardTemplateId) => void;
}

export default function TemplateSelector({
  selectedId,
  showDisabled,
  onSelect,
}: TemplateSelectorProps) {
  const templates = CARD_TEMPLATE_CONFIG.templates.filter(
    (t) => t.enabled || showDisabled
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-3 pb-2 px-1" style={{ width: "max-content" }}>
        {templates.map((t) => {
          const isSelected = t.id === selectedId;
          const isDisabled = !t.enabled;

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="flex flex-col items-center gap-1 focus:outline-none group"
            >
              <div
                className={[
                  "relative rounded-lg overflow-hidden transition-all duration-150",
                  "w-[60px] h-[80px]",
                  isSelected
                    ? "ring-2 ring-pink-500 ring-offset-1 ring-offset-black scale-105"
                    : "ring-1 ring-white/10 hover:ring-white/30",
                  isDisabled ? "opacity-50 grayscale" : "",
                ].join(" ")}
              >
                <Image
                  src={t.assets.thumbnail}
                  alt={t.name}
                  fill
                  sizes="60px"
                  className="object-cover"
                  unoptimized
                />
                {isDisabled && (
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-[8px] bg-red-600/80 text-white px-1 rounded">
                      OFF
                    </span>
                  </div>
                )}
              </div>
              <span
                className={[
                  "text-[9px] text-center w-[64px] leading-tight truncate",
                  isSelected ? "text-pink-400" : "text-white/50",
                ].join(" ")}
              >
                {t.name.replace(" 2026", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
