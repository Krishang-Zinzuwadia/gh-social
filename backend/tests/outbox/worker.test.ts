import assert from 'node:assert/strict';
import test from 'node:test';

import type { OutboxTransportPort } from '../../ports/outboxTransportPort.js';
import { OutboxService, type OutboxRow } from '../../services/outboxService.js';
import { OutboxWorker } from '../../workers/outboxWorker.js';

function row(id: string): OutboxRow {
  return {
    outbox_id: id,
    job_type: 'onboard',
    aggregate_id: '00000000-0000-4000-8000-000000000010',
    idempotency_key: `onboard:${id}`,
    payload: {
      job_id: id,
      user_id: '00000000-0000-4000-8000-000000000010',
      profile_version: 1,
      profile: { username: 'canary-user' },
    },
    attempts: 1,
    created_at: new Date(0).toISOString(),
    claim_token: '00000000-0000-4000-8000-000000000020',
  };
}

test('outbox claims each row immediately before sequential delivery', async () => {
  const first = row('00000000-0000-4000-8000-000000000001');
  const second = row('00000000-0000-4000-8000-000000000002');
  const pending = [[first], [second], []] as OutboxRow[][];
  const claimLimits: number[] = [];
  const delivered: string[] = [];
  const outbox = {
    claim: async (limit: number) => {
      claimLimits.push(limit);
      return pending.shift() ?? [];
    },
    markDelivered: async (item: OutboxRow) => { delivered.push(item.outbox_id); },
    markFailed: async () => { throw new Error('unexpected failure'); },
  } as unknown as OutboxService;
  const transport = {
    deliverOnboarding: async () => ({ accepted: true, retryable: false, status_code: 200 }),
  } as unknown as OutboxTransportPort;

  const processed = await new OutboxWorker(outbox, transport).runOnce(50);

  assert.equal(processed, 2);
  assert.deepEqual(claimLimits, [1, 1, 1]);
  assert.deepEqual(delivered, [first.outbox_id, second.outbox_id]);
});
