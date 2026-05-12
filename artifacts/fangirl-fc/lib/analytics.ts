"use client";

export type AnalyticsEvent =
  | "quiz_started"
  | "quiz_completed"
  | "card_generated"
  | "card_exported"
  | "compare_created"
  | "compare_completed"
  | "challenge_completed"
  | "sticker_waitlist_clicked"
  | "photo_adjust_changed"
  | "share_target_selected"
  | "compare_mode_created"
  | "compare_mode_opened"
  | "social_challenge_completed"
  // Matchday + groups + viral modules
  | "matchday_opened"
  | "match_selected"
  | "prediction_made"
  | "group_created"
  | "group_member_added"
  | "group_ranking_exported"
  | "worldwide_battle_viewed"
  | "story_caption_copied"
  | "callout_created"
  | "callout_exported"
  | "penalty_cta_clicked"
  | "iq_cta_clicked"
  | "share_card_viewed"
  | "share_card_saved";

export function trackEvent(
  name: AnalyticsEvent,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  // Placeholder analytics: console only for now.
  // Replace with PostHog / GA / etc. later without changing call sites.
  // eslint-disable-next-line no-console
  console.log("[fangirl-fc:analytics]", name, payload);
}
