import { Product, Ingredient, RedditPost } from './product';

export type Verdict = 'recommended' | 'avoid' | 'neutral' | 'mixed';

export interface IngredientAnalysis {
  good: Ingredient[];
  bad: Ingredient[];
  score: number;
}

export interface RedditAnalysis {
  sentiment: string;
  positivePercent: number;
  totalReviews: number;
  keyThemes: string[];
  summary: string;
  topPosts: RedditPost[];
}

export interface Recommendation {
  verdict: Verdict;
  reasoning: string;
}

export interface ProductAnalysis {
  id: string;
  product: Product;
  analysis: {
    score: number;
    ingredients: IngredientAnalysis;
    reddit: RedditAnalysis;
    recommendation: Recommendation;
  };
  cached: boolean;
  cacheAge?: string;
  analyzedAt: string;
}
