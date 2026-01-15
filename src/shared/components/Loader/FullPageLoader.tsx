"use client";

import Image from "next/image";
import React from "react";

interface FullPageLoaderProps {
  label?: string;
  className?: string;
}

/**
 * A polished, brand‑aligned full‑page loader.
 * - Always centers in the viewport
 * - Subtle glass panel with animated spinner ring
 * - Optional label beneath
 */
export default function FullPageLoader({ label = "Loading…", className = "" }: FullPageLoaderProps) {
  return (
    <div
      className={
        "min-h-screen w-full flex items-center justify-center bg-base-100 relative overflow-hidden app-gradient " +
        className
      }
      aria-busy
      aria-live="polite"
      role="status"
    >
      {/* Decorative blurred blooms for depth */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="glass-panel rounded-2xl px-8 py-7 shadow-lg flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          {/* Base ring */}
          <div className="absolute inset-0 rounded-full border-2 border-base-300/50" />
          {/* Animated arc */}
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          {/* Logo dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/favicon-32x32.png"
              alt="App logo"
              width={20}
              height={20}
              priority
            />
          </div>
        </div>
        <div className="text-sm text-base-content/70 font-medium tracking-wide">{label}</div>
      </div>
    </div>
  );
}
