"use client";

import { useState } from "react";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import type { FanIdentity } from "@/types";

interface Props {
  identity: FanIdentity;
  onDownload: () => Promise<void> | void;
  busy?: boolean;
}

const STORY_CAPTIONS = [
  "I got {identity} 😭 what are you?",
  "World Cup fan personality unlocked",
  "Send this to your bestie",
  "Girls, take the quiz",
];

const SHORT_CTAS = [
  "take the quiz 💖",
  "find your fan type",
  "what are you?",
  "tag your bestie 👇",
];

const OVERLAYS = [
  "this is literally me",
  "which one are you?",
  "tag your bestie",
  "group chat needs this",
];

function fill(text: string, identity: FanIdentity): string {
  return text.replace(/\{identity\}/g, identity.title);
}

export function StoryModeKit({ identity, onDownload, busy }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string, eventKey?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
      if (eventKey) trackEvent("story_caption_copied", { kind: eventKey });
    } catch {
      showToast({
        kind: "info",
        title: "Couldn't copy",
        detail: "Long-press to copy manually",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-500/15 via-pink-500/10 to-amber-300/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-fuchsia-100">
          ✨ Story Mode
        </div>
        <div className="text-[10px] font-bold uppercase text-white/45">
          1080×1920 ready
        </div>
      </div>
      <p className="mt-1 text-[12px] text-white/65">
        Built for IG Stories & TikTok. Save the card, drop a caption, add an
        overlay.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Section title="Story captions">
          {STORY_CAPTIONS.map((c) => {
            const filled = fill(c, identity);
            const key = `cap-${c}`;
            return (
              <CopyChip
                key={c}
                text={filled}
                copied={copied === key}
                onClick={() => copy(key, filled, "caption")}
              />
            );
          })}
        </Section>

        <Section title="Short CTAs">
          {SHORT_CTAS.map((c) => {
            const key = `cta-${c}`;
            return (
              <CopyChip
                key={c}
                text={c}
                copied={copied === key}
                onClick={() => copy(key, c, "cta")}
              />
            );
          })}
        </Section>

        <Section title="Overlay text ideas">
          <div className="flex flex-wrap gap-1.5">
            {OVERLAYS.map((o) => {
              const key = `ov-${o}`;
              return (
                <button
                  key={o}
                  onClick={() => copy(key, o, "overlay")}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                    copied === key
                      ? "border-pink-300/60 bg-pink-400/25 text-pink-50"
                      : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10",
                  )}
                >
                  {copied === key ? "Copied ✓" : `“${o}”`}
                </button>
              );
            })}
          </div>
        </Section>

        <button
          onClick={onDownload}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-black transition hover:bg-white disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download story card
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
        {title}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function CopyChip({
  text,
  copied,
  onClick,
}: {
  text: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[12px] transition",
        copied
          ? "border-pink-300/60 bg-pink-400/15 text-pink-50"
          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
      )}
    >
      <span className="flex-1 leading-snug">{text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-60" />
      )}
    </button>
  );
}
