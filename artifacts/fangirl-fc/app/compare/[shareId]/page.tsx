"use client";

import { useEffect, useState, use } from "react";
import { ComparisonResult } from "@/components/ComparisonResult";
import { FAN_TYPES } from "@/lib/fanTypes";
import { getTeam, TEAMS } from "@/lib/teams";
import { loadShare } from "@/lib/share";
import { awardStar, getStars } from "@/lib/stars";
import type { ShareRecord, FanIdentityId } from "@/types";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default function ComparePage({ params }: PageProps) {
  const { shareId } = use(params);
  const [record, setRecord] = useState<ShareRecord | null | "loading">(
    "loading",
  );
  const [yourId, setYourId] = useState<FanIdentityId | null>(null);

  useEffect(() => {
    let mounted = true;
    loadShare(shareId).then((r) => {
      if (mounted) {
        setRecord(r);
        if (r) awardStar("compare_friend");
      }
    });
    if (typeof window !== "undefined") {
      const last = window.localStorage.getItem("fangirlfc.lastIdentity");
      if (last && last in FAN_TYPES) setYourId(last as FanIdentityId);
    }
    return () => {
      mounted = false;
    };
  }, [shareId]);

  if (record === "loading") {
    return <div className="text-white/50">Loading their card…</div>;
  }
  if (!record) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-sm text-white/70">
          We couldn't find that share link. It may have expired.
        </p>
      </div>
    );
  }

  const identity = FAN_TYPES[record.identityId];
  const team = getTeam(record.teamCode) ?? TEAMS[0]!;

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
        displayName: record.displayName,
        stars: record.stars,
      }}
      you={you}
    />
  );
}
