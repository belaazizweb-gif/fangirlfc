"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  getUserProfile,
  setOfficialCard,
  type OfficialCardData,
} from "@/lib/officialCard";
import { getTeam } from "@/lib/teams";
import { FAN_TYPES } from "@/lib/fanTypes";
import type { FanIdentityId } from "@/types";

interface Props {
  identityId: FanIdentityId;
  teamCode: string;
  displayName: string;
  templateId: string;
}

type Status = "idle" | "saving" | "saved" | "error";

export function OfficialCardSection({
  identityId,
  teamCode,
  displayName,
  templateId,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [officialCard, setOfficialCardState] = useState<OfficialCardData | null | undefined>(undefined);
  const [officialTeamCode, setOfficialTeamCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTeamConfirm, setShowTeamConfirm] = useState(false);
  const loadedUid = useRef<string | null>(null);

  // Load profile when user signs in
  useEffect(() => {
    if (!user) {
      setOfficialCardState(undefined);
      setOfficialTeamCode(null);
      loadedUid.current = null;
      return;
    }
    if (loadedUid.current === user.uid) return;
    loadedUid.current = user.uid;
    setProfileLoading(true);
    getUserProfile(user.uid).then((profile) => {
      setOfficialCardState(profile?.officialCard ?? null);
      setOfficialTeamCode(profile?.officialTeamCode ?? null);
      setProfileLoading(false);
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
    const res = await setOfficialCard(
      user.uid,
      { identityId, teamCode, displayName: trimmedName, templateId },
      { updateTeam },
    );
    if (res.ok) {
      setOfficialCardState({
        identityId,
        teamCode,
        displayName: trimmedName,
        templateId,
        officialSince: null,
      });
      if (updateTeam) setOfficialTeamCode(teamCode);
      setStatus("saved");
    } else {
      setErrorMsg(res.error ?? "Something went wrong.");
      setStatus("error");
    }
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
    void doSave(false);
  };

  // ----- render states -----
  if (authLoading) return null;

  // ── NOT SIGNED IN ──
  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-white/70">
          <Shield className="h-4 w-4 text-white/40" />
          Official Fan Card
        </div>
        <p className="mt-2 text-[12px] text-white/50">
          Sign in to publish your official fan card — one card, one team, yours forever.
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
          Official Fan Card
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
            Make official, keep team as {currentOfficialTeam?.flag} {currentOfficialTeam?.name}
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

  // ── SAVED / HAS OFFICIAL CARD ──
  const hasExisting = officialCard !== null;
  const currentIdentity = officialCard
    ? FAN_TYPES[officialCard.identityId]
    : null;
  const currentTeamObj = officialCard ? getTeam(officialCard.teamCode) : null;

  return (
    <div className={`rounded-2xl border p-4 ${
      status === "saved"
        ? "border-emerald-400/40 bg-emerald-400/10"
        : hasExisting
        ? "border-pink-300/30 bg-pink-400/10"
        : "border-white/10 bg-white/5"
    }`}>
      <div className="flex items-center gap-2 text-[13px] font-bold text-white">
        {status === "saved" || hasExisting ? (
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        ) : (
          <Shield className="h-4 w-4 text-white/40" />
        )}
        Official Fan Card
      </div>

      {hasExisting && status !== "saved" && (
        <div className="mt-2 rounded-xl bg-white/5 p-3 text-[12px]">
          <p className="font-bold text-white">{officialCard!.displayName}</p>
          <p className="mt-0.5 text-white/60">
            {currentIdentity?.emoji} {currentIdentity?.title}
            {" · "}
            {currentTeamObj?.flag} {currentTeamObj?.name}
          </p>
          <p className="mt-0.5 text-white/40">
            Template: {officialCard!.templateId}
          </p>
        </div>
      )}

      {status === "saved" && (
        <p className="mt-2 text-[12px] text-emerald-300">
          ✓ Official card saved successfully.
        </p>
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
            Official — update again
          </>
        ) : hasExisting ? (
          <>
            <Shield className="h-4 w-4" />
            Replace official card
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Make Official
          </>
        )}
      </button>

      {!hasExisting && status === "idle" && (
        <p className="mt-2 text-center text-[11px] text-white/40">
          One official card per account · used for rankings
        </p>
      )}
    </div>
  );
}
