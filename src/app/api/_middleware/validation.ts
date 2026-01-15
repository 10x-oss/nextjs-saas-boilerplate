import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { BlockType } from "@/shared/types/enum/block-type.enum";
import { BaseBlock } from "@/shared/types/base-block.types";

// Helper type to ensure type has displayOrder
type WithDisplayOrder = { displayOrder: number };

// Add constraint to T to ensure it's an object
export async function withValidation<T extends object>(
  request: Request,
  schema: ZodSchema<T>,
  handler: (validatedData: T) => Promise<Response>
) {
  try {
    const body = await request.json();

    // Validate the data against the schema
    const validatedData = await schema.parseAsync(body);

    // Type-specific validation
    if ("type" in validatedData) {
      const blockData = validatedData as Partial<BaseBlock>;

      switch (blockData.type) {
        case BlockType.page: {
          const pageData = blockData as Partial<BaseBlock & WithDisplayOrder>;
          if (pageData.displayOrder === undefined) {
            throw new Error("Page blocks require displayOrder");
          }
          break;
        }
        case BlockType.text: {
          const textData = blockData as Partial<BaseBlock & WithDisplayOrder>;
          if (textData.displayOrder === undefined) {
            throw new Error("Text blocks require displayOrder");
          }
          break;
        }
        // Add other type-specific validation as needed
      }
    }

    return handler(validatedData);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details:
          (error &&
            typeof error === "object" &&
            "errors" in error &&
            (error as any).errors) ||
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 400 }
    );
  }
}
