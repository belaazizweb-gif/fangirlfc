"use client";

export type AnalyticsEvent =
  | "quiz_started"
  | "quiz_completed"
  | "card_generated"
  | "card_exported"
  | "compare_created"
  | "compare_completed"
  | "challenge_completed"
  | "sticker_waitlist_clicked";

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
