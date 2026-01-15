"use client";

export type GAEvent = {
  name:
    | "hero_try_free_clicked"
    | "hero_watch_demo_clicked"
    | "pricing_viewed"
    | "subscribe_submitted"
    | "comparison_expand";
  params?: Record<string, string>;
};

export function trackEvent(evt: GAEvent) {
  try {
    if (typeof window !== "undefined") {
      window.gtag?.("event", evt.name, evt.params || {});
    }
  } catch {
    // no-op
  }
}

export function logEvent(name: string, params?: Record<string, string>) {
  try {
    if (typeof window !== "undefined") {
      window.gtag?.("event", name, params || {});
    }
  } catch {
    // no-op
  }
}
