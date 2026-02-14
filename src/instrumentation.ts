import { createOnRequestError } from '@axiomhq/nextjs';
import { logger } from '@/lib/axiom';

export async function register() {}
export const onRequestError = createOnRequestError(logger);
