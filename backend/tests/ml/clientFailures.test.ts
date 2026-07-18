import assert from 'node:assert/strict';
import { createServer, type RequestListener, type Server } from 'node:http';
import test from 'node:test';

import { MlV2Client } from '../../services/mlService.js';

async function withServer(handler: RequestListener, run: (url: string) => Promise<void>): Promise<void> {
  const server: Server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('test server did not bind');
  try { await run(`http://127.0.0.1:${address.port}`); }
  finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

const feedback = { schema_version: 2 as const, events: [{
  event_id: '00000000-0000-4000-8000-000000000001', user_id: '00000000-0000-4000-8000-000000000002',
  repo_id: '00000000-0000-4000-8000-000000000003', feedback_version: '1', event_type: 'like' as const,
  dwell_ms: null, occurred_at: new Date(0).toISOString(),
}] };

test('ML transport classifies 429 and 5xx as retryable and 4xx as terminal', async () => {
  for (const [status, retryable] of [[429, true], [503, true], [400, false]] as const) {
    await withServer((_req, response) => { response.writeHead(status, {
      'content-type': 'application/json', ...(status === 429 ? { 'retry-after': '2' } : {}),
    }); response.end('{}'); }, async (url) => {
      const result = await new MlV2Client({ baseUrl: url, internalSecret: 'test', timeoutMs: 500, maxResponseBytes: 10_000 })
        .deliverFeedback(feedback);
      assert.equal(result.accepted, false);
      assert.equal(result.retryable, retryable);
      if (status === 429) assert.equal(result.retry_after_ms, 2_000);
    });
  }
});

test('ML recommendation client rejects invalid contracts', async () => {
  await withServer((_req, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ schema_version: 1, items: [] }));
  }, async (url) => {
    const client = new MlV2Client({ baseUrl: url, internalSecret: 'test', timeoutMs: 500, maxResponseBytes: 10_000 });
    await assert.rejects(client.generate({
      schema_version: 2, generation_id: '00000000-0000-4000-8000-000000000001',
      user_id: '00000000-0000-4000-8000-000000000002', feed_version: 1, limit: 10,
      exclude_repo_ids: [], context: { cold_start: false },
    }), /violated the v2 envelope/);
  });
});

test('ML recommendation client rejects an empty successful result', async () => {
  const generationId = '00000000-0000-4000-8000-000000000001';
  const userId = '00000000-0000-4000-8000-000000000002';
  await withServer((_req, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({
      schema_version: 2,
      generation_id: generationId,
      user_id: userId,
      feed_version: 1,
      model_version: 'test-model',
      embedding_version: 'test-embedding',
      items: [],
    }));
  }, async (url) => {
    const client = new MlV2Client({ baseUrl: url, internalSecret: 'test', timeoutMs: 500, maxResponseBytes: 10_000 });
    await assert.rejects(client.generate({
      schema_version: 2,
      generation_id: generationId,
      user_id: userId,
      feed_version: 1,
      limit: 10,
      exclude_repo_ids: [],
      context: { cold_start: false },
    }), /contained no items/);
  });
});

test('ML recommendation client rejects non-canonical repository IDs', async () => {
  const generationId = '00000000-0000-4000-8000-000000000001';
  const userId = '00000000-0000-4000-8000-000000000002';
  await withServer((_req, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({
      schema_version: 2,
      generation_id: generationId,
      user_id: userId,
      feed_version: 1,
      model_version: 'test-model',
      embedding_version: 'test-embedding',
      items: [{ repo_id: 'owner/repository', score: 0.9, source: 'semantic' }],
    }));
  }, async (url) => {
    const client = new MlV2Client({ baseUrl: url, internalSecret: 'test', timeoutMs: 500, maxResponseBytes: 10_000 });
    await assert.rejects(client.generate({
      schema_version: 2,
      generation_id: generationId,
      user_id: userId,
      feed_version: 1,
      limit: 10,
      exclude_repo_ids: [],
      context: { cold_start: false },
    }), /invalid or duplicate item/);
  });
});

test('ML transport turns timeout/network failures into retryable delivery results', async () => {
  await withServer((_req, response) => setTimeout(() => response.end('{}'), 100), async (url) => {
    const result = await new MlV2Client({ baseUrl: url, internalSecret: 'test', timeoutMs: 10, maxResponseBytes: 10_000 })
      .deliverFeedback(feedback);
    assert.equal(result.accepted, false);
    assert.equal(result.retryable, true);
    assert.equal(result.status_code, 0);
  });
});

test('durable delivery uses its longer timeout without weakening read timeouts', async () => {
  await withServer((_req, response) => setTimeout(() => {
    response.writeHead(202, { 'content-type': 'application/json' });
    response.end('{"accepted":true}');
  }, 30), async (url) => {
    const result = await new MlV2Client({
      baseUrl: url,
      internalSecret: 'test',
      timeoutMs: 10,
      deliveryTimeoutMs: 100,
      maxResponseBytes: 10_000,
    }).deliverFeedback(feedback);
    assert.equal(result.accepted, true);
    assert.equal(result.status_code, 202);
  });
});
