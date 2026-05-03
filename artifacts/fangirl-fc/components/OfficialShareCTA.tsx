"use client";

import { useState } from "react";
import { Check, Loader2, Star, TrendingUp } from "lucide-react";
import type { User } from "firebase/auth";
import { awardOfficialStars } from "@/lib/officialStars";
import { saveOfficialShareRecord } from "@/lib/officialShare";
import { buildPayloadShareUrl, newShareId } from "@/lib/share";
import { getTeam } from "@/lib/teams";
import type { OfficialCardData } from "@/lib/officialCard";
import type { LeaderboardEntry } from "@/lib/officialStars";
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
  teamRank?: number | null;
  rival?: LeaderboardEntry | null;
  starsNeeded?: number;
  disabled?: boolean;
}

type RewardKind = "awarded" | "already" | "not_deployed" | "error";

interface ShareOutcome {
  copied: boolean;
  url: string;
  rewardKind: RewardKind;
  /** Primary feedback line. */
  primaryMsg: string;
  /** Secondary / contextual line. */
  secondaryMsg: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function rivalDisplayName(rival: LeaderboardEntry): string {
  return rival.officialCardDisplayName?.trim() || rival.displayName?.trim() || "them";
}

function buttonLabel(rival: LeaderboardEntry | null | undefined): string {
  if (rival) return `Share to pass ${rivalDisplayName(rival)} 🚀`;
  return "Share to climb ranking 🚀";
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
  rival,
  starsNeeded = 0,
  disabled = false,
}: Props) {
  const [sharing, setSharing] = useState(false);
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);

  const hasOfficial = officialCard !== null;
  const isMatch     = hasOfficial && isOfficialMatch(
    { identityId, teamCode, templateId, displayName },
    officialCard!,
  );

  const team     = officialTeamCode ? getTeam(officialTeamCode) : null;
  const teamName = team?.name ?? "your team";

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

  // ── Share handler ──
  const handleShare = async () => {
    if (sharing || disabled) return;
    setSharing(true);
    setOutcome(null);

    // 1 — Build share link
    const shareId     = newShareId();
    const shareRecord = {
      shareId,
      identityId:  officialCard!.identityId,
      stars:       officialStars,
      teamCode:    officialCard!.teamCode,
      displayName: officialCard!.displayName,
      templateId:  officialCard!.templateId,
      createdAt:   Date.now(),
    };
    const url = buildPayloadShareUrl(shareRecord, "public");

    // 2 — Clipboard (best-effort)
    let copied = false;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch { /* show URL inline */ }

    // 3 — Analytics (fire-and-forget)
    void saveOfficialShareRecord({
      shareId,
      uid:              user.uid,
      officialTeamCode: officialTeamCode,
      identityId:       officialCard!.identityId,
      templateId:       officialCard!.templateId,
      displayName:      officialCard!.displayName,
      shareUrl:         url,
    });

    // 4 — Secure Cloud Function reward
    const award = await awardOfficialStars(user.uid, "share_official_card");

    let rewardKind: RewardKind;
    let primaryMsg: string;
    let secondaryMsg: string;
    const rivalName = rival ? rivalDisplayName(rival) : null;

    if (!award.ok) {
      rewardKind   = "not_deployed";
      primaryMsg   = "Share link created.";
      secondaryMsg = `Reward unavailable: ${award.error ?? "Could not contact progression service."}`;
    } else if (!award.awarded) {
      rewardKind   = "already";
      primaryMsg   = "Reward already claimed.";
      secondaryMsg = "Sharing still helps your team.";
    } else {
      rewardKind   = "awarded";
      primaryMsg   = `+${award.stars} ⭐ earned`;
      secondaryMsg = rivalName
        ? `You are getting closer to ${rivalName}.`
        : "You are now climbing the ranking.";
    }

    setOutcome({ copied, url, rewardKind, primaryMsg, secondaryMsg });
    setSharing(false);
  };

  const rewardColor: Record<RewardKind, string> = {
    awarded:      "text-amber-300",
    already:      "text-white/50",
    not_deployed: "text-white/60",
    error:        "text-red-400",
  };

  void starsNeeded;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* ── Dominant share button ── */}
      {!outcome && (
        <button
          onClick={() => void handleShare()}
          disabled={sharing || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-[14px] font-extrabold text-white shadow-lg transition hover:from-pink-400 hover:to-purple-400 active:scale-[0.98] disabled:opacity-50"
        >
          {sharing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sharing…
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              {buttonLabel(rival)}
            </>
          )}
        </button>
      )}

      {/* ── Outcome ── */}
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
                onClick={() => { void navigator.clipboard?.writeText(outcome.url); }}
                className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-white/20"
              >
                Copy
              </button>
            )}
          </div>

          {/* Primary reward line */}
          <div className={`flex items-center gap-1.5 text-[13px] font-bold ${rewardColor[outcome.rewardKind]}`}>
            {outcome.rewardKind === "awarded" && (
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            )}
            {outcome.primaryMsg}
          </div>

          {/* Secondary contextual line */}
          <p className="text-[12px] text-white/55">{outcome.secondaryMsg}</p>

          {/* Share again */}
          <button
            onClick={() => { setOutcome(null); setSharing(false); }}
            className="mt-1 text-center text-[11px] text-white/30 hover:text-white/60"
          >
            Share again
          </button>
        </div>
      )}
    </div>
  );
}
