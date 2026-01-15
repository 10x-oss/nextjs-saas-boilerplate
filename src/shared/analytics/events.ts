// Central source of truth for analytics event identifiers.
// Defaults map to the canonical event IDs, while env vars allow
// ops to override without code changes.
export const ANALYTICS_EVENTS = Object.freeze({
  SIGN_UP: process.env.POSTHOG_SIGNUP_EVENT?.trim() || "sign_up",
  ONBOARDING_COMPLETE:
    process.env.POSTHOG_ACTIVATION_EVENT?.trim() || "onboarding_complete",
  START_TRIAL: "start_trial",
  FIRST_VALUE: "first_value",
  SUBSCRIBE: "subscribe",
  CANCEL: "cancel",

  // Freemium pricing events
  BOARD_LIMIT_REACHED: "board_limit_reached", // PQL - user hits 5-board limit
  FIRST_BOARD_CREATED: "first_board_created", // Activation event
  UPGRADE_PROMPT_SHOWN: "upgrade_prompt_shown",
  UPGRADE_CLICKED: "upgrade_clicked",
  BOARD_DELETED_TO_STAY_FREE: "board_deleted_to_stay_free",
} as const);

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
