"use client";

import { useState } from "react";
import { Share2, Check, Loader2, Star } from "lucide-react";
import type { User } from "firebase/auth";
import { awardOfficialStars } from "@/lib/officialStars";
import { saveOfficialShareRecord } from "@/lib/officialShare";
import { buildPayloadShareUrl, newShareId } from "@/lib/share";
import type { OfficialCardData } from "@/lib/officialCard";
import type { FanIdentityId } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  user: User;
  officialCard: OfficialCardData | null;
  officialTeamCode: string | null;
  officialStars: number;
  identityId: FanIdentityId;
  teamCode: string;
  templateId: string;
  displayName: string;
  disabled?: boolean;
}

type RewardKind = "awarded" | "already" | "not_deployed" | "error";

interface ShareOutcome {
  copied: boolean;
  url: string;
  rewardKind: RewardKind;
  rewardMsg: string;
}

// ─── Match check ──────────────────────────────────────────────────────────────

function isOfficialMatch(
  current: { identityId: string; teamCode: string; templateId: string; displayName: string },
  official: OfficialCardData,
): boolean {
  return (
    current.identityId === official.identityId &&
    current.teamCode === official.teamCode &&
    current.templateId === official.templateId &&
    current.displayName.trim() === official.displayName.trim()
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OfficialShareCTA({
  user,
  officialCard,
  officialTeamCode,
  officialStars,
  identityId,
  teamCode,
  templateId,
  displayName,
  disabled = false,
}: Props) {
  const [sharing, setSharing] = useState(false);
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);

  const hasOfficial = officialCard !== null;
  const isMatch     = hasOfficial && isOfficialMatch(
    { identityId, teamCode, templateId, displayName },
    officialCard!,
  );

  // ── No official card yet ──
  if (!hasOfficial) {
    return (
      <p className="mt-2 text-center text-[11px] text-white/30">
        Publish your official card first to unlock the share reward.
      </p>
    );
  }

  // ── Current card doesn't match official card ──
  if (!isMatch) {
    return (
      <p className="mt-2 text-center text-[11px] text-white/40">
        Only your official card can earn the share reward.
      </p>
    );
  }

  // ── Already shared — show persistent result ──
  const handleShare = async () => {
    if (sharing || disabled) return;
    setSharing(true);
    setOutcome(null);

    // 1 ── Build share link from official card data
    const shareId    = newShareId();
    const shareRecord = {
      shareId,
      identityId: officialCard!.identityId,
      stars:      officialStars,
      teamCode:   officialCard!.teamCode,
      displayName: officialCard!.displayName,
      templateId: officialCard!.templateId,
      createdAt:  Date.now(),
    };
    const url = buildPayloadShareUrl(shareRecord, "public");

    // 2 ── Copy to clipboard (best-effort)
    let copied = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch {
      // clipboard not available — show URL inline
    }

    // 3 ── Analytics write (fire-and-forget, does NOT block reward)
    void saveOfficialShareRecord({
      shareId,
      uid:              user.uid,
      officialTeamCode: officialTeamCode,
      identityId:       officialCard!.identityId,
      templateId:       officialCard!.templateId,
      displayName:      officialCard!.displayName,
      shareUrl:         url,
    });

    // 4 ── Call secure Cloud Function for reward
    const award = await awardOfficialStars(user.uid, "share_official_card");

    let rewardKind: RewardKind;
    let rewardMsg: string;

    if (!award.ok) {
      rewardKind = "not_deployed";
      rewardMsg  = `Reward unavailable: ${award.error ?? "Could not contact progression service."}`;
    } else if (!award.awarded) {
      rewardKind = "already";
      rewardMsg  = "Official share already rewarded.";
    } else {
      rewardKind = "awarded";
      rewardMsg  = `+${award.stars} ⭐ Official share reward.`;
    }

    setOutcome({ copied, url, rewardKind, rewardMsg });
    setSharing(false);
  };

  const rewardColor: Record<RewardKind, string> = {
    awarded:      "text-amber-300",
    already:      "text-white/50",
    not_deployed: "text-white/40",
    error:        "text-red-400",
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Button */}
      {!outcome && (
        <button
          onClick={() => void handleShare()}
          disabled={sharing || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-pink-300/40 bg-pink-400/10 px-5 py-2.5 text-[13px] font-extrabold text-pink-100 transition hover:bg-pink-400/20 disabled:opacity-50"
        >
          {sharing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sharing…
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share Official Card
            </>
          )}
        </button>
      )}

      {/* Outcome */}
      {outcome && (
        <div className="flex flex-col gap-1.5">
          {/* Link row */}
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[12px]">
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="flex-1 truncate text-white/60">
              {outcome.copied ? "Link copied to clipboard" : outcome.url}
            </span>
            {!outcome.copied && (
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(outcome.url);
                }}
                className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/20"
              >
                Copy
              </button>
            )}
          </div>

          {/* Reward row */}
          <div
            className={`flex items-center gap-1.5 text-[12px] font-semibold ${
              rewardColor[outcome.rewardKind]
            }`}
          >
            {outcome.rewardKind === "awarded" && (
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            )}
            {outcome.rewardMsg}
          </div>

          {/* Share again button */}
          <button
            onClick={() => {
              setOutcome(null);
              setSharing(false);
            }}
            className="mt-1 text-center text-[11px] text-white/30 hover:text-white/60"
          >
            Share again
          </button>
        </div>
      )}
    </div>
  );
}
