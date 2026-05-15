"use client";

import { useState } from "react";
import { Copy, Check, Share2, ImageDown, Link2, LogIn } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthModal";

interface Props {
  shareUrl: string | null;
  onDownload: () => Promise<void>;
  onShareCard: () => Promise<void>;
  onGetShareLink: () => Promise<void>;
  busy?: boolean;
}

export function ShareActions({
  shareUrl,
  onDownload,
  onShareCard,
  onGetShareLink,
  busy,
}: Props) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      await copy();
    }
  };

  const handleGetShareLink = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await onGetShareLink();
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          onClick={onDownload}
          disabled={busy}
          className={cn(
            "shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base",
            "disabled:opacity-50",
          )}
        >
          <ImageDown className="h-4 w-4" />
          {busy ? "Preparing your card…" : "Download image"}
        </button>

        <button
          onClick={onShareCard}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50 transition"
        >
          <Share2 className="h-4 w-4" />
          {busy ? "Preparing…" : "Share card"}
        </button>

        <button
          onClick={handleGetShareLink}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/8 disabled:opacity-50 transition"
        >
          <Link2 className="h-4 w-4" />
          {shareUrl ? "Refresh share link" : "Copy share link"}
        </button>

        {!user && (
          <p className="text-center text-[11px] text-white/30">
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-pink-300/70 underline underline-offset-2 hover:text-pink-200"
            >
              Sign in
            </button>
            {" "}to create a shareable card link
          </p>
        )}

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

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
