import type { NextConfig } from "next";
import path from "path";
import withSerwistInit from "@serwist/next";
import { withPostHogConfig } from "@posthog/nextjs-config";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Allow enabling PWA explicitly via env; default disabled to avoid build issues
  disable: process.env.NEXT_PUBLIC_ENABLE_PWA !== "true",
});

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Recommendation: Enable React Strict Mode to help catch potential issues
  reactStrictMode: true,

  // Partial Prerendering (ppr) was merged into cacheComponents in Next.js 16
  // Disabled for now as it conflicts with dynamic/revalidate route segment configs

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "logos-world.net" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "www.googletagmanager.com" },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    // Keep your alias setup
    config.resolve.alias["@"] = path.resolve(import.meta.dirname);

    // FIX: Removed the `if (dev)` block that incorrectly set:
    // - `config.devtool = "source-map";` (caused warnings and slow)
    // - `config.cache = false;` (hurt performance)
    // Let Next.js handle the defaults for development.

    // Keep your resolve.fallback settings (verify if still needed)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "original-fs": false,
      zipfile: false,
    };

    // Keep your resolve.extensions settings
    config.resolve.extensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".json",
      ...config.resolve.extensions,
    ];

    // Return the modified config
    return config;
  },

  async headers() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Security headers applied to all routes
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy-Report-Only",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https:; base-uri 'self'; form-action 'self';",
      },
    ];

    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // CORS headers for API routes only (never use * with credentials)
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: appUrl },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
      // Cache static marketing pages
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/(marketing|pricing|privacy|security|terms|blog)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Add PostHog rewrites for ingestion and static assets
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // Keep your transpilePackages setting
  transpilePackages: ["@tanstack/react-query"],
  devIndicators: false,

  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    resolveAlias: {
      "@": path.resolve(import.meta.dirname),
    },
  },
};

// PostHog source map uploads — only enabled when credentials are available (e.g., Vercel builds)
// This gives you symbolicated stack traces in PostHog error tracking
const hasPostHogCredentials = process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_ENV_ID;

const finalConfig = hasPostHogCredentials
  ? withPostHogConfig(withSerwist(nextConfig), {
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY!,
      envId: process.env.POSTHOG_ENV_ID!,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      sourcemaps: {
        enabled: true,
        deleteAfterUpload: true,
      },
    })
  : withSerwist(nextConfig);

export default finalConfig;
