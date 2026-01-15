// src/app/api/auth/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { withMiddleware } from "@/app/api/_middleware";

/**
 * Public endpoint: returns a short‑lived JWT for the realtime‑gateway.
 * No authentication required. The gateway verifies using JWT_SECRET only.
 *
 * 200 -> { token }
 * 500 -> { error }
 */
export const GET = withMiddleware(async (_request: NextRequest) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing JWT_SECRET" }, { status: 500 });
  }

  // Minimal, anonymous payload is fine for gateway handshake.
  // The gateway only requires a truthy `id`.
  const payload = { id: "anon", purpose: "realtime" } as const;

  const token = jwt.sign(payload, secret, { expiresIn: "10m" });
  return NextResponse.json(
    { token },
    {
      status: 200,
      headers: {
        // Encourage browser/proxy caching to reduce repeated calls when multiple
        // components request the token around the same time. Kept private.
        "Cache-Control": "private, max-age=540", // 9 minutes
      },
    }
  );
});
