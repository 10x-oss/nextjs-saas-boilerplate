// src/shared/auth/authOptions.ts

import { AuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/shared/utils/database.utils";
import { getStripe } from "@/shared/utils/stripe.utils";
import Stripe from "stripe";
import { capturePosthogEvent, flushPosthog } from "@/lib/posthog/server";
import { ANALYTICS_EVENTS } from "@/shared/analytics/events";

/**
 * Custom adapter that wraps PrismaAdapter to handle orphaned users
 * The standard PrismaAdapter creates User and Account in separate calls,
 * which can leave orphaned users if Account creation fails.
 * This wrapper cleans up orphaned users before allowing new sign-ups.
 */
function createSafeAdapter(): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    // Override linkAccount to clean up orphaned users before linking
    async linkAccount(account) {
      console.log("[Auth] linkAccount started for user:", account.userId);
      // First, check if user exists but has no accounts (orphaned)
      const existingUser = await prisma.user.findUnique({
        where: { id: account.userId },
        include: { accounts: true },
      });

      // If user exists with no accounts, they're orphaned from a previous failed attempt
      // The base adapter will handle creating the account link
      if (existingUser && existingUser.accounts.length === 0) {
        console.log(
          `[Auth] User ${account.userId} has no linked accounts, proceeding with account link`
        );
      }

      // Call the original linkAccount
      console.log("[Auth] Calling base linkAccount...");
      const result = await baseAdapter.linkAccount!(account);
      console.log("[Auth] linkAccount complete");
      return result;
    },

    // Override getUserByEmail to detect and clean orphaned users
    async getUserByEmail(email) {
      const user = await baseAdapter.getUserByEmail!(email);

      if (user) {
        // Check if this user has any linked accounts
        const accountCount = await prisma.account.count({
          where: { userId: user.id },
        });

        // If user exists but has no accounts, delete the orphaned user
        // This allows a fresh User + Account to be created
        if (accountCount === 0) {
          console.warn(
            `[Auth] Detected orphaned user ${user.id} (${email}) with no linked accounts - deleting to allow fresh registration`
          );
          await prisma.user.delete({
            where: { id: user.id },
          });
          // Return null so adapter creates a new user
          return null;
        }
      }

      return user;
    },
  };
}

