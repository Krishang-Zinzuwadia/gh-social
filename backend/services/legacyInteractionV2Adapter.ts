import crypto from 'node:crypto';

import type { FeedbackInteraction } from '../config/feedback.js';
import type { InteractionEventV2 } from '../contracts/interactions.v2.js';
import { processInteractionBatchV2 } from './activityV2Service.js';

interface LegacyEvent {
  repo_id: string;
  action: FeedbackInteraction;
  dwell_seconds?: number;
}

function deterministicUuid(value: string): string {
  const bytes = crypto.createHash('sha256').update(value).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function processLegacyInteractionBatchV2(
  userId: string,
  events: LegacyEvent[],
  requestKey: string,
): Promise<Awaited<ReturnType<typeof processInteractionBatchV2>>> {
  const occurredAt = new Date().toISOString();
  const sessionId = deterministicUuid(`legacy-session:${userId}:${requestKey}`);
  const adapted: InteractionEventV2[] = events.map((event, index) => ({
    event_id: deterministicUuid(`legacy-event:${userId}:${requestKey}:${index}`),
    schema_version: 2,
    session_id: sessionId,
    serve_id: null,
    repo_id: event.repo_id,
    position: null,
    event_type: event.action,
    dwell_ms: event.action === 'dwell'
      ? Math.min(300_000, Math.max(3_000, Math.round((event.dwell_seconds ?? 3) * 1_000)))
      : null,
    client_occurred_at: occurredAt,
    context: { compatibility_adapter: 'legacy-batch-v2' },
  }));
  return processInteractionBatchV2(userId, adapted);
}
