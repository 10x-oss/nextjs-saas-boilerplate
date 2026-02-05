import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * Validation options for the middleware
 */
type ValidationOptions = {
  /** Parse request body as JSON (default: true for POST/PUT/PATCH) */
  parseBody?: boolean;
  /** Parse URL query parameters */
  parseQuery?: boolean;
};

/**
 * Formats Zod validation errors into a user-friendly structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

/**
 * Validates request data against a Zod schema
 *
 * @example
 * // In an API route:
 * export const POST = withMiddleware(
 *   async (validatedData, context) => {
 *     // validatedData is typed according to your schema
 *     return NextResponse.json({ success: true });
 *   },
 *   {
 *     validation: { schema: myZodSchema },
 *     rateLimit: { type: "standard" },
 *   }
 * );
 */
export async function withValidation<T extends object>(
  request: Request,
  schema: ZodSchema<T>,
  handler: (validatedData: T) => Promise<Response>,
  options: ValidationOptions = {}
): Promise<Response> {
  try {
    let dataToValidate: Record<string, unknown> = {};

    // Determine if we should parse body based on method
    const method = request.method.toUpperCase();
    const shouldParseBody =
      options.parseBody ?? ["POST", "PUT", "PATCH"].includes(method);

    // Parse request body if applicable
    if (shouldParseBody) {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await request.json();
          dataToValidate = { ...dataToValidate, ...body };
        }
      } catch {
        return NextResponse.json(
          {
            error: "Invalid JSON",
            message: "Request body must be valid JSON",
          },
          { status: 400 }
        );
      }
    }

    // Parse query parameters if requested
    if (options.parseQuery) {
      const url = new URL(request.url);
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      dataToValidate = { ...dataToValidate, ...queryParams };
    }

    // Validate against the schema
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "The request data did not pass validation",
          details: formatZodErrors(result.error),
        },
        { status: 400 }
      );
    }

    return handler(result.data);
  } catch (error) {
    console.error("[Validation] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Validation error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 400 }
    );
  }
}

/**
 * Type helper to infer the validated data type from a schema
 */
export type InferValidatedData<T extends ZodSchema> = T extends ZodSchema<
  infer U
>
  ? U
  : never;
