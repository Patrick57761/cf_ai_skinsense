export interface CachedAnalysis {
  data: any;
  cachedAt: number;
  requestCount: number;
  expiresAt: number;
}

export class ProductCache {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();

    if (!productId) {
      return new Response('Product ID required', { status: 400 });
    }

    if (request.method === 'GET') {
      const cached = await this.state.storage.get<CachedAnalysis>(productId);

      if (!cached) {
        return new Response(JSON.stringify({ cached: false }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const now = Date.now();
      const isExpired = now > cached.expiresAt;
      const shouldRefresh = cached.requestCount >= 50;

      return new Response(
        JSON.stringify({
          cached: true,
          data: cached.data,
          cachedAt: cached.cachedAt,
          requestCount: cached.requestCount,
          isExpired,
          shouldRefresh
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (request.method === 'PUT') {
      const data = await request.json();
      const now = Date.now();
      const TTL_DAYS = 30;
      const expiresAt = now + TTL_DAYS * 24 * 60 * 60 * 1000;

      const cached: CachedAnalysis = {
        data,
        cachedAt: now,
        requestCount: 0,
        expiresAt
      };

      await this.state.storage.put(productId, cached);

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      const cached = await this.state.storage.get<CachedAnalysis>(productId);

      if (cached) {
        cached.requestCount += 1;
        await this.state.storage.put(productId, cached);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
}
