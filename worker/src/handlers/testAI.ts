import type { Handler } from '../types/handler';
import { jsonResponse, errorResponse } from '../utils/response';

/**
 * Test AI endpoint
 * Tests Workers AI connectivity with a simple query
 */
export const testAI: Handler = async (request, env) => {
  try {
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        {
          role: 'user',
          content: 'What is niacinamide and what does it do for skin? Answer in 2 sentences.'
        }
      ]
    });

    return jsonResponse({
      success: true,
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
};
