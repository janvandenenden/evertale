const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 2000;

/**
 * Retries an async operation with exponential backoff.
 * Useful for transient failures (Replicate 503, network timeouts).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxAttempts?: number; delayMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const wait = delayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }
  }

  throw lastError;
}
