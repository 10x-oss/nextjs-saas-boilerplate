import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { withMonitoring } from "./monitoring";
import { withRateLimit } from "./rate-limit";
import { withCache } from "./caching";
import { withValidation } from "./validation";

type HandlerOptions = {
  rateLimit?: {
    type: "standard" | "blocks.create" | "blocks.update" | "blocks.batch" | "mcp.free" | "mcp.paid";
  };
  cache?: {
    ttl?: number;
    keyGenerator?: (req: NextRequest, params?: any) => string;
    shouldCache?: (req: NextRequest) => boolean;
  };
  validation?: {
    schema: ZodSchema<any>;
  };
};

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<Response>;

type ValidatedHandler = (
  validatedData: any,
  context?: { params: Record<string, string> }
) => Promise<Response>;

export function withMiddleware(
  handler: RouteHandler | ValidatedHandler,
  options: HandlerOptions = {}
) {
  return async (
    request: NextRequest,
    // nextRequestContext is the context provided by Next.js.
    // Its 'params' property might be a Promise or an already resolved object.
    nextRequestContext?: { params: any } // Using 'any' for params to accommodate await.
  ) => {
    // Resolve params from the incoming Next.js context.
    // The resulting 'resolvedHandlerContext' will have 'params' as Record<string, string> or undefined.
    let resolvedHandlerContext: { params: Record<string, string> } | undefined =
      undefined;
    if (
      nextRequestContext &&
      typeof nextRequestContext.params !== "undefined"
    ) {
      const awaitedParams = await nextRequestContext.params;
      resolvedHandlerContext = { params: awaitedParams };
    } else if (nextRequestContext) {
      // If nextRequestContext exists but its params property is not set (e.g. null/undefined)
      // This ensures that if params was explicitly null or undefined, it remains so after await.
      const awaitedParams = await nextRequestContext.params;
      resolvedHandlerContext = { params: awaitedParams };
    }
    // If nextRequestContext was undefined, resolvedHandlerContext remains undefined.
    // This is compatible with RouteHandler and ValidatedHandler types where context is optional.

    try {
      // Start with the base handler wrapped in monitoring
      let currentHandler = async () => {
        if (options.validation?.schema) {
          return withValidation(
            request,
            options.validation.schema,
            (validatedData) =>
              (handler as ValidatedHandler)(
                validatedData,
                resolvedHandlerContext
              )
          );
        }
        return (handler as RouteHandler)(request, resolvedHandlerContext);
      };

      // Add rate limiting if specified
      if (options.rateLimit?.type) {
        const rateLimitedHandler = currentHandler;
        currentHandler = () =>
          withRateLimit(request, rateLimitedHandler, options.rateLimit?.type);
      }

      // Add caching if specified
      if (options.cache) {
        const cachedHandler = currentHandler;
        const cacheOpts = options.cache;
        currentHandler = () =>
          withCache(request, cachedHandler, {
            ttl: cacheOpts.ttl,
            shouldCache: cacheOpts.shouldCache as ((req: Request) => boolean) | undefined,
            keyGenerator: cacheOpts.keyGenerator
              ? (req: Request) =>
                  cacheOpts.keyGenerator!(
                    req as NextRequest,
                    resolvedHandlerContext?.params
                  )
              : undefined,
          });
      }

      // Wrap everything in monitoring
      return withMonitoring(request, currentHandler);
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
