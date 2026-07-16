import crypto from 'node:crypto';

import type { FeedRequestV2, FeedResponseV2, FeedSource, RecommendationEntry } from '../contracts/feed.v2.js';
import type { FeedPersistencePort } from '../ports/feedPersistencePort.js';
import type { FeedQueuePort } from '../redis/feedQueue.js';
import { incrementMetric } from '../observability/metrics.js';

function responseFromServe(serve: Awaited<ReturnType<FeedPersistencePort['createServe']>>): FeedResponseV2 {
  return {
    serve_id: serve.serve_id,
    session_id: serve.session_id,
    feed_version: serve.feed_version.toString(),
    source: serve.source,
    model_version: serve.model_version,
    items: serve.items,
    next_cursor: null,
  };
}

export class FeedV2Service {
  constructor(
    private readonly persistence: FeedPersistencePort,
    private readonly queue: FeedQueuePort,
    private readonly generateOnMiss?: (userId: string, limit: number, excludeRepoIds: string[]) => Promise<unknown>,
    private readonly fallbackEnabled = true,
  ) {}

  async getFeed(userId: string, request: FeedRequestV2): Promise<FeedResponseV2> {
    const replay = await this.persistence.getServeByRequest(userId, request.feed_request_id);
    if (replay) {
      incrementMetric('feed_v2_duplicate_requests_total');
      return responseFromServe(replay);
    }

    const version = await this.persistence.getFeedVersion(userId);
    const token = crypto.randomUUID();
    let queueAvailable = true;
    let reservation;
    try {
      reservation = await this.queue.reserve(
        userId, version, request.feed_request_id, request.limit, token,
      );
    } catch (error) {
      queueAvailable = false;
      reservation = { token, requestId: request.feed_request_id, items: [] };
      incrementMetric('feed_v2_redis_failures_total');
      console.error('[FeedV2Service] Redis unavailable; serving durable fallback:', error);
    }

    if (queueAvailable && reservation.items.length === 0 && this.generateOnMiss) {
      await this.queue.release(userId, version, request.feed_request_id, token);
      try {
        await this.generateOnMiss(userId, request.limit, []);
        reservation = await this.queue.reserve(
          userId, version, request.feed_request_id, request.limit, token,
        );
      } catch (error) {
        console.error('[FeedV2Service] Generation failed; evaluating fallback:', error);
        reservation = { token, requestId: request.feed_request_id, items: [] };
      }
    }

    let entries = reservation.items;
    incrementMetric(entries.length > 0 ? 'feed_v2_cache_hits_total' : 'feed_v2_cache_misses_total');
    let source: FeedSource = 'personalized';
    if (entries.length === 0) {
      if (!this.fallbackEnabled) throw new Error('Feed queue is empty and trending fallback is disabled.');
      const fallback = await this.persistence.getTrendingFallback(request.limit, []);
      entries = fallback.map((repo) => ({
        repo_id: repo.repo_id, score: 0, source: 'fallback', model_version: 'backend-fallback', summary_id: repo.summary_id,
      }));
      source = 'fallback';
      incrementMetric('feed_v2_fallback_total');
    }

    const projections = await this.persistence.listActiveRepositories(entries.map((entry) => entry.repo_id));
    const byId = new Map(projections.map((repo) => [repo.repo_id, repo]));
    const usable = entries.filter((entry) => byId.has(entry.repo_id));
    if (usable.length === 0 && entries.length > 0) {
      if (queueAvailable) await this.queue.commit(userId, version, request.feed_request_id, token);
      throw new Error('Feed contained no active canonical repositories.');
    }

    try {
      const stored = await this.persistence.createServe({
        feed_request_id: request.feed_request_id,
        user_id: userId,
        session_id: request.session_id,
        feed_version: version,
        generation_id: usable[0]?.generation_id ?? null,
        source,
        model_version: usable[0]?.model_version ?? null,
        items: usable.map((entry, position) => ({ ...entry, position, repository: byId.get(entry.repo_id)! })),
      });
      if (queueAvailable) await this.queue.commit(userId, version, request.feed_request_id, token);
      return responseFromServe(stored);
    } catch (error) {
      const replayAfterFailure = await this.persistence.getServeByRequest(userId, request.feed_request_id);
      if (replayAfterFailure) {
        if (queueAvailable) await this.queue.commit(userId, version, request.feed_request_id, token);
        return responseFromServe(replayAfterFailure);
      }
      if (queueAvailable) await this.queue.release(userId, version, request.feed_request_id, token);
      throw error;
    }
  }
}

export function canonicalEntries(
  items: Array<{ repo_id: string; score: number; source: string }>,
  modelVersion: string,
  summaries: Map<string, string | null>,
  generationId?: string,
): RecommendationEntry[] {
  return items.map((item) => ({
    repo_id: item.repo_id,
    score: item.score,
    source: item.source,
    model_version: modelVersion,
    summary_id: summaries.get(item.repo_id) ?? null,
    ...(generationId ? { generation_id: generationId } : {}),
  }));
}
