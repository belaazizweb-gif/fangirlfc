"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, LogIn, Loader2, Star } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getUserProfile,
  setOfficialCard,
  type OfficialCardData,
} from "@/lib/officialCard";
import {
  awardOfficialStars,
  refreshOfficialLeaderboardEntry,
  adjustTeamMemberCount,
} from "@/lib/officialStars";
import { fetchLeaderboardRank, type RankResult } from "@/lib/leaderboardRank";
import { getTeam } from "@/lib/teams";
import { FAN_TYPES } from "@/lib/fanTypes";
import { OfficialShareCTA } from "@/components/OfficialShareCTA";
import { TeamRankBanner } from "@/components/TeamRankBanner";
import { DuelSection } from "@/components/DuelSection";
import type { FanIdentityId } from "@/types";

interface Props {
  identityId: FanIdentityId;
  teamCode: string;
  displayName: string;
  templateId: string;
}

type Status = "idle" | "saving" | "saved" | "error";

interface AwardBadge {
  stars: number;
  xp: number;
}

export function OfficialCardSection({
  identityId,
  teamCode,
  displayName,
  templateId,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading]     = useState(false);
  const [officialCard, setOfficialCardState]     = useState<OfficialCardData | null | undefined>(undefined);
  const [officialTeamCode, setOfficialTeamCode] = useState<string | null>(null);
  const [officialStars, setOfficialStars]       = useState<number>(0);
  const [officialXp, setOfficialXp]             = useState<number>(0);
  const [status, setStatus]                     = useState<Status>("idle");
  const [errorMsg, setErrorMsg]                 = useState<string | null>(null);
  const [showTeamConfirm, setShowTeamConfirm]   = useState(false);
  const [lastAward, setLastAward]               = useState<AwardBadge | null>(null);
  const [teamRank, setTeamRank]                 = useState<number | null>(null);
  const [rankResult, setRankResult]             = useState<RankResult | null>(null);
  const loadedUid  = useRef<string | null>(null);
  const shareRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setOfficialCardState(undefined);
      setOfficialTeamCode(null);
      setOfficialStars(0);
      setOfficialXp(0);
      setTeamRank(null);
      setRankResult(null);
      loadedUid.current = null;
      return;
    }
    if (loadedUid.current === user.uid) return;
    loadedUid.current = user.uid;
    setProfileLoading(true);
    getUserProfile(user.uid).then((profile) => {
      setOfficialCardState(profile?.officialCard ?? null);
      setOfficialTeamCode(profile?.officialTeamCode ?? null);
      setOfficialStars(profile?.officialStars ?? 0);
      setOfficialXp(profile?.officialXp ?? 0);
      setProfileLoading(false);
      void fetchLeaderboardRank(user.uid).then(setRankResult);
    });
  }, [user]);

  // ----- helpers -----
  const trimmedName = displayName.trim();
  const teamsDiffer =
    officialTeamCode !== null &&
    officialTeamCode !== teamCode;

  const doSave = async (updateTeam: boolean) => {
    if (!user) return;
    setStatus("saving");
    setErrorMsg(null);
    setShowTeamConfirm(false);

    const isFirstCard  = officialCard === null;
    const prevTeamCode = officialTeamCode;

    const res = await setOfficialCard(
      user.uid,
      { identityId, teamCode, displayName: trimmedName, templateId },
      { updateTeam },
    );
    if (!res.ok) {
      setErrorMsg(res.error ?? "Something went wrong.");
      setStatus("error");
      return;
    }

    const newCard: OfficialCardData = {
      identityId,
      teamCode,
      displayName: trimmedName,
      templateId,
      officialSince: null,
    };
    setOfficialCardState(newCard);

    if (updateTeam) {
      setOfficialTeamCode(teamCode);
      void adjustTeamMemberCount(teamCode, prevTeamCode);
    }

    const awardAction = isFirstCard ? "publish_official_card" : "replace_official_card";
    const award = await awardOfficialStars(user.uid, awardAction);

    const newStars = award.newOfficialStars ?? officialStars;
    const newXp    = award.newRankScore !== undefined
      ? award.newRankScore - newStars * 100
      : officialXp + (award.xp ?? 0);

    const earnedBadge: AwardBadge | null =
      (award.awarded && award.stars) ? { stars: award.stars, xp: award.xp ?? 0 } : null;

    setOfficialStars(newStars);
    setOfficialXp(newXp);
    setLastAward(earnedBadge);
    setStatus("saved");

    void refreshOfficialLeaderboardEntry(user.uid);
  };

  const handleMakeOfficial = () => {
    if (!user) return;
    if (!trimmedName) {
      setErrorMsg("Add your display name first — scroll up to the name field.");
      setStatus("error");
      return;
    }
    if (teamsDiffer) {
      setShowTeamConfirm(true);
      return;
    }
    void doSave(officialTeamCode === null);
  };

  const handleDuelClick = () => {
    shareRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ----- render states -----
  if (authLoading) return null;

  // ── NOT SIGNED IN ──
  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-white/70">
          <Shield className="h-4 w-4 text-white/40" />
          Fangirl Card
        </div>
        <p className="mt-2 text-[12px] text-white/50">
          Sign in to save your Fangirl Card — one card, one team, yours forever.
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-pink-300">
          <LogIn className="h-3.5 w-3.5" />
          Sign in using the button in the top-right header.
        </div>
      </div>
    );
  }

  // ── LOADING PROFILE ──
  if (profileLoading || officialCard === undefined) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-white/70">
          <Shield className="h-4 w-4 text-white/40" />
          Fangirl Card
        </div>
        <div className="mt-3 flex items-center gap-2 text-[12px] text-white/40">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading your profile…
        </div>
      </div>
    );
  }

  // ── TEAM CHANGE CONFIRMATION ──
  const currentOfficialTeam = officialTeamCode ? getTeam(officialTeamCode) : null;
  const newTeam = getTeam(teamCode);

  if (showTeamConfirm) {
    return (
      <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-amber-200">
          <ShieldAlert className="h-4 w-4" />
          Different team detected
        </div>
        <p className="mt-2 text-[12px] text-white/70">
          Your official team is{" "}
          <span className="font-bold text-white">
            {currentOfficialTeam?.flag} {currentOfficialTeam?.name}
          </span>
          , but this card uses{" "}
          <span className="font-bold text-white">
            {newTeam?.flag} {newTeam?.name}
          </span>
          . Do you want to update your official team too?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => void doSave(true)}
            className="rounded-full bg-amber-400 px-4 py-2.5 text-[13px] font-extrabold text-black transition hover:bg-amber-300"
          >
            Yes — update my team to {newTeam?.flag} {newTeam?.name}
          </button>
          <button
            onClick={() => void doSave(false)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-white/20"
          >
            Save Fangirl Card, keep team as {currentOfficialTeam?.flag}{" "}
            {currentOfficialTeam?.name}
          </button>
          <button
            onClick={() => setShowTeamConfirm(false)}
            className="text-center text-[12px] text-white/40 hover:text-white/70"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN STATE ──
  const hasExisting     = officialCard !== null;
  const currentIdentity = officialCard ? FAN_TYPES[officialCard.identityId] : null;
  const currentTeamObj  = officialCard ? getTeam(officialCard.teamCode) : null;

  const isOfficialCardInView =
    !officialCard ||
    (identityId === officialCard.identityId &&
      teamCode === officialCard.teamCode &&
      templateId === officialCard.templateId &&
      trimmedName === officialCard.displayName.trim());

  return (
    <div
      className={`rounded-2xl border p-4 ${
        status === "saved"
          ? "border-emerald-400/40 bg-emerald-400/10"
          : hasExisting
          ? "border-pink-300/30 bg-pink-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* ── 1. Official card status + explanation ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-white">
          {status === "saved" || hasExisting ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <Shield className="h-4 w-4 text-white/40" />
          )}
          Fangirl Card
        </div>
        {officialStars > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">
            <Star className="h-2.5 w-2.5 fill-amber-300" />
            {officialStars} Fangirl stars
          </div>
        )}
      </div>

      {/* Explanation — shown when no official card yet */}
      {!hasExisting && status === "idle" && (
        <p className="mt-1.5 text-[11px] text-white/45">
          Your Fangirl Card is the one that counts for stars, ranking, and team competition.
        </p>
      )}

      {/* Save success */}
      {status === "saved" && (
        <div className="mt-2">
          <p className="text-[12px] font-semibold text-emerald-300">
            You are now competing globally.
          </p>
          {lastAward && (
            <div className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-amber-400/15 px-3 py-1.5 text-[12px] font-bold text-amber-300">
              <Star className="h-3 w-3 fill-amber-300" />
              +{lastAward.stars} Fangirl star{lastAward.stars !== 1 ? "s" : ""} ·{" "}
              +{lastAward.xp} XP earned
            </div>
          )}
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="mt-2 text-[12px] text-red-400">{errorMsg}</p>
      )}

      <button
        onClick={handleMakeOfficial}
        disabled={status === "saving"}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold transition disabled:opacity-50 ${
          status === "saved"
            ? "bg-emerald-500 text-white hover:bg-emerald-400"
            : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {status === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : status === "saved" ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            Saved — update again
          </>
        ) : hasExisting ? (
          <>
            <Shield className="h-4 w-4" />
            Replace Fangirl Card
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Save Fangirl Card
          </>
        )}
      </button>

      {/* ── 2. Rival / relative position ── */}
      {isOfficialCardInView && (
        <DuelSection
          rankResult={rankResult}
          hasOfficialCard={hasExisting}
          onDuelClick={handleDuelClick}
        />
      )}

      {/* ── 3. Share CTA (scroll target for duel button) ── */}
      <div ref={shareRef}>
        <OfficialShareCTA
          user={user}
          officialCard={officialCard}
          officialTeamCode={officialTeamCode}
          officialStars={officialStars}
          identityId={identityId}
          teamCode={teamCode}
          templateId={templateId}
          displayName={displayName}
          teamRank={teamRank}
          rival={rankResult?.rival ?? null}
          starsNeeded={rankResult?.starsNeeded ?? 0}
          disabled={status === "saving"}
        />
      </div>

      {/* ── 4. Team rank banner ── */}
      <TeamRankBanner
        officialTeamCode={officialTeamCode}
        officialStars={officialStars}
        onRankLoaded={setTeamRank}
      />

      {/* ── 5. Official card metadata ── */}
      {hasExisting && status !== "saved" && (
        <div className="mt-2 rounded-xl bg-white/5 p-3 text-[12px]">
          <p className="font-bold text-white">{officialCard!.displayName}</p>
          <p className="mt-0.5 text-white/60">
            {currentIdentity?.emoji} {currentIdentity?.title}
            {" · "}
            {currentTeamObj?.flag} {currentTeamObj?.name}
          </p>
          <p className="mt-0.5 text-white/40">Template: {officialCard!.templateId}</p>
        </div>
      )}
    </div>
  );
}
