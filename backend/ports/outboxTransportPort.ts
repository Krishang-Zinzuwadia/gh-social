import type {
  DeliveryResult,
  MlFeedbackBatch,
  MlOnboardingJob,
  MlRepositoryIndexJob,
  MlRepositoryRefreshJob,
} from '../contracts/ml.v2.js';

export interface OutboxTransportPort {
  deliverFeedback(batch: MlFeedbackBatch): Promise<DeliveryResult>;
  deliverOnboarding(job: MlOnboardingJob): Promise<DeliveryResult>;
  deliverRepositoryIndex(job: MlRepositoryIndexJob): Promise<DeliveryResult>;
  deliverRepositoryRefresh(job: MlRepositoryRefreshJob): Promise<DeliveryResult>;
}
