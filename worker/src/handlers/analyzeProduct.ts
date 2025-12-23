import type { Handler } from '../types/handler';
import { parseRequestBody, requireFields } from '../utils/validation';
import { jsonResponse, errorResponse } from '../utils/response';
import { AnalysisService } from '../services/analysis';

/**
 * Analyze a product with full pipeline
 * POST /api/v1/products/analyze
 *
 * Integrates caching - checks cache first, performs analysis if needed
 */
export const analyzeProduct: Handler = async (request, env) => {
  try {
    const body = await parseRequestBody(request);
    requireFields(body, ['productName', 'userProfile']);

    const analysisService = new AnalysisService(env);
    const result = await analysisService.analyzeProduct(
      body.productName,
      body.brand || '',
      body.ingredients || [],
      body.userProfile
    );

    return jsonResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
};
