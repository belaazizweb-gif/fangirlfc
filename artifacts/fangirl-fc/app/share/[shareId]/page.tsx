"use client";

import { Suspense, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { FanCard } from "@/components/FanCard";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam, TEAMS } from "@/lib/teams";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import { loadPublicCard } from "@/lib/share";
import { shareOrDownloadCard } from "@/lib/exportImage";
import { trackEvent } from "@/lib/analytics";
import type { ShareRecord } from "@/types";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

function FallbackModal({ dataUrl, onClose }: { dataUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <p className="mb-4 text-center text-sm font-bold text-white">
        Long press the image below to save it to your photos 👇
      </p>
      <img
        src={dataUrl}
        alt="Fangirl FC Card"
        className="max-h-[70vh] w-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="mt-6 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/70"
      >
        Close
      </button>
    </div>
  );
}

function ShareCardView({ shareId }: { shareId: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState<ShareRecord | null | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    loadPublicCard(shareId).then((r) => {
      setRecord(r);
      if (r) trackEvent("share_card_viewed", { shareId });
    });
  }, [shareId]);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const result = await shareOrDownloadCard(cardRef.current, "fangirl-fc-card.png");
      if (result.status === "fallback" && result.dataUrl) {
        setFallbackUrl(result.dataUrl);
      }
      trackEvent("share_card_saved", { shareId, result: result.status });
    } finally {
      setBusy(false);
    }
  };

  if (record === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/50">
        Loading card…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-2xl">😅</p>
        <p className="mt-3 font-bold text-white">This card link has expired or doesn&apos;t exist.</p>
        <p className="mt-1 text-sm text-white/60">Links are only available when Firebase is configured.</p>
        <Link
          href="/quiz"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20"
        >
          Get your own Fangirl Card →
        </Link>
      </div>
    );
  }

  const identity = FAN_TYPES[record.identityId] ?? FAN_TYPES.chaotic;
  const team = getTeam(record.teamCode) ?? TEAMS[0]!;
  const template = getTemplate(record.templateId) ?? TEMPLATES[0]!;

  return (
    <div className="flex flex-col gap-6">
      {fallbackUrl && (
        <FallbackModal dataUrl={fallbackUrl} onClose={() => setFallbackUrl(null)} />
      )}

      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
          Fangirl FC · World Cup 2026
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">
          {record.displayName}&apos;s Fangirl Card
        </h1>
        <p className="mt-1 text-sm text-white/55">
          {identity.title} · {team.flag} {team.name}
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className="origin-top scale-[0.85]"
          style={{ width: 360, height: 640 * 0.85 }}
        >
          <FanCard
            ref={cardRef}
            identity={identity}
            team={team}
            template={template}
            displayName={record.displayName}
            selfieUrl={null}
            stars={record.stars}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={busy}
          className="shine-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base disabled:opacity-50"
        >
          {busy ? "Generating…" : "💾 Save this card"}
        </button>

        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 rounded-full border border-pink-300/40 bg-pink-400/10 px-6 py-3.5 text-sm font-bold text-pink-50 hover:bg-pink-400/20"
        >
          Get your own Fangirl Card 💖
        </Link>

        <p className="text-center text-[11px] text-white/35">
          No signup · free · World Cup 2026
        </p>
      </div>
    </div>
  );
}

export default function SharePage({ params }: PageProps) {
  const { shareId } = use(params);
  return (
    <Suspense fallback={<div className="text-white/50">Loading card…</div>}>
      <ShareCardView shareId={shareId} />
    </Suspense>
  );
}
