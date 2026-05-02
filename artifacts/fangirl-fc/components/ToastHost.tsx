"use client";

import { useEffect, useState } from "react";
import { Star, Sparkles } from "lucide-react";
import { onToast, type ToastPayload } from "@/lib/toast";
import { cn } from "@/lib/cn";

interface VisibleToast extends ToastPayload {
  removing?: boolean;
}

const VISIBLE_MS = 2400;
const FADE_MS = 400;

export function ToastHost() {
  const [toasts, setToasts] = useState<VisibleToast[]>([]);

  useEffect(() => {
    return onToast((p) => {
      setToasts((cur) => [...cur, p]);
      const fadeTimer = window.setTimeout(() => {
        setToasts((cur) =>
          cur.map((t) => (t.id === p.id ? { ...t, removing: true } : t)),
        );
      }, VISIBLE_MS);
      const removeTimer = window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== p.id));
      }, VISIBLE_MS + FADE_MS);
      return () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(removeTimer);
      };
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-bold shadow-2xl backdrop-blur transition-all",
            t.removing
              ? "-translate-y-3 opacity-0"
              : "translate-y-0 opacity-100",
            t.kind === "unlock"
              ? "border-pink-300/60 bg-gradient-to-r from-pink-500/95 via-fuchsia-500/95 to-amber-400/95 text-white"
              : t.kind === "star"
                ? "border-amber-300/40 bg-black/85 text-amber-100"
                : "border-white/15 bg-black/85 text-white",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <span className="flex h-5 w-5 items-center justify-center">
            {t.kind === "unlock" ? (
              <Sparkles className="h-4 w-4" />
            ) : t.kind === "star" ? (
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
            ) : (
              <span>✨</span>
            )}
          </span>
          <div className="flex-1">
            <div className="leading-tight">{t.title}</div>
            {t.detail && (
              <div className="text-[11px] font-medium opacity-85">
                {t.detail}
              </div>
            )}
          </div>
          {t.emoji && <span className="text-lg leading-none">{t.emoji}</span>}
        </div>
      ))}
    </div>
  );
}
