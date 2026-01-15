/* ---------------------------------------------------------------------
 * Route:  /stripe/post-portal          (App Router)
 * Purpose: Force-refresh the NextAuth session after returning from
 *          Stripe Billing Portal and redirect back to the original page.
 * -------------------------------------------------------------------- */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PostPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, update } = useSession();
  const [statusMessage, setStatusMessage] = useState("Refreshing your session...");

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    const refreshAndRedirect = async () => {
      try {
        setStatusMessage("Updating session...");
        // Force refresh the session to get updated subscription status
        await update();

        if (cancelled) return;

        setStatusMessage("Redirecting...");

        // Get the return URL from query params, default to /home
        const returnTo = searchParams.get("returnTo") || "/home";

        // Validate return URL is relative (security)
        const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/home";

        router.replace(safeReturnTo);
      } catch (error) {
        console.error("[post-portal] Error refreshing session:", error);
        // Still redirect even if refresh fails - session will update on next request
        router.replace("/home");
      }
    };

    refreshAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [status, update, router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{statusMessage}</p>
      </div>
    </main>
  );
}
