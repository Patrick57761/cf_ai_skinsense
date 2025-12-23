import { router } from './router';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import type { Env } from './types/env';

// Export Durable Object for Cloudflare Workers
export { ProductCache } from './durable-objects/ProductCache';

/**
 * Main Worker entry point
 * Handles CORS, routing, and error handling
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Handle CORS preflight requests
      const corsResponse = corsMiddleware(request);
      if (corsResponse) return corsResponse;

      // Route request to appropriate handler
      return await router.handle(request, env);
    } catch (error) {
      // Global error handling
      return errorHandler(error);
    }
  }
};
