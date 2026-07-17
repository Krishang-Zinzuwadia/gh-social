import assert from 'node:assert/strict';
import test from 'node:test';

import { retryDelayMs } from '../../services/outboxService.js';

test('outbox retry uses capped full jitter', () => {
  assert.equal(retryDelayMs(0, () => 0.5), 500);
  assert.equal(retryDelayMs(3, () => 0.5), 4_000);
  assert.equal(retryDelayMs(30, () => 1), 900_000);
});
