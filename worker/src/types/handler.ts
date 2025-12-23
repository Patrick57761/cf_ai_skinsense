import type { Env } from './env';

/**
 * Standard handler function type for route handlers
 * Takes a request and environment, returns a Response
 */
export type Handler = (request: Request, env: Env) => Promise<Response>;
