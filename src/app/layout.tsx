import "@/app/server";
import "@/app/styles/globals.css";
import { Metadata, Viewport } from "next";
import React from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "zAxis — Your infinite canvas notebook",
  description:
    "Connect all your apps into one place and organize your chaotic worklife on a single, living canvas.",
  manifest: "/manifest.json",
  themeColor: process.env.NEXT_PUBLIC_COLORS_MAIN,
  icons: {
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  openGraph: {
    title: "zAxis — Your infinite canvas notebook",
    description:
      "Connect all your apps into one place and organize your chaotic worklife on a single, living canvas.",
    url: "https://zaxis.so",
    siteName: "zAxis",
    images: [
      {
        // Placeholder OG image until provided
        url: "/blob-organized-transformation-sora.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    "msapplication-TileColor": process.env.NEXT_PUBLIC_COLORS_MAIN,
    "og:video": "https://zaxis.so/hero-demo.webm",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stripe loaded lazily - only needed on checkout/billing pages */}
        <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />

        {/** Analytics and third-parties deferred via DeferThirdParties component */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "zAxis",
              url: "https://zaxis.so",
              logo: "/favicon-32x32.png",
              sameAs: ["https://twitter.com/zaxisapp"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "zAxis Infinite Canvas",
              isAccessibleForFree: true,
              offers: [
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "8",
                  priceCurrency: "USD",
                  category: "subscription",
                },
                {
                  "@type": "Offer",
                  name: "Business",
                  price: "15",
                  priceCurrency: "USD",
                  category: "subscription",
                },
              ],
            }),
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme')) {
                  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
                } else {
                  document.documentElement.setAttribute('data-theme', '${
                    process.env.NEXT_PUBLIC_COLORS_THEME || "dark"
                  }');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
