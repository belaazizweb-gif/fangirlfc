"use client";

import { useState } from "react";
import { Copy, Check, Share2, Download } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  shareUrl: string | null;
  onShareClick: () => Promise<void>;
  onDownload: () => Promise<void>;
  busy?: boolean;
}

export function ShareActions({
  shareUrl,
  onShareClick,
  onDownload,
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
      <button
        onClick={onShareClick}
        disabled={busy}
        className={cn(
          "shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base",
          "disabled:opacity-50",
        )}
      >
        {shareUrl ? "Refresh share link" : busy ? "Saving…" : "Get share link"}
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
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        onClick={onDownload}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Download card (PNG)
      </button>
    </div>
  );
}
