// src/app/api/stripe/post-checkout/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { getToken, encode } from "next-auth/jwt";
import { getStripe } from "@/shared/utils/stripe.utils";
import Stripe from "stripe";
import prisma from "@/shared/utils/database.utils";
import authOptions from "@/shared/auth/authOptions"; // Corrected import path for authOptions
import { SubscriptionStatus } from "@prisma/client";
import { withMiddleware } from "@/app/api/_middleware";
import { getServerSession } from "next-auth";

// Ensure the runtime is Node.js, required for `encode` and DB access

/**
 * Handles the redirect back from Stripe Checkout.
 * 1. Verifies the Stripe Checkout session ID.
 * 2. Retrieves customer and subscription details.
 * 3. Updates the user's subscription status in the database.
 * 4. Encodes a new NextAuth JWT containing the updated subscription status.
 * 5. Sets the new JWT in an HttpOnly cookie.
 * 6. Redirects the user to the subscription success page.
 * This route acts as a 'cookie rotator' to prevent race conditions where middleware
 * might see a stale session token immediately after checkout.
 */
export const GET = withMiddleware(async (request: NextRequest) => {
  // Define baseUrl at the beginning to use in all redirects
  const baseUrl = process.env.BASE_URL!;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    console.error("[post-checkout] Missing session_id query parameter");
    return NextResponse.redirect(
      new URL("/error?message=Invalid checkout session", baseUrl)
    );
  }

  console.log(`[post-checkout] Received session_id: ${sessionId}`);

  try {
    const authSession = await getServerSession(authOptions);
    const sessionUserId = authSession?.user?.id as string | undefined;
    if (!sessionUserId) {
      console.warn("[post-checkout] No authenticated session found");
      const signinUrl = new URL("/api/auth/signin", baseUrl);
      signinUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signinUrl);
    }

    const stripe = getStripe();
    // 1. Fetch the Checkout Session from Stripe
    console.log(
      `[post-checkout] Retrieving session ${sessionId} from Stripe...`
    );
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "subscription", "customer"],
    });

    console.log(
      `[post-checkout] Session retrieved. Mode: ${checkoutSession.mode}, Status: ${checkoutSession.status}, Payment: ${checkoutSession.payment_status}`
    );

    // Detailed session validation with better error reporting
    if (!checkoutSession) {
      console.error(
        "[post-checkout] No checkout session returned from Stripe",
        { sessionId }
      );
      return NextResponse.redirect(
        new URL("/error?message=Could not verify payment", baseUrl)
      );
    }

    // Log full session for debugging (CAREFUL with PII in production)
    console.log(`[post-checkout] Full session inspection:`, {
      id: checkoutSession.id,
      mode: checkoutSession.mode,
      status: checkoutSession.status,
      payment_status: checkoutSession.payment_status,
      client_reference_id: checkoutSession.client_reference_id,
      hasCustomer: !!checkoutSession.customer,
      hasSubscription: !!checkoutSession.subscription,
    });

    if (!checkoutSession.customer) {
      console.error("[post-checkout] Missing customer in checkout session", {
        sessionId,
      });
      return NextResponse.redirect(
        new URL("/error?message=Customer information missing", baseUrl)
      );
    }

    // If subscription data is missing, we can still try to update the user's status
    // This is a common race condition - the checkout is complete but subscription data might
    // be processed asynchronously by Stripe in the webhook
    if (!checkoutSession.subscription) {
      console.log(
        "[post-checkout] Missing subscription in checkout session (common race condition)",
        { sessionId }
      );

      // Let's try to fetch the customer's subscriptions directly instead
      try {
        const stripeCustomerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : checkoutSession.customer.id;

        const checkoutUserId = checkoutSession.client_reference_id;
        if (!checkoutUserId) {
          console.error(
            "[post-checkout] Missing client_reference_id (userId) in checkout session"
          );
          return NextResponse.redirect(
            new URL("/stripe/processing-payment", baseUrl)
          );
        }
        if (checkoutUserId !== sessionUserId) {
          console.error(
            "[post-checkout] Authenticated user mismatch for checkout session",
            { checkoutUserId, sessionUserId }
          );
          return NextResponse.redirect(
            new URL("/error?message=Session mismatch during checkout", baseUrl)
          );
        }

        // Initialize request headers and cookies for getToken (moved up from below)
        const reqHeaders = new Headers(request.headers);
        const reqCookies = request.cookies;
        const rawReq = {
          headers: reqHeaders,
          cookies: reqCookies,
        } as unknown as NextRequest;

        // Attempt to lookup subscriptions for this customer as fallback
        const customerSubscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 1,
          status: "active",
        });

        // Log what we found
        console.log(
          `[post-checkout] Customer subscriptions check: ${customerSubscriptions.data.length} found`
        );

        if (customerSubscriptions.data.length > 0) {
          // Use the found subscription
          const subscription = customerSubscriptions.data[0];

          // Update the user record with active status - only using fields that exist in schema
          await prisma.user.update({
            where: { id: sessionUserId },
            data: {
              subscriptionStatus: "active",
              subscriptionId: subscription.id,
              // Note: do not add subscriptionEndDate - it doesn't exist in the schema
            },
          });

          console.log(
            `[post-checkout] Updated user ${sessionUserId} with active status based on customer subscription lookup`
          );

          // Continue to token rotation below with the manually found subscription
          const token = await getToken({ req: rawReq });
          if (!token) {
            return NextResponse.redirect(
              new URL("/stripe/processing-payment", baseUrl)
            );
          }

          // Create a fresh token with active status
          const newToken = await encode({
            token: { ...token, subscriptionStatus: "active" },
            secret: process.env.NEXTAUTH_SECRET!,
            maxAge: authOptions.session?.maxAge || 30 * 24 * 60 * 60,
          });

          // Set cookie and redirect
          const response = NextResponse.redirect(
            new URL("/stripe/processing-payment", baseUrl)
          );
          response.cookies.set("next-auth.session-token", newToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: authOptions.session?.maxAge || 30 * 24 * 60 * 60,
          });

          return response;
        }

        // If we couldn't find a subscription, let the stripe/processing-payment page handle it
        console.log(
          "[post-checkout] No active subscriptions found for customer, redirecting to processing page"
        );
        return NextResponse.redirect(
          new URL("stripe/processing-payment", request.url)
        );
      } catch (subscriptionError) {
        console.error(
          "[post-checkout] Error fetching customer subscriptions:",
          subscriptionError
        );
        // Continue to processing page
        return NextResponse.redirect(
          new URL("/stripe/processing-payment", baseUrl)
        );
      }
    }

    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer.id;
    const subscription = checkoutSession.subscription as Stripe.Subscription;
    const price = checkoutSession.line_items?.data[0]?.price as
      | Stripe.Price
      | undefined;
    // const product = price?.product as Stripe.Product | undefined; // Product details might not be needed here
    const checkoutUserId = checkoutSession.client_reference_id; // Assumes client_reference_id is set to user.id during checkout creation

    if (!checkoutUserId) {
      console.error(
        "[post-checkout] Missing client_reference_id (userId) in checkout session",
        { checkoutSessionId: sessionId }
      );
      // Redirect to an error page, maybe offer support?
      return NextResponse.redirect(
        new URL(
          "/error?message=User identification failed during checkout processing",
          baseUrl
        )
      );
    }

    if (checkoutUserId !== sessionUserId) {
      console.error(
        "[post-checkout] Authenticated user mismatch during checkout processing",
        { checkoutUserId, sessionUserId }
      );
      return NextResponse.redirect(
        new URL(
          "/error?message=Session mismatch during payment processing",
          baseUrl
        )
      );
    }

    console.log(
      `[post-checkout] Processing checkout for User ID: ${sessionUserId}, Customer ID: ${customerId}, Subscription ID: ${subscription.id}`
    );

    // 2. & 3. Look up User and Update DB
    // Use the subscription status directly from Stripe
    const stripeSubStatus = subscription.status; // e.g., 'active', 'incomplete', 'past_due'
    // Map Stripe status to our internal enum
    let dbSubStatus: SubscriptionStatus;
    switch (stripeSubStatus) {
      case "active":
        dbSubStatus = SubscriptionStatus.active;
        break;
      case "past_due":
        dbSubStatus = SubscriptionStatus.past_due;
        break;
      case "canceled":
        dbSubStatus = SubscriptionStatus.canceled;
        break;
      case "unpaid": // Map Stripe 'unpaid' (payment failed) to our 'past_due' status
        dbSubStatus = SubscriptionStatus.past_due;
        break;
      case "incomplete": // User started checkout but didn't complete payment
      case "incomplete_expired":
        dbSubStatus = SubscriptionStatus.incomplete;
        break;
      default:
        console.warn(
          `[post-checkout] Unhandled Stripe subscription status: ${stripeSubStatus}. Defaulting to 'active'.`
        );
        dbSubStatus = SubscriptionStatus.active; // Default to active for successful checkouts
    }

    // --- Update User Record in Database ---
    // NOTE: This write might be redundant if the webhook is processed first,
    // but it ensures immediate consistency for the user's session after checkout.
    // The webhook handler provides eventual consistency.
    const updatedUser = await prisma.user.update({
      where: { id: sessionUserId },
      data: {
        subscriptionStatus: dbSubStatus,
        subscriptionId: subscription.id,
        priceId: price?.id, // Store the price ID for reference
      },
      select: { id: true, email: true, subscriptionStatus: true, uuid: true }, // Select necessary fields for token
    });

    console.log(
      `[post-checkout] DB updated for user ${sessionUserId}. New status: ${dbSubStatus}`
    );

    // 4. Clone payload from existing JWT & add new subscriptionStatus
    // getToken requires the raw request or cookies
    const reqHeaders = new Headers(request.headers);
    const reqCookies = request.cookies;
    const rawReq = {
      headers: reqHeaders,
      cookies: reqCookies,
    } as unknown as NextRequest;

    const currentTokenPayload = await getToken({ req: rawReq });

    if (!currentTokenPayload) {
      // This case should be rare if user just completed checkout, but handle defensively
      console.error(
        `[post-checkout] Failed to retrieve existing JWT for user ${sessionUserId} after checkout. Cannot rotate token.`
      );
      // Redirect to success page anyway; session should establish on next load via standard callback
      return NextResponse.redirect(
        new URL("/stripe/processing-payment", baseUrl)
      );
    }

    // Update the payload with the confirmed subscription status
    const newPayload = {
      ...currentTokenPayload,
      subscriptionStatus: dbSubStatus, // *** This is the crucial update ***
      // Optionally add/update other relevant fields derived from checkout
      // Example: might want to update `onboardingCompleted` or similar flags
      // Keep existing `sub`, `id`, `email`, `uuid` etc. from currentTokenPayload
    };

    // 5. Encode a new JWT
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error(
        "[post-checkout] FATAL: NEXTAUTH_SECRET environment variable is not set."
      );
      return NextResponse.redirect(
        new URL("/error?message=Server configuration error", baseUrl)
      );
    }

    const maxAge = authOptions.session?.maxAge || 30 * 24 * 60 * 60; // Use maxAge from authOptions

    const newToken = await encode({
      token: newPayload,
      secret: secret,
      maxAge,
    });

    console.log(`[post-checkout] New JWT encoded for user ${sessionUserId}`);

    // 6. & 7. Set Cookie and Redirect
    const redirectUrl = new URL("/stripe/processing-payment", baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("next-auth.session-token", newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production", // Ensure secure flag is set appropriately
      maxAge: maxAge,
    });

    console.log(
      `[post-checkout] Set-Cookie header added. Redirecting user ${sessionUserId} to ${redirectUrl.pathname}`
    );
    return response;
  } catch (error: any) {
    console.error("[post-checkout] Error processing Stripe callback:", {
      sessionId,
      message: error.message,
      stack: error.stack,
    });
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during payment processing.";
    // Avoid exposing sensitive details in the URL
    return NextResponse.redirect(
      new URL(
        `/error?message=Payment processing failed. Please contact support if the issue persists.`,
        baseUrl
      )
    );
  }
});
