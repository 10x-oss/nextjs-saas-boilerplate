"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-WR4JBV6D74";
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "1";

export function DeferThirdParties() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamString = searchParams?.toString() ?? "";
  const analyticsEnabled = ANALYTICS_ENABLED;
  const gaId = GA_MEASUREMENT_ID;
  const gaLoadedRef = useRef(false);
  const lastPageRef = useRef<string | null>(null);
  const [gaReady, setGaReady] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled || gaLoadedRef.current || !gaId) return;
    if (typeof window === "undefined") return;

    gaLoadedRef.current = true;

    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== "function") {
      w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params -- GA expects the raw arguments object
        w.dataLayer.push(arguments);
      };
    }

    const handleLoad = () => {
      const initialSearch = window.location.search || "";
      const initialPath = `${window.location.pathname}${initialSearch}` || "/";
      const initialTitle =
        typeof document !== "undefined" ? document.title : undefined;

      w.gtag("js", new Date());
      w.gtag("config", gaId, {
        ...(process.env.NODE_ENV !== "production" ? { debug_mode: true } : {}),
        page_path: initialPath,
        page_location: window.location.href,
        ...(initialTitle ? { page_title: initialTitle } : {}),
      });

      lastPageRef.current = initialPath;
      setGaReady(true);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.googletagmanager.com/gtag/js"]'
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        handleLoad();
      } else {
        existingScript.addEventListener("load", handleLoad, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.async = true;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        handleLoad();
      });
      script.addEventListener("error", () => {
        gaLoadedRef.current = false;
      });
      document.head.appendChild(script);
    }

    return () => {
      if (existingScript) {
        existingScript.removeEventListener("load", handleLoad);
      }
    };
  }, [analyticsEnabled, gaId]);

  useEffect(() => {
    if (!analyticsEnabled || !gaReady || !gaId) return;
    if (typeof window === "undefined") return;

    const pagePath = searchParamString
      ? `${pathname}?${searchParamString}`
      : pathname || "/";
    if (lastPageRef.current === pagePath) return;
    lastPageRef.current = pagePath;

    const pageTitle =
      typeof document !== "undefined" ? document.title : undefined;
    window.gtag?.("config", gaId, {
      page_path: pagePath,
      page_location: window.location.href,
      ...(pageTitle ? { page_title: pageTitle } : {}),
    });
  }, [analyticsEnabled, gaReady, gaId, pathname, searchParamString]);

  return null;
}

export default DeferThirdParties;
