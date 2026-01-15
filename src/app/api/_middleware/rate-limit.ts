import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

const RATE_LIMITS = {
  standard: { windowMs: 60 * 1000, max: 1000 },
  blocks: {
    create: { windowMs: 60 * 1000, max: 100 },
    update: { windowMs: 60 * 1000, max: 200 },
    batch: { windowMs: 60 * 1000, max: 50 },
  },
  mcp: {
    free: { windowMs: 60 * 1000, max: 30 }, // 30 requests/min for free tier
    paid: { windowMs: 60 * 1000, max: 100 }, // 100 requests/min for paid tier
  },
} as const;

// Create a singleton cache instance
const tokenCache = new LRUCache({
  max: 500,
  ttl: RATE_LIMITS.standard.windowMs,
});

export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  limitType:
    | "standard"
    | "blocks.create"
    | "blocks.update"
    | "blocks.batch"
    | "mcp.free"
    | "mcp.paid" = "standard"
) {
  // For development, bypass rate limiting
  if (process.env.NODE_ENV === "development") {
    return handler();
  }

  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const key = `${ip}:${limitType}`;

  const limit = limitType.includes(".")
    ? limitType.split(".").reduce((obj, key) => obj[key], RATE_LIMITS as any)
    : RATE_LIMITS[limitType];

  const tokenCount = (tokenCache.get(key) as number) || 0;

  if (tokenCount >= limit.max) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  tokenCache.set(key, tokenCount + 1);
  return handler();
}
