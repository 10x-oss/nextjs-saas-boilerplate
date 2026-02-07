import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "http://localhost:3000";

/**
 * Dynamic sitemap generation.
 *
 * Add new public marketing pages here as you create them.
 * Authenticated routes (/dashboard, /settings, etc.) should NOT be included.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
