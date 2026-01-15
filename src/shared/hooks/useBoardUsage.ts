"use client";

import { useSession } from "next-auth/react";

interface BoardUsageData {
  current: number;
  limit: number;
  remaining: number;
  isPaid: boolean;
}

/**
 * Hook to track usage limits for your app.
 * Customize this for your specific usage tracking needs.
 */
export function useBoardUsage() {
  const { data: session, status } = useSession();

  // Default data - customize based on your subscription logic
  const data: BoardUsageData | null =
    status === "authenticated"
      ? {
          current: 0,
          limit: 5,
          remaining: 5,
          isPaid: session?.user?.subscriptionStatus === "active",
        }
      : null;

  return {
    data,
    isLoading: status === "loading",
    error: null,
  };
}
