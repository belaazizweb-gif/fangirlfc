"use client";

import { Suspense, useEffect, useMemo, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { ComparisonResult } from "@/components/ComparisonResult";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam, TEAMS } from "@/lib/teams";
import { decodeSharePayload } from "@/lib/share";
import { awardStar, getStars } from "@/lib/stars";
import { trackEvent } from "@/lib/analytics";
import { getShareMode } from "@/lib/shareModes";
import type { FanIdentityId, ShareMode } from "@/types";

interface PageProps {
  params: Promise<{ payload: string }>;
}

function Inner({ payload }: { payload: string }) {
  const search = useSearchParams();
  const decoded = useMemo(() => decodeSharePayload(payload), [payload]);
  const mode: ShareMode = getShareMode(
    search.get("mode") ?? decoded?.mode ?? null,
  ).id;

  const [yourId, setYourId] = useState<FanIdentityId | null>(null);

  useEffect(() => {
    if (!decoded) return;
    awardStar("compare_friend");
    trackEvent("compare_completed", { source: "payload" });
    trackEvent("compare_mode_opened", { source: "payload", mode });
    if (typeof window !== "undefined") {
      const last = window.localStorage.getItem("fangirlfc.lastIdentity");
      if (last && last in FAN_TYPES) setYourId(last as FanIdentityId);
    }
  }, [decoded, mode]);

  if (!decoded) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-sm text-white/70">
          We couldn&apos;t read that share link. It may be malformed.
        </p>
      </div>
    );
  }

  const identity = FAN_TYPES[decoded.identityId];
  const team = getTeam(decoded.teamCode) ?? TEAMS[0]!;

  const you = yourId
    ? {
        identity: FAN_TYPES[yourId],
        team,
        displayName: "You",
        stars: getStars(),
      }
    : null;

  return (
    <ComparisonResult
      friend={{
        identity,
        team,
        displayName: decoded.displayName,
        stars: decoded.stars,
      }}
      you={you}
      mode={mode}
    />
  );
}

export default function ComparePayloadPage({ params }: PageProps) {
  const { payload } = use(params);
  return (
    <Suspense
      fallback={<div className="text-white/50">Loading their card…</div>}
    >
      <Inner payload={payload} />
    </Suspense>
  );
}
