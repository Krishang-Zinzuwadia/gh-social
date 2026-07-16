import assert from 'node:assert/strict';
import test from 'node:test';

import type { CreateServeInput, RepositoryProjection, StoredServe } from '../../contracts/feed.v2.js';
import type { FeedPersistencePort } from '../../ports/feedPersistencePort.js';
import type { FeedQueuePort, FeedReservation } from '../../redis/feedQueue.js';
import { ReservationOwnedError } from '../../redis/feedQueue.js';
import { FeedRequestInProgressError, FeedV2Service } from '../../services/feedV2Service.js';

const repo: RepositoryProjection = {
  repo_id: '00000000-0000-4000-8000-000000000001', full_name: 'owner/repo', description: null,
  primary_language: 'TypeScript', topics: [], star_count: 1, fork_count: 0, summary_id: null,
  summary: null, status: 'active',
};

class FakePersistence implements FeedPersistencePort {
  serve: StoredServe | null = null;
  missesBeforeServe = 0;
  fallbackCalls = 0;
  async getFeedVersion() { return 3n; }
  async getServeByRequest() {
    if (this.missesBeforeServe > 0) { this.missesBeforeServe--; return null; }
    return this.serve;
  }
  async listActiveRepositories() { return [repo]; }
  async getTrendingFallback() { this.fallbackCalls++; return [repo]; }
  async createServe(input: CreateServeInput) {
    this.serve = {
      ...input, serve_id: '00000000-0000-4000-8000-000000000099', created_at: new Date(0).toISOString(),
    };
    return this.serve;
  }
}

class FakeQueue implements FeedQueuePort {
  committed = 0; released = 0;
  async reserve(_u: string, _v: bigint, requestId: string, _l: number, token: string): Promise<FeedReservation> {
    return { requestId, token, items: [{ repo_id: repo.repo_id, score: 1, source: 'semantic', model_version: 'm1', summary_id: null }] };
  }
  async refill(_u: string, _v: bigint, requestId: string, _l: number, token: string): Promise<FeedReservation> {
    return this.reserve(_u, _v, requestId, _l, token);
  }
  async commit() { this.committed++; return true; }
  async release() { this.released++; return true; }
  async replace() {}
  async depth() { return 1; }
  async acquireGenerationLock() { return true; }
  async releaseGenerationLock() {}
  async scanReservations() { return []; }
  async deleteStaleVersions() { return 0; }
}

test('v2 feed reserves, persists, commits, and replays the same serve', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  const service = new FeedV2Service(persistence, queue);
  const request = {
    feed_request_id: '00000000-0000-4000-8000-000000000010',
    session_id: '00000000-0000-4000-8000-000000000020', limit: 10, cursor: null,
  };
  const first = await service.getFeed('00000000-0000-4000-8000-000000000030', request);
  const replay = await service.getFeed('00000000-0000-4000-8000-000000000030', request);
  assert.equal(first.serve_id, replay.serve_id);
  assert.equal(first.feed_version, '3');
  assert.equal(queue.committed, 1);
  assert.equal(queue.released, 0);
});

test('v2 feed persists trending fallback when Redis is unavailable', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  queue.reserve = async () => { throw new Error('redis offline'); };
  const response = await new FeedV2Service(persistence, queue).getFeed(
    '00000000-0000-4000-8000-000000000030',
    { feed_request_id: '00000000-0000-4000-8000-000000000011',
      session_id: '00000000-0000-4000-8000-000000000020', limit: 10, cursor: null },
  );
  assert.equal(response.source, 'fallback');
  assert.equal(response.items[0].repo_id, repo.repo_id);
  assert.equal(queue.committed, 0);
});

