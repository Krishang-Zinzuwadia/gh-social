import type { MlFeedbackBatch, MlOnboardingJob, MlRepositoryIndexJob, MlRepositoryRefreshJob } from '../contracts/ml.v2.js';
import type { OutboxTransportPort } from '../ports/outboxTransportPort.js';
import { OutboxService, type OutboxRow } from '../services/outboxService.js';

export class OutboxWorker {
  constructor(
    private readonly outbox: OutboxService,
    private readonly transport: OutboxTransportPort,
    private readonly onDelivered?: (row: OutboxRow) => Promise<void>,
  ) {}

  private deliver(row: OutboxRow) {
    if (row.job_type === 'feedback') {
      return this.transport.deliverFeedback({ schema_version: 2, events: [row.payload as unknown as MlFeedbackBatch['events'][number]] });
    }
    if (row.job_type === 'onboard') return this.transport.deliverOnboarding(row.payload as unknown as MlOnboardingJob);
    if (row.job_type === 'repo_index') return this.transport.deliverRepositoryIndex(row.payload as unknown as MlRepositoryIndexJob);
    return this.transport.deliverRepositoryRefresh(row.payload as unknown as MlRepositoryRefreshJob);
  }

  async runOnce(limit = 50): Promise<number> {
    const rows = await this.outbox.claim(limit);
    for (const row of rows) {
      const result = await this.deliver(row);
      if (result.accepted) {
        await this.outbox.markDelivered(row);
        if (this.onDelivered) {
          try { await this.onDelivered(row); }
          catch (error) { console.error(`[OutboxWorker] Post-delivery hook failed for ${row.outbox_id}:`, error); }
        }
      }
      else await this.outbox.markFailed(
        row, result.detail ?? `status ${result.status_code}`, result.retryable, result.retry_after_ms,
      );
    }
    return rows.length;
  }
}
