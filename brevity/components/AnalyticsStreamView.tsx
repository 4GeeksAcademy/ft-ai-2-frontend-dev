"use client";

import { useEffect, useRef, useState } from "react";

import { Navbar } from "@/components/Navbar";
import {
  getAnalyticsWsUrl,
  type AnalyticsEvent,
} from "@/lib/analytics";

const MAX_EVENTS = 100;

export function AnalyticsStreamView() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );
  const [error, setError] = useState<string | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    let ws: WebSocket | null = null;
    let cancelled = false;
    let retryTimer: number | undefined;

    function connect() {
      if (cancelled) {
        return;
      }
      setStatus("connecting");
      setError(null);
      try {
        ws = new WebSocket(getAnalyticsWsUrl());
      } catch (err) {
        setStatus("closed");
        setError(err instanceof Error ? err.message : "WebSocket failed");
        return;
      }

      ws.onopen = () => {
        if (!cancelled) {
          setStatus("open");
        }
      };
      ws.onmessage = (message) => {
        try {
          const data = JSON.parse(String(message.data)) as AnalyticsEvent;
          if (!data?.id || seen.current.has(data.id)) {
            return;
          }
          seen.current.add(data.id);
          setEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
        } catch {
          // ignore malformed frames
        }
      };
      ws.onerror = () => {
        if (!cancelled) {
          setError("WebSocket error");
        }
      };
      ws.onclose = () => {
        if (cancelled) {
          return;
        }
        setStatus("closed");
        retryTimer = window.setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      ws?.close();
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            Analytics stream
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Live events from the analytics WebSocket — not a social feed.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Status:{" "}
            <span className="text-zinc-300">
              {status}
              {error ? ` (${error})` : ""}
            </span>
          </p>
        </div>

        {events.length === 0 ? (
          <p className="py-8 text-sm text-zinc-500">
            Waiting for events… create a post or like something in another tab.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800 border border-zinc-800">
            {events.map((event) => (
              <li key={event.id} className="px-4 py-3 font-mono text-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-zinc-100">{event.event_type}</span>
                  <span className="text-zinc-500">{event.created_at}</span>
                </div>
                <p className="mt-1 text-zinc-500">
                  user={event.user_id ?? "null"}
                </p>
                <pre className="mt-1 overflow-x-auto text-zinc-400">
                  {JSON.stringify(event.metadata)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
