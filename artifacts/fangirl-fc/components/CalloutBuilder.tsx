"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import type { CalloutTarget, FanIdentityId } from "@/types";
import { FAN_TYPES, FAN_TYPE_LIST } from "@/lib/fanTypes";
import { exportNodeAsPng } from "@/lib/exportImage";
import { trackEvent } from "@/lib/analytics";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { CalloutCard } from "./CalloutCard";

const TARGET_OPTIONS: { id: CalloutTarget; label: string; emoji: string }[] = [
  { id: "bestie", label: "Bestie", emoji: "💖" },
  { id: "boyfriend", label: "Boyfriend", emoji: "💘" },
  { id: "girls", label: "Girls Group", emoji: "👯‍♀️" },
  { id: "everyone", label: "Everyone", emoji: "📣" },
];

export function CalloutBuilder() {
  const params = useSearchParams();
  const initialId = params.get("identity");
  const seed: FanIdentityId =
    initialId && initialId in FAN_TYPES
      ? (initialId as FanIdentityId)
      : "chaotic";
  const [friendName, setFriendName] = useState("");
  const [identityId, setIdentityId] = useState<FanIdentityId>(seed);
  const [target, setTarget] = useState<CalloutTarget>("bestie");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const identity = FAN_TYPES[identityId];
  const safeName = friendName.trim() || "Bestie";

  const message = useMemo(
    () =>
      `${safeName}, you are definitely ${identity.title} ${identity.emoji}\n\n"${identity.slogan}"\n\nTake the quiz and prove me wrong → fangirl fc 💖`,
    [safeName, identity],
  );

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await exportNodeAsPng(
        cardRef.current,
        `fangirl-callout-${safeName.toLowerCase().replace(/\s+/g, "-")}.png`,
      );
      trackEvent("callout_exported", { identityId, target });
      showToast({
        kind: "info",
        title: "Call-out card saved",
        emoji: "💌",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast({
        kind: "info",
        title: "Couldn't copy",
        detail: "Long-press to copy manually",
      });
    }
  };

  const handleGenerate = () => {
    trackEvent("callout_created", { identityId, target });
    showToast({
      kind: "info",
      title: "Call-out ready",
      detail: `${safeName} → ${identity.title}`,
      emoji: identity.emoji,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="glass flex flex-col gap-4 rounded-2xl p-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
            Friend's name
          </label>
          <input
            value={friendName}
            onChange={(e) => setFriendName(e.target.value.slice(0, 24))}
            placeholder="Sara, the boyfriend, etc."
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:border-white/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
            Choose their identity
          </label>
          <div className="no-scrollbar -mx-1 mt-1.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {FAN_TYPE_LIST.map((t) => {
              const active = t.id === identityId;
              return (
                <button
                  key={t.id}
                  onClick={() => setIdentityId(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                    active
                      ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                >
                  <span>{t.emoji}</span>
                  <span>{t.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/55">
            Send to
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {TARGET_OPTIONS.map((opt) => {
              const active = target === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTarget(opt.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition",
                    active
                      ? "border-pink-300/60 bg-pink-400/20 text-pink-50"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className="origin-top scale-[0.85]"
          style={{ width: 360, height: 640 * 0.85 }}
        >
          <CalloutCard
            ref={cardRef}
            friendName={safeName}
            identity={identity}
            target={target}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleGenerate}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm"
        >
          Lock the call-out in
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-black hover:bg-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/85 hover:bg-white/10"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>
      </div>
    </div>
  );
}
