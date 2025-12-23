/**
 * API Configuration
 * Simple config for dev vs production
 */

// Development: local worker
const DEV_API_URL = 'http://localhost:8787';

// Production: deployed worker
const PROD_API_URL = 'https://skinsense-api.patrickxiao2006.workers.dev';

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env?.DEV ?? true;

/**
 * Base URL for API requests
 * Automatically switches between dev and prod
 */
export const API_BASE_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/v1/health`,
  testAI: `${API_BASE_URL}/api/v1/test-ai`,
  extractProduct: `${API_BASE_URL}/api/v1/products/extract`,
  analyzeProduct: `${API_BASE_URL}/api/v1/products/analyze`,
} as const;
