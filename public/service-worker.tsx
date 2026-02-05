"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "@/shared/toast";

export function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js", {
            scope: "/",
          })
          .then(
            function (registration) {
              toast.info(
                `ServiceWorker registration successful with scope: ${registration.scope}`
              );
            },
            function (err) {
              toast.error(`ServiceWorker registration failed: ${err}`);
            }
          );
      });
    }

    // Add Google Analytics route change tracking
    const handleRouteChange = (url: string) => {
      if (typeof window.gtag === "function") {
        window.gtag("config", "G-WR4JBV6D74", {
          page_path: url,
        });
      }
    };

    // Track initial page load
    handleRouteChange(pathname);

    return () => {
      // Cleanup if needed
    };
  }, [pathname]);

  return null;
}
