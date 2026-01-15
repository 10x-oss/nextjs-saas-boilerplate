import { SubscriptionStatus } from "@prisma/client";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  customerId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string | null;
  priceId?: string | null;
  onboardingCompleted: boolean;
  hasLifetimeAccess: boolean;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionUser = {
  id: string;
  subscriptionStatus: SubscriptionStatus;
  name?: string | null;
  image?: string | null;
  uuid?: string;
  onboardingCompleted?: boolean;
  hasLifetimeAccess?: boolean;
  email?: string | null;
  plan?: string | null;
  createdAt?: string | null;
};
