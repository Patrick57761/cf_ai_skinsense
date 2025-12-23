import { errorResponse } from '../utils/response';

/**
 * Global error handler for uncaught errors
 * Formats errors consistently and logs them
 */
export function errorHandler(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Handler error:', error);
  return errorResponse(message);
}
