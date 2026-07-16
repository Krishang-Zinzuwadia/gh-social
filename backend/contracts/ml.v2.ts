import type { InteractionEventType } from './interactions.v2.js';

export const ML_SCHEMA_VERSION = 2 as const;

export interface MlRecommendationRequest {
  schema_version: typeof ML_SCHEMA_VERSION;
  generation_id: string;
  user_id: string;
  feed_version: number;
  limit: number;
  exclude_repo_ids: string[];
  context: { cold_start: boolean; locale?: string };
}

export interface MlRecommendationItem {
  repo_id: string;
  score: number;
  source: string;
}

export interface MlRecommendationResponse {
  schema_version: typeof ML_SCHEMA_VERSION;
  generation_id: string;
  user_id: string;
  feed_version: number;
  model_version: string;
  embedding_version: string;
  items: MlRecommendationItem[];
}

export interface MlFeedbackEvent {
  event_id: string;
  user_id: string;
  repo_id: string;
  feedback_version: string;
  event_type: InteractionEventType;
  dwell_ms: number | null;
  occurred_at: string;
}

export interface MlFeedbackBatch {
  schema_version: typeof ML_SCHEMA_VERSION;
  events: MlFeedbackEvent[];
}

export interface MlOnboardingJob {
  job_id: string;
  user_id: string;
  profile_version: number;
  profile: Record<string, unknown>;
}

export interface MlRepositoryIndexJob {
  job_id: string;
  repo_id: string;
  content_version: number;
  repository: Record<string, unknown>;
}

export interface MlRepositoryRefreshJob {
  job_id: string;
  repo_id: string;
  feature_version: number;
  features: Record<string, unknown>;
}

export interface DeliveryResult {
  accepted: boolean;
  retryable: boolean;
  status_code: number;
  detail?: string;
  retry_after_ms?: number;
}
