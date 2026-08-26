/**
 * Client → analytics helpers (page views, etc.).
 * Unauthenticated ingest is intentional (ADR-0006).
 */

export type AnalyticsEventType =
  | "page_view"
  | "post_created"
  | "post_deleted"
  | "like_created"
  | "like_removed"
  | "follow_created"
  | "follow_removed";

function getAnalyticsUrl(): string {
  const base = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_ANALYTICS_URL is not set");
  }
  return base.replace(/\/$/, "");
}

export function getAnalyticsWsUrl(): string {
  const http = getAnalyticsUrl();
  if (http.startsWith("https://")) {
    return `${http.replace(/^https/, "wss")}/analytics/ws`;
  }
  return `${http.replace(/^http/, "ws")}/analytics/ws`;
}

export async function emitAnalyticsEvent(
  eventType: AnalyticsEventType,
  options: {
    userId?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    await fetch(`${getAnalyticsUrl()}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        user_id: options.userId ?? null,
        metadata: options.metadata ?? {},
      }),
    });
  } catch {
    // Demo: page analytics must not break the UI.
  }
}

export type AnalyticsEvent = {
  id: string;
  event_type: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
