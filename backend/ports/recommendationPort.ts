import type {
  MlRecommendationRequest,
  MlRecommendationResponse,
} from '../contracts/ml.v2.js';

export interface RecommendationPort {
  generate(input: MlRecommendationRequest): Promise<MlRecommendationResponse>;
}
