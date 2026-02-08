import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limit configurations (requests per minute)
const RATE_LIMIT_CONFIG = {
  standard: { requests: 1000, window: "1m" },
  "blocks.create": { requests: 100, window: "1m" },
  "blocks.update": { requests: 200, window: "1m" },
  "blocks.batch": { requests: 50, window: "1m" },
  "mcp.free": { requests: 30, window: "1m" },
  "mcp.paid": { requests: 100, window: "1m" },
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

// Lazy-initialize Redis and rate limiters only when needed
let redis: Redis | null = null;
const rateLimiters = new Map<RateLimitType, Ratelimit>();

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiter(limitType: RateLimitType): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (rateLimiters.has(limitType)) {
    return rateLimiters.get(limitType)!;
  }

  const config = RATE_LIMIT_CONFIG[limitType];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:${limitType}`,
    analytics: true,
  });

  rateLimiters.set(limitType, limiter);
  return limiter;
}

export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  limitType: RateLimitType = "standard"
): Promise<Response> {
  // For development, bypass rate limiting
  if (process.env.NODE_ENV === "development") {
    return handler();
  }

  const limiter = getRateLimiter(limitType);

  // If Upstash is not configured, fall back to allowing the request
  // This enables local dev and staging environments without Redis
  if (!limiter) {
    console.warn(
      "Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set"
    );
    return handler();
  }

  // Use IP address as identifier — prefer CF-Connecting-IP for Cloudflare deployments
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Reject requests with no identifiable IP to prevent sharing a single rate-limit bucket
  if (ip === "unknown") {
    return NextResponse.json(
      { error: "Rate limit exceeded", message: "Unable to identify client." },
      { status: 429 }
    );
  }

  const identifier = `${ip}:${limitType}`;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Execute the handler and add rate limit headers to the response
    const response = await handler();

    // Clone the response to add headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-RateLimit-Limit", limit.toString());
    newResponse.headers.set("X-RateLimit-Remaining", remaining.toString());
    newResponse.headers.set("X-RateLimit-Reset", reset.toString());

    return newResponse;
  } catch (error) {
    // If Redis fails, log the error but allow the request through
    // This prevents Redis outages from blocking all API traffic
    console.error("Rate limit check failed:", error);
    return handler();
  }
}
