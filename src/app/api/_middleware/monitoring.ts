// src/app/api/_middleware/monitoring.ts
import { NextResponse } from "next/server";

/**
 * Simple logger for API monitoring.
 * Replace with your preferred logging library (pino, winston, etc.)
 */
const logger = {
  info: (data: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[API]", JSON.stringify(data));
    }
  },
  error: (data: Record<string, unknown>) => {
    console.error("[API Error]", JSON.stringify(data));
  },
};

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

    logger.info({
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

    logger.error({
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
