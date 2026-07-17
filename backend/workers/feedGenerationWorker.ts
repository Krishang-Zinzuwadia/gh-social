import type { FeedGenerationService } from '../services/feedGenerationService.js';

export class FeedGenerationWorker {
  constructor(private readonly service: FeedGenerationService) {}

  async run(job: { user_id: string; limit?: number; exclude_repo_ids?: string[] }): Promise<void> {
    await this.service.generate(job.user_id, job.limit ?? 45, job.exclude_repo_ids ?? []);
  }
}
