interface Env {
  AI: Ai;
}

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

    return new Response('Not Found', { status: 404 });
  }
};
