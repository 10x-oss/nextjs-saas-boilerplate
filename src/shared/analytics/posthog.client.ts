'use client';

import { initPosthog, posthog } from "../../../instrumentation-client";
import { ANALYTICS_EVENTS } from "./events";
import type { AnalyticsEventName } from "./events";

type IdentifyPayload = {
  id: string;
  email?: string | null;
  plan?: string | null;
  createdAt?: string | null;
};

type EventProperties = Record<string, unknown>;

function ensurePosthogReady() {
  if (typeof window === "undefined") return false;
  return initPosthog();
}

function sanitize<T extends EventProperties>(properties?: T) {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null
    )
  );
}

export function identifyUser(payload: IdentifyPayload) {
  if (!payload.id) return;
  if (!ensurePosthogReady()) return;

  const distinctId = posthog.get_distinct_id();
  if (distinctId && distinctId !== payload.id) {
    posthog.alias(payload.id);
  }

  posthog.identify(
    payload.id,
    sanitize({
      email: payload.email || undefined,
      plan: payload.plan || undefined,
      createdAt: payload.createdAt || undefined,
    })
  );
}

export function captureEvent(
  event: AnalyticsEventName | string,
  properties?: EventProperties
) {
  if (!event) return;
  if (!ensurePosthogReady()) return;

  posthog.capture(event, sanitize(properties));
}

export function captureSignUp(plan?: string | null, ref?: string | null) {
  captureEvent(ANALYTICS_EVENTS.SIGN_UP, sanitize({ plan, ref }));
}

export function captureOnboardingComplete(variant?: string | null) {
  captureEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, sanitize({ variant }));
}

export function captureFirstValue(
  surface: string,
  timeToValueMs?: number | null
) {
  if (!surface) return;
  captureEvent(
    ANALYTICS_EVENTS.FIRST_VALUE,
    sanitize({
      surface,
      time_to_value_ms: timeToValueMs ?? undefined,
    })
  );
}
