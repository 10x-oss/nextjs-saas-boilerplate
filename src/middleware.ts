import { NextRequest, NextResponse } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { SessionUser } from "@/shared/types/user.types";
import { SubscriptionStatus } from "@/shared/types/enum/subscript-status.enum";

type CustomToken = SessionUser & JWT;

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/blog",
  "/contact",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
  "/try",
  "/demo",
];
// Explicit allowlist for paths that should always bypass auth gating
// This prevents accidental rewrites/redirects blocking app shells from mounting
const ALLOW_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
  "/realtime",
  "/api/realtime/token",
  "/api/auth",
  // Allow public embed proxy endpoints (e.g., Reddit widgets) for shared pages
  "/api/embed",
  "/api/public",
  "/api/mcp", // MCP server handles its own JWT authentication
  "/assets",
  "/logo.png",
  "/app/", // allow canvas pages to render; gate via token route instead
  "/share", // public shared pages and embed
  // Analytics + monitoring collectors tunnel through Next rewrites
  "/ingest",
  "/monitoring",
  "/collect",
];
// Define routes that should bypass strict subscription checks
const BYPASS_SUBSCRIPTION_CHECK_ROUTES = [
  "/api/stripe/post-checkout",
  "/stripe/processing-payment",
  "/api/user/subscription-status", // Allow direct DB checks for subscription status
  "/api/user/delete", // Allow account deletion regardless of subscription status
  "/stripe/trial-offer",
  "/stripe/subscription-expired",
];

export async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const envBaseUrl =
    process.env.BASE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;
  const baseUrl = envBaseUrl || request.nextUrl.origin;

  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as CustomToken | null;

  // Always allow the explicitly permitted prefixes (including the canvas pages under /app/)
  if (ALLOW_PREFIXES.some((p) => currentPath.startsWith(p))) {
    return NextResponse.next();
  }

  if (token?.id && currentPath === "/") {
    return NextResponse.redirect(new URL("/home", baseUrl));
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
  const isNextAuthRoute = currentPath.startsWith("/api/auth");
  const isTokenRoute = currentPath === "/api/auth/token";
  const isRealtimeWs = currentPath.startsWith("/realtime");
  const isRealtimeHealth = currentPath.startsWith("/health-realtime");
  const isStripeWebhook =
    currentPath === "/api/stripe/webhook" ||
    currentPath === "/api/webhook/stripe";
  const isCreateCheckoutSession =
    currentPath === "/api/stripe/create-checkout-session";

  const shouldBypassSubscriptionCheck = BYPASS_SUBSCRIPTION_CHECK_ROUTES.some(
    (route) => currentPath.startsWith(route)
  );

  if (
    isPublicRoute ||
    isNextAuthRoute ||
    isTokenRoute ||
    isRealtimeWs ||
    isRealtimeHealth ||
    isStripeWebhook ||
    isCreateCheckoutSession ||
    shouldBypassSubscriptionCheck
  ) {
    return NextResponse.next();
  }

  if (token?.id) {
    // Lifetime access users bypass all subscription checks
    if (token.hasLifetimeAccess) {
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/home", baseUrl));
      }
      return NextResponse.next();
    }

    const subscriptionStatus = token.subscriptionStatus as SubscriptionStatus;

    if (isCreateCheckoutSession) {
      return NextResponse.next();
    }

    const statusRedirects: Record<
      SubscriptionStatus,
      { condition: boolean; url: string }
    > = {
      [SubscriptionStatus.new]: {
        condition: isPublicRoute,
        url: "/home",
      },
      [SubscriptionStatus.active]: {
        condition: isPublicRoute,
        url: "/home",
      },
      [SubscriptionStatus.trialing]: {
        condition: isPublicRoute,
        url: "/home",
      },
      [SubscriptionStatus.expired]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.canceled]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.past_due]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.incomplete]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.incomplete_expired]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.paused]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
      [SubscriptionStatus.unpaid]: {
        condition: !currentPath.startsWith("/stripe/subscription-expired"),
        url: "/stripe/subscription-expired",
      },
    };

    const statusRedirect = statusRedirects[subscriptionStatus];

    if (statusRedirect?.condition) {
      const targetUrl = new URL(statusRedirect.url, baseUrl);
      console.log(
        `[middleware] Auth user with subscription "${subscriptionStatus}" is being redirected from "${currentPath}" to "${targetUrl}"`
      );
      return NextResponse.redirect(targetUrl);
    }
  } else if (!isPublicRoute) {
    const targetUrl = new URL("/", baseUrl);
    console.log(
      `[middleware] Unauthenticated user tried to access "${currentPath}". Redirecting to "${targetUrl}".`
    );
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    // Exclude websocket gateway path to avoid blocking upgrades
    "/((?!realtime|health-realtime|api/auth/token|api/auth|api/mcp|api/stripe/webhook|api/webhook/stripe|ingest|monitoring|collect|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
