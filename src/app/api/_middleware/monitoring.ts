// src/app/api/_middleware/monitoring.ts
import { NextResponse } from "next/server";
import { logger } from "@/lib/axiom";

export async function withMonitoring(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const route = new URL(request.url).pathname;

  try {
    const response = await handler();
    const duration = (Date.now() - startTime) / 1000; // seconds

    logger.info("request completed", {
      requestId,
      path: route,
      method: request.method,
      duration,
      status: response.status,
    });

    return response;
  } catch (error: unknown) {
    const duration = (Date.now() - startTime) / 1000;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error("request failed", {
      requestId,
      path: route,
      method: request.method,
      error: errorMessage,
      stack: errorStack,
      duration,
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500 }
    );
  }
}
