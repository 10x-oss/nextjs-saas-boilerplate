/**
 * Client-side instrumentation for PostHog analytics
 */
import posthogLib, { type PostHog } from "posthog-js";

let isInitialized = false;

export const posthog: PostHog = posthogLib;

export function initPosthog(): boolean {
  if (typeof window === "undefined") return false;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  posthogLib.init(key, {
    api_host: host,
    capture_pageview: false, // We handle this manually
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    bootstrap: {
      distinctID: undefined,
    },
  });

  isInitialized = true;
  return true;
}
