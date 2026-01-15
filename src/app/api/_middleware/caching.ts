import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes default
});

// Define the options type
export type CacheOptions = {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  shouldCache?: (req: Request) => boolean;
};

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  ttl: 1000 * 60 * 5, // 5 minutes
  keyGenerator: (req: Request) => req.url,
  shouldCache: (req: Request) => {
    // Only cache GET requests and exclude certain patterns
    if (req.method !== "GET") return false;

    // Don't cache authenticated requests by default
    if (req.headers.get("authorization")) return false;

    return true;
  },
};

export async function withCache(
  request: Request,
  handler: () => Promise<Response>,
  options: CacheOptions = {}
) {
  // Merge provided options with defaults
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  if (!finalOptions.shouldCache(request)) {
    return handler();
  }

  const cacheKey = finalOptions.keyGenerator(request);
  const cached = await cache.get(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": `public, max-age=${finalOptions.ttl / 1000}`,
      },
    });
  }

  const response = await handler();
  const data = await response.json();

  await cache.set(cacheKey, data, {
    ttl: finalOptions.ttl,
  });

  return NextResponse.json(data, {
    headers: {
      "X-Cache": "MISS",
      "Cache-Control": `public, max-age=${finalOptions.ttl / 1000}`,
    },
  });
}
