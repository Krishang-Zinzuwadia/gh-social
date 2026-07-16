import type { Response } from 'express';

import { INTERACTION_EVENT_TYPES, type InteractionEventV2 } from '../contracts/interactions.v2.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { processInteractionBatchV2 } from '../services/activityV2Service.js';
import { getV2FeatureFlags } from '../config/features.js';
import { isValidUuid } from '../utils/validators.js';

const eventTypes = new Set<string>(INTERACTION_EVENT_TYPES);

function validateEvent(value: unknown): value is InteractionEventV2 {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  if (event.schema_version !== 2 || typeof event.event_type !== 'string' || !eventTypes.has(event.event_type)) return false;
  if (typeof event.event_id !== 'string' || !isValidUuid(event.event_id)
    || typeof event.session_id !== 'string' || !isValidUuid(event.session_id)
    || typeof event.repo_id !== 'string' || !isValidUuid(event.repo_id)) return false;
  if (event.serve_id !== null && (typeof event.serve_id !== 'string' || !isValidUuid(event.serve_id))) return false;
  if (event.position !== null && (!Number.isInteger(event.position) || Number(event.position) < 0)) return false;
  if (event.event_type === 'dwell') {
    if (!Number.isInteger(event.dwell_ms) || Number(event.dwell_ms) < 3_000 || Number(event.dwell_ms) > 300_000) return false;
  } else if (event.dwell_ms !== null) return false;
  if (typeof event.client_occurred_at !== 'string' || Number.isNaN(Date.parse(event.client_occurred_at))) return false;
  return !!event.context && typeof event.context === 'object' && !Array.isArray(event.context);
}

export async function processInteractionsV2(req: AuthRequest, res: Response): Promise<void> {
  if (!getV2FeatureFlags().DB_SCHEMA_V2_WRITES) {
    res.status(404).json({ error: 'Interaction v2 writes are disabled.' }); return;
  }
  const userId = req.user?.userId;
  const events = req.body?.events;
  if (!userId) { res.status(401).json({ error: 'Authentication required.' }); return; }
  if (!Array.isArray(events) || events.length < 1 || events.length > 50 || !events.every(validateEvent)) {
    res.status(400).json({ error: 'Invalid v2 interaction batch.' }); return;
  }
  if (Buffer.byteLength(JSON.stringify(req.body)) > 256_000) {
    res.status(413).json({ error: 'Interaction batch exceeds 256 KB.' }); return;
  }
  try {
    res.status(202).json(await processInteractionBatchV2(userId, events));
  } catch (error) {
    console.error('[ActivityV2Controller] Transaction failed:', error);
    res.status(409).json({ error: error instanceof Error ? error.message : 'Interaction transaction failed.' });
  }
}
