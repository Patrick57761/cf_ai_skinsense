export interface Product {
  name: string;
  brand: string;
  url?: string;
}

export interface Ingredient {
  name: string;
  reason: string;
}

export interface RedditPost {
  title: string;
  url: string;
  score: number;
  numComments: number;
  createdAt: Date;
  relevanceScore: number;
}
