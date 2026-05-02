"use client";

import { useState } from "react";
import { Copy, Check, Music2, Instagram, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface PlatformPack {
  key: string;
  name: string;
  icon: typeof Music2;
  tint: string;
  steps: string[];
}

const PACKS: PlatformPack[] = [
  {
    key: "tiktok",
    name: "TikTok",
    icon: Music2,
    tint: "from-pink-400/15 to-cyan-400/10 border-pink-300/30",
    steps: [
      "Save the PNG to your camera roll",
      "Use it as a TikTok cover or carousel slide",
      "Paste a caption from above into the description",
      "Tag #FangirlFC #WC2026",
    ],
  },
  {
    key: "instagram",
    name: "Instagram Story",
    icon: Instagram,
    tint: "from-fuchsia-400/15 to-amber-300/10 border-fuchsia-300/30",
    steps: [
      "Save the PNG (it's already 1080×1920, story-ready)",
      "Add it to your story",
      "Drop the share link as a Link sticker",
      "Use a caption from above as the story text",
    ],
  },
  {
    key: "whatsapp",
    name: "WhatsApp / Group chat",
    icon: MessageCircle,
    tint: "from-emerald-400/15 to-cyan-400/10 border-emerald-300/30",
    steps: [
      "Send the PNG to your bestie or group",
      "Paste the share link below it",
      "Tell them to take the quiz so you can compare",
    ],
  },
];

interface Props {
  shareUrl: string | null;
  primaryCaption: string;
}

export function SharePack({ shareUrl, primaryCaption }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
        Share Pack · what to send
      </div>
      <p className="mt-1 text-[12px] text-white/55">
        Copy what you need, then post it like this:
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => copy("caption", primaryCaption)}
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[12px] font-bold transition",
            copied === "caption"
              ? "border-pink-400/60 bg-pink-400/15 text-pink-50"
              : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
          )}
        >
          <span>Copy caption</span>
          {copied === "caption" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => shareUrl && copy("link", shareUrl)}
          disabled={!shareUrl}
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[12px] font-bold transition",
            !shareUrl
              ? "border-white/5 bg-white/[0.03] text-white/30"
              : copied === "link"
                ? "border-pink-400/60 bg-pink-400/15 text-pink-50"
                : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
          )}
        >
          <span>{shareUrl ? "Copy link" : "Generate link first"}</span>
          {copied === "link" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {PACKS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className={cn(
                "rounded-2xl border bg-gradient-to-br p-3",
                p.tint,
              )}
            >
              <div className="flex items-center gap-2 text-[13px] font-bold text-white">
                <Icon className="h-4 w-4" />
                {p.name}
              </div>
              <ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-[11.5px] leading-snug text-white/80">
                {p.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}
