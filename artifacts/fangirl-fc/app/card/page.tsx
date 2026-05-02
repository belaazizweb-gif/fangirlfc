"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FAN_TYPES } from "@/lib/fanTypes";
import { TEAMS, getTeam } from "@/lib/teams";
import { TEMPLATES, getTemplate, IDENTITY_DEFAULT_TEMPLATE } from "@/lib/templates";
import { FanCard } from "@/components/FanCard";
import { PhotoUpload } from "@/components/PhotoUpload";
import { TeamSelector } from "@/components/TeamSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { ShareActions } from "@/components/ShareActions";
import { ShareCaptions } from "@/components/ShareCaptions";
import { StarProgress } from "@/components/StarProgress";
import { trackEvent } from "@/lib/analytics";
import { awardStar, getStars, snapshot, getNextHint } from "@/lib/stars";
import { exportNodeAsPng } from "@/lib/exportImage";
import { buildShareUrl, newShareId, saveShare } from "@/lib/share";
import type { FanIdentityId } from "@/types";

function Inner() {
  const params = useSearchParams();
  const id = (params.get("id") as FanIdentityId | null) ?? "chaotic";
  const identity = FAN_TYPES[id] ?? FAN_TYPES.chaotic;

  const [displayName, setDisplayName] = useState("");
  const [teamCode, setTeamCode] = useState<string>(TEAMS[0]!.code);
  const [templateId, setTemplateId] = useState<string>(
    IDENTITY_DEFAULT_TEMPLATE[id] ?? TEMPLATES[0]!.id,
  );
  const [selfie, setSelfie] = useState<string | null>(null);
  const [stars, setStars] = useState(0.5);
  const [hint, setHint] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStars(getStars());
    const snap = snapshot();
    setHint(getNextHint(getStars(), snap.actions));
  }, []);

  const team = getTeam(teamCode) ?? TEAMS[0]!;
  const template = getTemplate(templateId);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await exportNodeAsPng(cardRef.current, "fangirl-fc-card.png");
      const next = awardStar("card_generated");
      setStars(next);
      setHint(getNextHint(next, snapshot().actions));
      trackEvent("card_exported", { identityId: identity.id, templateId });
      trackEvent("card_generated", { identityId: identity.id, templateId });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const shareId = newShareId();
      await saveShare({
        shareId,
        identityId: identity.id,
        stars,
        teamCode,
        displayName: displayName || "Anonymous Fan",
        templateId,
        createdAt: Date.now(),
      });
      const url = buildShareUrl(shareId);
      setShareUrl(url);
      const next = awardStar("card_shared");
      setStars(next);
      setHint(getNextHint(next, snapshot().actions));
      trackEvent("compare_created", { shareId, identityId: identity.id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Your Fangirl Card</h1>
        <p className="mt-1 text-sm text-white/60">
          Tweak it. Selfies stay on your device — never uploaded.
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
            displayName={displayName}
            selfieUrl={selfie}
            stars={stars}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <StarProgress stars={stars} hint={hint} />
      </div>

      <div className="glass flex flex-col gap-4 rounded-2xl p-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.slice(0, 24))}
            placeholder="What should we call you?"
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:border-white/30 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Selfie (optional, local only)
          </label>
          <div className="mt-2">
            <PhotoUpload value={selfie} onChange={setSelfie} />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Pick your team
          </label>
          <div className="mt-2">
            <TeamSelector value={teamCode} onChange={setTeamCode} />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Template
          </label>
          <div className="mt-2">
            <TemplateSelector value={templateId} onChange={setTemplateId} />
          </div>
        </div>
      </div>

      <ShareActions
        shareUrl={shareUrl}
        onShareClick={handleShare}
        onDownload={handleDownload}
        busy={busy}
      />

      <ShareCaptions identity={identity} />

      <Link
        href={`/result?id=${identity.id}`}
        className="text-center text-xs text-white/50 hover:text-white/80"
      >
        ← Back to result
      </Link>
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading card…</div>}>
      <Inner />
    </Suspense>
  );
}