test('reservation ownership waits for and replays the durable serve', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  persistence.serve = {
    feed_request_id: '00000000-0000-4000-8000-000000000013',
    user_id: '00000000-0000-4000-8000-000000000030',
    session_id: '00000000-0000-4000-8000-000000000020',
    feed_version: 3n,
    generation_id: null,
    source: 'personalized',
    model_version: 'm1',
    items: [{ repo_id: repo.repo_id, score: 1, source: 'semantic', model_version: 'm1', summary_id: null,
      position: 0, repository: repo }],
    serve_id: '00000000-0000-4000-8000-000000000099',
    created_at: new Date(0).toISOString(),
  };
  persistence.missesBeforeServe = 1;
  queue.reserve = async () => { throw new ReservationOwnedError(); };

  const response = await new FeedV2Service(persistence, queue, undefined, true, 10, 0).getFeed(
    persistence.serve.user_id,
    { feed_request_id: persistence.serve.feed_request_id, session_id: persistence.serve.session_id, limit: 10, cursor: null },
  );
  assert.equal(response.serve_id, persistence.serve.serve_id);
  assert.equal(persistence.fallbackCalls, 0);
});

test('reservation ownership never falls back or creates a competing serve', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  queue.reserve = async () => { throw new ReservationOwnedError(); };
  await assert.rejects(
    new FeedV2Service(persistence, queue, undefined, true, 1, 0).getFeed(
      '00000000-0000-4000-8000-000000000030',
      { feed_request_id: '00000000-0000-4000-8000-000000000014',
        session_id: '00000000-0000-4000-8000-000000000020', limit: 10, cursor: null },
    ),
    FeedRequestInProgressError,
  );
  assert.equal(persistence.fallbackCalls, 0);
  assert.equal(queue.committed, 0);
  assert.equal(queue.released, 0);
});

test('generation keeps reservation ownership and concurrent retries replay personalized serve', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  let owner: string | null = null;
  let generationStarted!: () => void;
  let finishGeneration!: () => void;
  const started = new Promise<void>((resolve) => { generationStarted = resolve; });
  const finish = new Promise<void>((resolve) => { finishGeneration = resolve; });

  queue.reserve = async (_user, _version, requestId, _limit, token) => {
    if (owner && owner !== token) throw new ReservationOwnedError();
    owner = token;
    return { requestId, token, items: [] };
  };
  queue.refill = async (_user, _version, requestId, _limit, token) => {
    if (owner !== token) throw new ReservationOwnedError();
    return { requestId, token, items: [{
      repo_id: repo.repo_id, score: 1, source: 'semantic', model_version: 'm1', summary_id: null,
    }] };
  };
  queue.commit = async () => {
    if (!owner) return false;
    owner = null;
    queue.committed++;
    return true;
  };

  const service = new FeedV2Service(persistence, queue, async () => {
    generationStarted();
    await finish;
  }, true, 1_000, 1);
  const userId = '00000000-0000-4000-8000-000000000030';
  const request = {
    feed_request_id: '00000000-0000-4000-8000-000000000015',
    session_id: '00000000-0000-4000-8000-000000000020', limit: 10, cursor: null,
  };

  const original = service.getFeed(userId, request);
  await started;
  const retry = service.getFeed(userId, request);
  finishGeneration();
  const [originalResponse, retryResponse] = await Promise.all([original, retry]);

  assert.equal(originalResponse.source, 'personalized');
  assert.deepEqual(retryResponse, originalResponse);
  assert.equal(persistence.fallbackCalls, 0);
  assert.equal(queue.released, 0);
  assert.equal(queue.committed, 1);
});

test('feed replay cache-hit service p95 stays below 250ms', async () => {
  const persistence = new FakePersistence();
  const queue = new FakeQueue();
  const service = new FeedV2Service(persistence, queue);
  const request = { feed_request_id: '00000000-0000-4000-8000-000000000012',
    session_id: '00000000-0000-4000-8000-000000000020', limit: 10, cursor: null };
  await service.getFeed('00000000-0000-4000-8000-000000000030', request);
  const samples: number[] = [];
  for (let index = 0; index < 250; index++) {
    const started = performance.now();
    await service.getFeed('00000000-0000-4000-8000-000000000030', request);
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  assert.ok(samples[Math.floor(samples.length * 0.95)] < 250);
});
