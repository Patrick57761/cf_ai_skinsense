import { ProductCache } from './durable-objects/ProductCache';

interface Env {
  AI: Ai;
  PRODUCT_CACHE: DurableObjectNamespace;
}

export { ProductCache };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/v1/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          services: {
            workersAI: 'operational',
            reddit: 'operational',
            cache: 'operational'
          },
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (request.method === 'GET' && url.pathname === '/api/v1/test-ai') {
      try {
        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: [
            {
              role: 'user',
              content: 'What is niacinamide and what does it do for skin? Answer in 2 sentences.'
            }
          ]
        });

        return new Response(
          JSON.stringify({
            success: true,
            model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
            response: response,
            timestamp: new Date().toISOString()
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
