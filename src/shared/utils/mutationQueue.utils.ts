// src/shared/utils/mutationQueue.utils.ts

const mutationQueue = new Map<string, Array<() => Promise<any>>>();

/**
 * Queues a mutation function against a temporary ID.
 */
export function queueMutation(tempId: string, mutationFn: () => Promise<any>) {
  const existingQueue = mutationQueue.get(tempId) || [];
  existingQueue.push(mutationFn);
  mutationQueue.set(tempId, existingQueue);
}

/**
 * Flushes and executes all queued mutations for the given temporary ID.
 */
export async function flushMutationQueue(tempId: string) {
  const queue = mutationQueue.get(tempId) || [];
  for (const mutation of queue) {
    try {
      await mutation();
    } catch (error) {
      console.error(
        `flushMutationQueue: Error executing mutation for tempId=${tempId}`,
        error
      );
    }
  }
  mutationQueue.delete(tempId);
}

/**
 * Clears any queued mutations for the given temporary ID.
 */
export function clearMutationQueue(tempId: string) {
  mutationQueue.delete(tempId);
}
