import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

// ─── Static team data (mirrors lib/teams.ts — kept in sync manually) ─────────

interface TeamDef { name: string; flag: string }

const TEAMS_MAP: Record<string, TeamDef> = {
  ARG: { name: "Argentina",      flag: "🇦🇷" },
  AUS: { name: "Australia",      flag: "🇦🇺" },
  BEL: { name: "Belgium",        flag: "🇧🇪" },
  BRA: { name: "Brazil",         flag: "🇧🇷" },
  CAN: { name: "Canada",         flag: "🇨🇦" },
  CMR: { name: "Cameroon",       flag: "🇨🇲" },
  CHL: { name: "Chile",          flag: "🇨🇱" },
  COL: { name: "Colombia",       flag: "🇨🇴" },
  CRC: { name: "Costa Rica",     flag: "🇨🇷" },
  CRO: { name: "Croatia",        flag: "🇭🇷" },
  DEN: { name: "Denmark",        flag: "🇩🇰" },
  ECU: { name: "Ecuador",        flag: "🇪🇨" },
  EGY: { name: "Egypt",          flag: "🇪🇬" },
  ENG: { name: "England",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  FRA: { name: "France",         flag: "🇫🇷" },
  GER: { name: "Germany",        flag: "🇩🇪" },
  GHA: { name: "Ghana",          flag: "🇬🇭" },
  ISL: { name: "Iceland",        flag: "🇮🇸" },
  IRN: { name: "Iran",           flag: "🇮🇷" },
  ITA: { name: "Italy",          flag: "🇮🇹" },
  CIV: { name: "Ivory Coast",    flag: "🇨🇮" },
  JAM: { name: "Jamaica",        flag: "🇯🇲" },
  JPN: { name: "Japan",          flag: "🇯🇵" },
  MEX: { name: "Mexico",         flag: "🇲🇽" },
  MAR: { name: "Morocco",        flag: "🇲🇦" },
  NED: { name: "Netherlands",    flag: "🇳🇱" },
  NZL: { name: "New Zealand",    flag: "🇳🇿" },
  NGA: { name: "Nigeria",        flag: "🇳🇬" },
  NOR: { name: "Norway",         flag: "🇳🇴" },
  PAN: { name: "Panama",         flag: "🇵🇦" },
  PAR: { name: "Paraguay",       flag: "🇵🇾" },
  PER: { name: "Peru",           flag: "🇵🇪" },
  POL: { name: "Poland",         flag: "🇵🇱" },
  POR: { name: "Portugal",       flag: "🇵🇹" },
  QAT: { name: "Qatar",          flag: "🇶🇦" },
  KSA: { name: "Saudi Arabia",   flag: "🇸🇦" },
  SCO: { name: "Scotland",       flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  SEN: { name: "Senegal",        flag: "🇸🇳" },
  SRB: { name: "Serbia",         flag: "🇷🇸" },
  KOR: { name: "South Korea",    flag: "🇰🇷" },
  ESP: { name: "Spain",          flag: "🇪🇸" },
  SWE: { name: "Sweden",         flag: "🇸🇪" },
  SUI: { name: "Switzerland",    flag: "🇨🇭" },
  TUN: { name: "Tunisia",        flag: "🇹🇳" },
  TUR: { name: "Turkey",         flag: "🇹🇷" },
  URU: { name: "Uruguay",        flag: "🇺🇾" },
  USA: { name: "United States",  flag: "🇺🇸" },
  WAL: { name: "Wales",          flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
};

const VALID_TEAM_CODES = new Set(Object.keys(TEAMS_MAP));

// ─── Star action allowlist ─────────────────────────────────────────────────────

interface ActionDef {
  stars: number;
  xp: number;
  once: boolean;
  maxCount?: number;
}

const OFFICIAL_ACTIONS: Record<string, ActionDef> = {
  publish_official_card: { stars: 0.5,  xp: 50, once: true               },
  replace_official_card: { stars: 0.25, xp: 25, once: false, maxCount: 3 },
  share_official_card:   { stars: 0.5,  xp: 50, once: true               },
  complete_profile:      { stars: 0.5,  xp: 50, once: true               },
};

// ─── Return type ──────────────────────────────────────────────────────────────

interface AwardFnResult {
  awarded: boolean;
  action: string;
  starsDelta: number;
  xpDelta: number;
  officialStars: number;
  officialXp: number;
  rankScore: number;
  reason?: string;
}

// ─── awardOfficialStarsSecure ─────────────────────────────────────────────────
// Callable v2 Cloud Function — the single trusted path for official progression.
//
// Write order:
//   1. Firestore transaction: users/{uid} + teams/{teamCode} (atomic)
//   2. Firestore write:       leaderboard/{uid}              (after-commit)
//
// Never trusts any value from the client. All deltas computed server-side.

export const awardOfficialStarsSecure = onCall(
  { region: "us-central1" },
  async (request): Promise<AwardFnResult> => {
    // ── Auth guard ──────────────────────────────────────────────────────────
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Must be signed in.");
    }

    // ── Action validation ───────────────────────────────────────────────────
    const { action } = request.data as { action?: string };
    if (!action || typeof action !== "string") {
      throw new HttpsError("invalid-argument", "Missing action.");
    }
    const def = OFFICIAL_ACTIONS[action];
    if (!def) {
      throw new HttpsError("invalid-argument", `Unknown action: ${action}`);
    }

    // ── Firestore transaction: users/{uid} + teams/{teamCode} ───────────────
    interface TxResult {
      awarded: boolean;
      newStars: number;
      newXp: number;
      newRankScore: number;
      teamCode: string | null;
      officialCard: Record<string, unknown> | null;
      displayName: string;
      photoURL: string | null;
    }

    const txResult = await db.runTransaction<TxResult>(async (tx) => {
      // ── READS (all before writes) ─────────────────────────────────────────
      const userRef  = db.collection("users").doc(uid);
      const userSnap = await tx.get(userRef);

      if (!userSnap.exists) {
        throw new HttpsError(
          "not-found",
          "User profile not found. Publish your official card first.",
        );
      }

      const data           = userSnap.data()!;
      const currentStars   = (data["officialStars"]   as number) ?? 0;
      const currentXp      = (data["officialXp"]      as number) ?? 0;
      const currentActions = (data["officialStarActions"] as Record<string, number>) ?? {};
      const actionCount    = currentActions[action] ?? 0;
      const teamCode       = (data["officialTeamCode"] as string) ?? null;

      // ── Eligibility ───────────────────────────────────────────────────────
      if (def.once && actionCount >= 1) {
        return {
          awarded: false, newStars: currentStars, newXp: currentXp,
          newRankScore: currentXp + currentStars * 100,
          teamCode, officialCard: null, displayName: "", photoURL: null,
        };
      }
      if (!def.once && def.maxCount !== undefined && actionCount >= def.maxCount) {
        return {
          awarded: false, newStars: currentStars, newXp: currentXp,
          newRankScore: currentXp + currentStars * 100,
          teamCode, officialCard: null, displayName: "", photoURL: null,
        };
      }

      // ── Conditionally read team doc ───────────────────────────────────────
      const validTeam = teamCode !== null && VALID_TEAM_CODES.has(teamCode);
      let teamData: FirebaseFirestore.DocumentData = {};
      if (validTeam) {
        const teamSnap = await tx.get(db.collection("teams").doc(teamCode!));
        teamData = teamSnap.exists ? (teamSnap.data() ?? {}) : {};
      }

      // ── Compute deltas ────────────────────────────────────────────────────
      const newStars     = Math.round((currentStars + def.stars) * 100) / 100;
      const newXp        = currentXp + def.xp;
      const newRankScore = newXp + newStars * 100;
      const newActions   = { ...currentActions, [action]: actionCount + 1 };

      // ── Write users/{uid} ─────────────────────────────────────────────────
      tx.set(
        userRef,
        {
          officialStars:       newStars,
          officialXp:          newXp,
          rankScore:           newRankScore,
          officialStarActions: newActions,
          updatedAt:           FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // ── Write teams/{teamCode} ────────────────────────────────────────────
      if (validTeam) {
        const teamDef    = TEAMS_MAP[teamCode!]!;
        const prevStars  = (teamData["totalStars"] as number) ?? 0;
        const prevXp     = (teamData["totalXp"]    as number) ?? 0;
        const memberCount = (teamData["memberCount"] as number) ?? 0;
        const newTotalStars = Math.round((prevStars + def.stars) * 100) / 100;
        const newTotalXp    = prevXp + def.xp;

        tx.set(
          db.collection("teams").doc(teamCode!),
          {
            teamCode:   teamCode!,
            teamName:   teamDef.name,
            flag:       teamDef.flag,
            totalStars: newTotalStars,
            totalXp:    newTotalXp,
            rankScore:  newTotalXp + newTotalStars * 100,
            memberCount,
            updatedAt:  FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      return {
        awarded: true,
        newStars,
        newXp,
        newRankScore,
        teamCode,
        officialCard: (data["officialCard"] as Record<string, unknown>) ?? null,
        displayName:  (data["displayName"]  as string) ?? "",
        photoURL:     (data["photoURL"]     as string | null) ?? null,
      };
    });

    // ── Write leaderboard/{uid} (after-commit, best-effort) ─────────────────
    // If this write fails, the transaction result is still correct.
    // A scheduled function or client refresh can repair leaderboard later.
    if (txResult.awarded) {
      const card = txResult.officialCard;
      await db
        .collection("leaderboard")
        .doc(uid)
        .set(
          {
            uid,
            displayName:             txResult.displayName,
            photoURL:                txResult.photoURL ?? null,
            officialStars:           txResult.newStars,
            officialXp:              txResult.newXp,
            rankScore:               txResult.newRankScore,
            officialTeamCode:        txResult.teamCode ?? null,
            officialCardIdentityId:  (card?.["identityId"]  as string) ?? null,
            officialCardDisplayName: (card?.["displayName"] as string) ?? null,
            updatedAt:               FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    }

    // ── Return safe result ───────────────────────────────────────────────────
    if (!txResult.awarded) {
      return {
        awarded:      false,
        action,
        starsDelta:   0,
        xpDelta:      0,
        officialStars: txResult.newStars,
        officialXp:   txResult.newXp,
        rankScore:    txResult.newRankScore,
        reason:       "already_awarded",
      };
    }

    return {
      awarded:      true,
      action,
      starsDelta:   def.stars,
      xpDelta:      def.xp,
      officialStars: txResult.newStars,
      officialXp:   txResult.newXp,
      rankScore:    txResult.newRankScore,
    };
  },
);
