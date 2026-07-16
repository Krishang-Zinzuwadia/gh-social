# Window 5 Controlled Integration

## Wired Components

- Routes: `/api/v2/feed`, `/api/v2/interactions/batch`, `/api/internal/v2/ingestion/*`.
- Operations: `/healthz`, `/readyz`, `/api/internal/v2/operations/status`, dead-outbox replay.
- Runtime: ML outbox, feed reservation reconciliation, data reconciliation, and retention loops with graceful shutdown.
- Adapters: PostgreSQL feed/ingestion persistence, Redis reservation queue, authenticated ML v2 client.
- Compatibility: legacy feed and batch-interaction endpoints enter v2 only behind rollout flags/cohorts.
- Shadow: ML v2 results are validated and recorded without replacing the returned legacy feed.
- Traceability: request, feed request, serve, generation, event, feedback version, outbox, model, and source identifiers are retained.

## Combined Flow Evidence

1. Bulk repository upsert returns canonical mapping and creates an indexing outbox row.
2. Onboarding delivery has a post-acceptance feed prewarm hook.
3. Feed miss generates when enabled, otherwise persists trending fallback; Redis loss also falls back.
4. Duplicate feed request returns the same persisted serve.
5. Interaction target-state mutation, version update, event, and outbox commit atomically.
6. Retry classification and idempotency key propagation are covered by tests.
7. Generation checks feed version before queue replacement and records stale attempts.
8. ML or Redis failure does not roll back product state.

## Dark Deploy Defaults

All cutover flags default false except `TRENDING_FALLBACK`. Invalid dependencies fail runtime startup. See `backend/.env.example`.

