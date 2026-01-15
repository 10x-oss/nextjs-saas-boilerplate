'use client';

import { useEffect, useRef } from "react";
import { PostHogProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPosthog, posthog } from "../../../instrumentation-client";

interface PostHogClientProviderProps {
  children: React.ReactNode;
}

export default function PostHogClientProvider({
  children,
}: PostHogClientProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastCapturedUrl = useRef<string | null>(null);
  const search = searchParams?.toString() || undefined;

  useEffect(() => {
    initPosthog();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!initPosthog()) return;

    const currentUrl = window.location.href;
    if (!currentUrl || lastCapturedUrl.current === currentUrl) return;

    lastCapturedUrl.current = currentUrl;
    posthog.capture("$pageview", {
      $current_url: currentUrl,
      $pathname: pathname,
      $search: search,
    });
  }, [pathname, search]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
