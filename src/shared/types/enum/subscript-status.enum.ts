/**
 * Subscription status enum for Stripe billing
 * Note: Values must match Prisma SubscriptionStatus enum
 */
export enum SubscriptionStatus {
  active = "active",
  canceled = "canceled",
  incomplete = "incomplete",
  incomplete_expired = "incomplete_expired",
  past_due = "past_due",
  paused = "paused",
  trialing = "trialing",
  unpaid = "unpaid",
  expired = "expired",
  new = "new",
}
