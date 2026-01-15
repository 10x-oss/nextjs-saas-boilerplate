// src/features/layout/GlobalLayout.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/core/components/General/ErrorBoundary";
import {
  CRISP_WEBSITE_ID,
  getCrispRoutes,
  normalizeRoute,
} from "@/shared/utils/crisp";

// Lazy load heavy components to reduce initial bundle
const TopLoader = dynamic<{ color?: string; showSpinner?: boolean }>(
  () => import("nextjs-toploader").then((mod) => mod.default as any),
  { ssr: false, loading: () => null }
);

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false }
);

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const crispInitializedRef = useRef(false);
  const crispWebsiteId = CRISP_WEBSITE_ID;
  const crispRoutes = useMemo(() => getCrispRoutes(), []);
  const normalizedPathname = normalizeRoute(pathname || "/");
  const crispEnabledOnRoute = crispRoutes.includes(normalizedPathname);

  // Dynamically import and initialize Crisp only when needed
  useEffect(() => {
    if (!crispWebsiteId) return;

    const initCrisp = async () => {
      const { Crisp } = await import("crisp-sdk-web");

      if (crispEnabledOnRoute) {
        if (!crispInitializedRef.current) {
          Crisp.configure(crispWebsiteId);
          crispInitializedRef.current = true;
        } else {
          Crisp.chat.show();
        }
        Crisp.chat.offChatClosed();
      } else if (crispInitializedRef.current) {
        Crisp.chat.close();
        Crisp.chat.hide();
        Crisp.chat.onChatClosed(() => Crisp.chat.hide());
      }
    };

    // Only load Crisp if it might be needed (on enabled routes or already initialized)
    if (crispEnabledOnRoute || crispInitializedRef.current) {
      initCrisp();
    }
  }, [crispEnabledOnRoute, crispWebsiteId]);

  return (
    <ErrorBoundary>
      <TopLoader
        color={process.env.NEXT_PUBLIC_MAIN_COLOR}
        showSpinner={false}
      />
      <div className="flex flex-col w-full min-h-screen bg-dot-grid app-gradient">
        <main className="flex-1 w-full">{children}</main>
      </div>
      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
    </ErrorBoundary>
  );
}
