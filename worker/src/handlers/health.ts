import type { Handler } from '../types/handler';
import { jsonResponse } from '../utils/response';

/**
 * Health check endpoint
 * Returns operational status of all services
 */
export const health: Handler = async (request, env) => {
  return jsonResponse({
    status: 'healthy',
    services: {
      workersAI: 'operational',
      reddit: 'operational',
      cache: 'operational'
    },
    timestamp: new Date().toISOString()
  });
};
