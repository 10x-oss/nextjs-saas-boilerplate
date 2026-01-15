import { BlockType } from "./enum/block-type.enum";

/**
 * Base block interface - customize for your app's content structure
 */
export interface BaseBlock {
  id: string;
  type: BlockType;
  content?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlockValidationResult {
  valid: boolean;
  errors?: string[];
}
