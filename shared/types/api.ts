import { UserSkinProfile } from './profile';
import { ProductAnalysis } from './analysis';

export interface AnalyzeProductRequest {
  productName: string;
  brand: string;
  ingredients?: string[];
  url?: string;
  userProfile: UserSkinProfile;
}

export interface AnalyzeProductResponse extends ProductAnalysis {}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    workersAI: 'operational' | 'degraded' | 'down';
    reddit: 'operational' | 'degraded' | 'down';
    cache: 'operational' | 'degraded' | 'down';
  };
  timestamp: string;
}