/**
 * Next‑Auth configuration
 * – Google provider only (email login removed)
 * – Creates a Stripe Customer on user creation
 * – Embeds `subscriptionStatus`, `uuid`, `email` in the JWT so the client
 *   can react without extra DB queries
 */

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  // ──────────────────────────────────── Providers ──────────────────────────────
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  // ──────────────────────────────────── Adapter ────────────────────────────────
  adapter: createSafeAdapter(),

  // ──────────────────────────────────── Events ─────────────────────────────────
  events: {
    async createUser({ user }) {
      console.log("[Auth] createUser event started for:", user.email);
      const stripe = getStripe();
      console.log("[Auth] Stripe instance obtained");

      const email = user.email ?? undefined;
      const displayName = user.name || email?.split("@")[0] || "";

      let customer = null;
      if (email) {
        console.log("[Auth] Searching for existing Stripe customer...");
        const existing = await stripe.customers.list({
          email,
          limit: 1,
        });
        console.log("[Auth] Stripe customer search complete");
        const activeCustomer = existing.data.find(
          (entry): entry is Stripe.Customer =>
            !("deleted" in entry)
        );
        customer = activeCustomer ?? null;
      }

      if (!customer) {
        console.log("[Auth] Creating new Stripe customer...");
        customer = await stripe.customers.create({
          email,
          name: displayName,
          metadata: { internalUserId: user.id },
        });
        console.log("[Auth] Stripe customer created:", customer.id);
      } else if (!customer.metadata?.internalUserId) {
        console.log("[Auth] Updating existing Stripe customer...");
        await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            internalUserId: customer.metadata?.internalUserId ?? user.id,
          },
        });
        console.log("[Auth] Stripe customer updated");
      }

      console.log("[Auth] Updating user in database...");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          customerId: customer.id,
          subscriptionStatus: "new",
          onboardingCompleted: false,
          name: displayName,
          image: user.image || null,
          subscriptionId: null,
          priceId: null,
        },
      });
      console.log("[Auth] User updated in database");

      // Fire and forget analytics - don't await, don't block auth flow
      // Using setTimeout to ensure this doesn't block the OAuth callback
      setTimeout(async () => {
        try {
          await capturePosthogEvent({
            distinctId: user.id,
            event: ANALYTICS_EVENTS.SIGN_UP,
            properties: {
              plan: "free",
              email,
            },
          });
          await flushPosthog();
        } catch (error) {
          console.error("[Auth] PostHog analytics failed:", error);
        }
      }, 0);

      console.log("[Auth] createUser event COMPLETE");
    },
  },

  // ─────────────────────────────────── Callbacks ───────────────────────────────
  callbacks: {
    /**
     * JWT callback
     * – enriches token with DB info on sign-in or when data is missing
     * – use `trigger: "update"` to force refresh (e.g., after subscription change)
     */
    async jwt({ token, user, account, trigger }) {
      // On sign‑in or sign‑up, attach user info and fetch from DB
      const isSignIn = !!user;
      // Check if token is missing required fields (needs DB fetch)
      const needsDbFetch = token.sub && (!token.uuid || token.subscriptionStatus === undefined);
      // Also refresh on explicit update trigger (e.g., after subscription change)
      const isUpdate = trigger === "update";

      if (user) {
        token.sub = user.id;
        token.id = user.id;
        if (user.email) token.email = user.email;
      }

      // Only fetch from DB on sign-in, missing data, or explicit update
      if (token.sub && (isSignIn || needsDbFetch || isUpdate)) {
        console.log("[Auth] JWT: fetching user from DB (reason:", isSignIn ? "sign-in" : isUpdate ? "update" : "missing-data", ")");
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            uuid: true,
            subscriptionStatus: true,
            email: true,
            hasLifetimeAccess: true,
          },
        });
        if (dbUser) {
          token.uuid = dbUser.uuid;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.hasLifetimeAccess = dbUser.hasLifetimeAccess;
          if (!token.email && dbUser.email) token.email = dbUser.email;
        }
      }

      return token;
    },

    /**
     * Session callback
     * – Expose non‑sensitive fields to the client
     */
    async session({ session, token }) {
      const userId = token.sub || token.id;
      if (!userId) throw new Error("No user ID in token");

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionStatus: true,
          customerId: true,
          onboardingCompleted: true,
          hasLifetimeAccess: true,
          name: true,
          image: true,
          uuid: true,
          email: true,
          priceId: true,
          createdAt: true,
        },
      });
      if (!dbUser) throw new Error("Invalid user state");

      let customerId = dbUser.customerId;
      if (!customerId) {
        const stripe = getStripe();
        const email = dbUser.email || (token.email as string | undefined);
        let customer: Stripe.Customer | null = null;

        if (email) {
          const existing = await stripe.customers.list({ email, limit: 1 });
          const activeCustomer = existing.data.find(
            (entry): entry is Stripe.Customer => !("deleted" in entry)
          );
          customer = activeCustomer ?? null;
        }

        if (!customer) {
          customer = await stripe.customers.create({
            email,
            metadata: { internalUserId: userId as string },
          });
        } else if (!customer.metadata?.internalUserId) {
          await stripe.customers.update(customer.id, {
            metadata: {
              ...customer.metadata,
              internalUserId: customer.metadata?.internalUserId ?? (userId as string),
            },
          });
        }

        await prisma.user.update({
          where: { id: userId },
          data: { customerId: customer.id },
        });

        customerId = customer.id;
      }

      session.user = {
        id: userId as string,
        name: dbUser.name,
        image: dbUser.image,
        subscriptionStatus: dbUser.subscriptionStatus,
        uuid: dbUser.uuid,
        onboardingCompleted: dbUser.onboardingCompleted,
        hasLifetimeAccess: dbUser.hasLifetimeAccess,
        email: dbUser.email ?? (token.email as string | undefined) ?? null,
        plan:
          dbUser.hasLifetimeAccess || dbUser.subscriptionStatus === "active"
            ? "paid"
            : "free",
        createdAt: dbUser.createdAt?.toISOString() ?? null,
      };

      return session;
    },
  },

  // ─────────────────────────────────── Session ────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 5 * 60, // refresh JWT every 5 minutes
  },

  // ─────────────────────────────────── Cookies ────────────────────────────────
  cookies: {
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export default authOptions;
