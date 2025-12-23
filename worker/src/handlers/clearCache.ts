import type { Handler } from '../types/handler';
import { jsonResponse, errorResponse } from '../utils/response';

export const clearCache: Handler = async (request, env) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return errorResponse('Missing productId parameter', 400);
    }

    const id = env.PRODUCT_CACHE.idFromName(productId);
    const stub = env.PRODUCT_CACHE.get(id);

    await stub.fetch(`http://cache/${productId}`, {
      method: 'DELETE'
    });

    return jsonResponse({
      success: true,
      message: `Cache cleared for product: ${productId}`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
};
