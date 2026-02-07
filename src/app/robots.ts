import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "http://localhost:3000";

/**
 * Dynamic robots.txt generation.
 *
 * Blocks crawlers from authenticated app routes and API endpoints.
 * Allows all public marketing pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app/", "/dashboard/", "/settings/", "/auth/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
