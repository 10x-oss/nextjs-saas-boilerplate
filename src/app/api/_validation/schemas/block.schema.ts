import { z } from "zod";
import { BlockType } from "@/shared/types/enum/block-type.enum";

// -----------------------
// Base Schema for Blocks
// -----------------------
const baseBlockSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

// -----------------------
// Schema for Page Blocks
// -----------------------
export const pageBlockCreateSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.page),
  content: z.string(),
  displayOrder: z.number(),
  children: z.array(z.any()).default([]),
});

// -------------------------------------------------
// Schemas for the Multi-Paragraph Text Block Data
// -------------------------------------------------

// Inline text segment schema – each segment represents a portion of text with formatting.
const inlineTextSegmentSchema = z.object({
  type: z.literal("text"),
  text: z.object({
    content: z.string(),
    link: z.object({ url: z.string() }).nullable().optional(),
  }),
  annotations: z.object({
    bold: z.boolean(),
    italic: z.boolean(),
    underline: z.boolean(),
    strikethrough: z.boolean(),
    code: z.boolean(),
    color: z.string(),
    fontSize: z.enum(["small", "normal", "large", "xl"]).optional(),
  }),
  plainText: z.string(),
});

// A paragraph is a collection of inline text segments.
const paragraphSchema = z.object({
  richText: z.array(inlineTextSegmentSchema),
});

// The overall text block data structure with paragraphs and optional properties.
const textBlockDataSchema = z.object({
  paragraphs: z.array(paragraphSchema),
  properties: z.record(z.string(), z.unknown()).optional(),
});

// -----------------------
// Schema for Text Blocks
// -----------------------
// Notice that we now expect `blockData` to hold the multi-paragraph content,
// and we use `displayOrder` instead of the legacy `pageOrder`.
export const textBlockCreateSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.text),
  parentId: z.string(),
  displayOrder: z.number(),
  blockData: textBlockDataSchema,
});

// -----------------------
// Schema for YouTube Blocks
// -----------------------
export const youtubeBlockCreateSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.youtube),
  content: z.string().url(),
  transcript: z.string().optional(),
  hasTranscript: z.boolean().optional(),
});

// --------------------------------------
// Combined Block Create Schema (Union)
// --------------------------------------
export const blockCreateSchema = z.discriminatedUnion("type", [
  pageBlockCreateSchema,
  textBlockCreateSchema,
  youtubeBlockCreateSchema,
]);
