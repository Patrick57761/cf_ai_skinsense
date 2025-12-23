import type { Env } from './types/env';
import type { Handler } from './types/handler';
import * as handlers from './handlers';

/**
 * Route definition
 */
interface Route {
  method: string;
  path: string;
  handler: Handler;
}

/**
 * Simple router for matching requests to handlers
 */
class Router {
  private routes: Route[] = [];

  /**
   * Register a route
   */
  register(method: string, path: string, handler: Handler): Router {
    this.routes.push({ method, path, handler });
    return this;
  }

  /**
   * Handle incoming request by matching route
   */
  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    for (const route of this.routes) {
      if (request.method === route.method && url.pathname === route.path) {
        return await route.handler(request, env);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}

/**
 * Export configured router with all routes
 */
export const router = new Router()
  .register('GET', '/api/v1/health', handlers.health)
  .register('GET', '/api/v1/test-ai', handlers.testAI)
  .register('POST', '/api/v1/products/extract', handlers.extractProduct)
  .register('POST', '/api/v1/products/analyze', handlers.analyzeProduct)
  .register('DELETE', '/api/v1/cache/clear', handlers.clearCache);
