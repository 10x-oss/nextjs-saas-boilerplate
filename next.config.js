const path = require("path");
const withPWA = require("next-pwa")({
  dest: "public",
  // Allow enabling PWA explicitly via env; default disabled to avoid build issues in app router
  disable: process.env.NEXT_PUBLIC_ENABLE_PWA !== "true",
});

const nextConfig = withPWA({
  // Enable standalone output for optimized Docker builds
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Recommendation: Enable React Strict Mode to help catch potential issues
  reactStrictMode: true, // Changed from false

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    // Keep your existing image domains
    domains: [
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "img.youtube.com",
      "www.googletagmanager.com",
    ],
    // Consider if you really need disableStaticImages: true
    disableStaticImages: true,
  },

  webpack: (config, { dev, isServer }) => {
    // Keep your alias setup
    config.resolve.alias["@"] = path.resolve(__dirname);

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
    // Keep your custom headers
    // Reminder: Review if the broad CORS headers ('Allow-Origin: *') are necessary and secure.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(marketing|pricing|privacy|security|terms|blog)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
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
      "@": path.resolve(__dirname),
    },
  },
});

module.exports = nextConfig;
