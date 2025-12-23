import type { Env } from '../types/env';

/**
 * Service for interacting with ProductCache Durable Object
 * Provides a clean abstraction for caching product analyses
 */
export class CacheService {
  constructor(private env: Env) {}

  /**
   * Get Durable Object stub for a product
   */
  private getDurableObject(productId: string) {
    const id = this.env.PRODUCT_CACHE.idFromName(productId);
    return this.env.PRODUCT_CACHE.get(id);
  }

  /**
   * Retrieve cached analysis for a product
   * Returns null if not cached or expired
   */
  async get(productId: string): Promise<any | null> {
    try {
      const stub = this.getDurableObject(productId);
      const response = await stub.fetch(`http://cache/${productId}`, {
        method: 'GET'
      });

      const result = await response.json();

      // Return data only if cached and not expired
      if (result.cached && !result.isExpired) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Store analysis in cache with 30-day TTL
   */
  async set(productId: string, data: any): Promise<void> {
    try {
      const stub = this.getDurableObject(productId);
      await stub.fetch(`http://cache/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Increment request count for cached product
   * Used to track cache freshness and popularity
   */
  async incrementRequestCount(productId: string): Promise<void> {
    try {
      const stub = this.getDurableObject(productId);
      await stub.fetch(`http://cache/${productId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Cache increment error:', error);
    }
  }
}
