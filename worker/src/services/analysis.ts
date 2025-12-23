import type { Env } from '../types/env';
import { CacheService } from './cache';
import { analyzeIngredients } from '../ai/analyzeIngredients';
import { synthesizeReviews } from '../ai/synthesizeReviews';
import { searchReddit, rankRedditPosts, fetchTopComments } from './reddit';

/**
 * Service for orchestrating product analysis
 * Integrates caching, ingredient analysis, Reddit search, and review synthesis
 */
export class AnalysisService {
  private cache: CacheService;

  constructor(private env: Env) {
    this.cache = new CacheService(env);
  }

  /**
   * Analyze a product with full pipeline
   * Checks cache first, then performs analysis if needed
   */
  async analyzeProduct(
    productName: string,
    brand: string,
    ingredients: string[],
    userProfile: any
  ): Promise<any> {
    const productId = this.generateProductId(productName, brand);

    // Check cache first
    const cached = await this.cache.get(productId);
    if (cached) {
      await this.cache.incrementRequestCount(productId);
      return { ...cached, cached: true };
    }

    // Perform fresh analysis
    const ingredientAnalysis = await analyzeIngredients(
      this.env.AI,
      ingredients,
      userProfile
    );

    // Search Reddit for product reviews
    const redditPosts = await searchReddit(productName, brand);
    const rankedPosts = rankRedditPosts(redditPosts);

    // Fetch comments for top 3 posts
    for (let i = 0; i < Math.min(rankedPosts.length, 3); i++) {
      const comments = await fetchTopComments(rankedPosts[i].url, productName);
      rankedPosts[i].comments = comments;
    }

    // Synthesize Reddit reviews
    const redditAnalysis = await synthesizeReviews(
      this.env.AI,
      rankedPosts,
      userProfile
    );

    // Calculate verdict based on ingredients
    const verdict = this.calculateVerdict(ingredientAnalysis);

    // Build result
    const result = {
      id: productId,
      product: {
        name: productName,
        brand: brand
      },
      analysis: {
        score: ingredientAnalysis.score,
        ingredients: {
          good: ingredientAnalysis.good,
          bad: ingredientAnalysis.bad
        },
        reddit: redditAnalysis,
        recommendation: {
          verdict: verdict,
          reasoning: ingredientAnalysis.reasoning
        }
      },
      cached: false,
      analyzedAt: new Date().toISOString()
    };

    // Cache the result for future requests
    await this.cache.set(productId, result);

    return result;
  }

  /**
   * Generate a unique product ID from brand and name
   */
  private generateProductId(productName: string, brand: string): string {
    return (brand + ' ' + productName).toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Calculate verdict based on ingredient analysis
   * - recommended: has good ingredients, no bad ones
   * - avoid: has bad ingredients, no good ones
   * - mixed: has both good and bad ingredients
   * - neutral: no clear good or bad ingredients
   */
  private calculateVerdict(ingredientAnalysis: any): string {
    if (ingredientAnalysis.good.length > 0 && ingredientAnalysis.bad.length === 0) {
      return 'recommended';
    } else if (ingredientAnalysis.good.length === 0 && ingredientAnalysis.bad.length > 0) {
      return 'avoid';
    } else if (ingredientAnalysis.good.length > 0 && ingredientAnalysis.bad.length > 0) {
      return 'mixed';
    }
    return 'neutral';
  }
}
