import { sqlClient } from '../db/index.js';

export class RetentionWorker {
  async runOnce(deliveredDays = 30, generationDays = 30): Promise<{ outbox: number; generations: number }> {
    const outbox = await sqlClient`
      DELETE FROM telemetry.ml_outbox WHERE status='delivered' AND delivered_at < now()-(${deliveredDays}::text || ' days')::interval
      RETURNING outbox_id
    `;
    const generations = await sqlClient`
      DELETE FROM telemetry.generation_attempts WHERE created_at < now()-(${generationDays}::text || ' days')::interval
      RETURNING generation_id
    `;
    return { outbox: outbox.length, generations: generations.length };
  }
}
