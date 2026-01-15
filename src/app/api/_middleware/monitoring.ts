// src/app/api/_middleware/monitoring.ts
import { NextResponse } from "next/server";
import pino from "pino";

// Set up Pino logger for a serverless environment by removing the transport
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

// Alternatively, if you need pretty printing in development,
// you can conditionally add the transport based on your environment:
if (process.env.NODE_ENV === "development") {
  // For development, use pino-pretty synchronously.
  logger.info("Running in development mode with simplified logging");
}

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
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;

    logger.error({
      requestId,
      path: route,
      method: request.method,
      error: error.message,
      stack: error.stack,
      duration,
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500 }
    );
  }
}
