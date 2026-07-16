import { randomUUID } from 'node:crypto';
import {
  buildCanonicalFeedbackEvent,
  type CanonicalFeedbackEvent,
  type FeedbackAction,
} from '@gh-social/feedback-events';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { mlService } from './mlService.js';

export interface FeedbackEventSource {
  user_id: string;
  repo_id: string;
  action: FeedbackAction;
  dwell_seconds?: number;
}

export function canonicalizeFeedbackEvents(
  events: readonly FeedbackEventSource[],
  occurredAt: string = new Date().toISOString(),
): CanonicalFeedbackEvent[] {
  const baseTime = Date.parse(occurredAt);
  if (!Number.isFinite(baseTime)) {
    throw new TypeError('occurredAt must be a valid ISO date-time');
  }

  return events.map((event, index) => buildCanonicalFeedbackEvent({
    ...event,
    event_id: randomUUID(),
    // Preserve the producer's order so reversals replay deterministically.
    occurred_at: new Date(baseTime + index).toISOString(),
  }));
}

export async function recordFeedbackEvents(events: readonly CanonicalFeedbackEvent[]): Promise<void> {
  await db.transaction(async (transaction) => {
    for (const event of events) {
      const result = await transaction.execute(sql`
        INSERT INTO feedback_event_log (
          event_id,
          schema_version,
          user_id,
          repo_id,
          action,
          dwell_seconds,
          model_update,
          intent_weight,
          intent_strength,
          feature_operation,
          reverses,
          occurred_at
        )
        SELECT
          ${event.event_id}::uuid,
          ${event.schema_version},
          ${event.user_id}::uuid,
          repo.repo_id,
          ${event.action},
          ${event.dwell_seconds ?? null},
          ${event.model_update},
          ${event.intent_weight},
          ${event.intent_strength},
          ${event.feature_operation},
          ${event.reverses ?? null},
          ${event.occurred_at}::timestamptz
        FROM repo
        WHERE repo.full_name = ${event.repo_id} OR repo.repo_id::text = ${event.repo_id}
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      `);

      if (result.length === 0) {
        throw new Error(`Unable to record feedback event ${event.event_id}: repository not found`);
      }
    }
  });
}

export async function recordAndForwardFeedbackEvents(
  sourceEvents: readonly FeedbackEventSource[],
): Promise<CanonicalFeedbackEvent[]> {
  const events = canonicalizeFeedbackEvents(sourceEvents);
  await recordFeedbackEvents(events);
  void mlService.sendBatchedActivityFeedback(events);
  return events;
}
