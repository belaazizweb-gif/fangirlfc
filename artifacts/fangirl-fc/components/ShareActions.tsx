"use client";

import { useState } from "react";
import { Copy, Check, Share2, ImageDown, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  shareUrl: string | null;
  onShareImage: () => Promise<void>;
  onShareClick: () => Promise<void>;
  busy?: boolean;
}

export function ShareActions({
  shareUrl,
  onShareImage,
  onShareClick,
  busy,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Fangirl FC",
          text: "I just got my Fangirl FC identity. What's yours?",
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: share / save card image */}
      <button
        onClick={onShareImage}
        disabled={busy}
        className={cn(
          "shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base",
          "disabled:opacity-50",
        )}
      >
        <ImageDown className="h-4 w-4" />
        {busy ? "Generating…" : "Share / Save card"}
      </button>

      {/* Secondary: get share link */}
      <button
        onClick={onShareClick}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
      >
        <Link2 className="h-4 w-4" />
        {shareUrl ? "Refresh share link" : "Get share link"}
      </button>

      {shareUrl && (
        <div className="glass flex items-center gap-2 rounded-2xl p-3">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 truncate bg-transparent text-xs text-white/80 outline-none"
          />
          <button
            onClick={copy}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={nativeShare}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20"
            aria-label="Share link"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
