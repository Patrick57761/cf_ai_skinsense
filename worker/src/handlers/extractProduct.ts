import type { Handler } from '../types/handler';
import { parseRequestBody, requireFields } from '../utils/validation';
import { jsonResponse, errorResponse } from '../utils/response';
import { extractProductInfo } from '../ai/extractProduct';

/**
 * Extract product name and brand from webpage content
 * POST /api/v1/products/extract
 */
export const extractProduct: Handler = async (request, env) => {
  try {
    const body = await parseRequestBody(request);
    requireFields(body, ['pageInfo']);

    const extracted = await extractProductInfo(
      env.AI,
      body.pageInfo,
      body.pageText || ''
    );

    return jsonResponse({
      success: true,
      productName: extracted.productName,
      brand: extracted.brand,
      confidence: extracted.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 400);
  }
};
