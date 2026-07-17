# V2 Cutover And Rollback Runbook

## Preconditions

Do not start canary traffic unless all verification reports are current, `schema:audit` passes on the target database, Qdrant audit reports one canonical identity per active repository, dead outbox count is zero, restore evidence is current, and named data/runtime operators approve.

## Deployment And Enablement Order

1. Deploy code with all v2 flags dark and `TRENDING_FALLBACK=true`.
2. Run migration, schema audit, backfill, and reconciliation on the target environment.
3. Enable `DB_SCHEMA_V2_WRITES=true` and `ML_FEEDBACK_OUTBOX=true`; keep v2 reads off.
4. Enable `FEED_RESERVATIONS=true` and verify reconciliation workers.
5. Set `FEED_V2_SHADOW_PERCENT` to a small internal cohort and observe generation attempts.
6. After canonical Qdrant audit passes, enable `ML_QDRANT_ONLY=true`, `FEED_V2=true`, and `ML_V2_RECOMMENDATIONS=true`.
7. Increase `FEED_V2_CANARY_PERCENT` through `1`, `5`, `20`, `50`, and `100` only after the agreed soak at each gate.
8. Enable `DB_SCHEMA_V2_READS=true` last. Keep legacy objects read-only for the compatibility window.

## Hold Criteria

- Any unknown or inactive ML repository ID.
- Any duplicate side effect or feedback-version regression.
- Dead outbox rows above zero or oldest pending age above 60 seconds while ML is healthy.
- Feed p95 above 250 ms, interaction p95 above 300 ms, or fallback availability below 99.9%.
- Qdrant/Redis health failure without successful trending fallback.
- Database lock, connection, WAL, or error-rate threshold breach.

## Operational Rollback

1. Set `FEED_V2_CANARY_PERCENT=0` and `FEED_V2_SHADOW_PERCENT=0`.
2. Disable `ML_V2_RECOMMENDATIONS` and keep `TRENDING_FALLBACK=true`.
3. Pause `ML_FEEDBACK_OUTBOX` if ML acceptance is unsafe; never delete pending rows.
4. Keep `DB_SCHEMA_V2_WRITES` enabled after v2 writes have begun. Do not deploy an old binary that cannot read the new source of truth.
5. Use the authenticated replay endpoint after the downstream defect is corrected.
6. Roll forward a fixed backend/ML version. Additive schemas remain in place.

## Restore

Before production cutover, record the Supabase PITR restore point, create a verified logical backup, restore into a separate project, run `schema:audit`, recreate `ghsocial_backend`, `ghsocial_worker`, and `ghsocial_migrator`, rotate internal credentials, and record measured RPO/RTO.

## Current Decision

**HOLD.** Local Qdrant canonical-identity audit fails. The backend is dark-deploy and controlled-integration ready, but production Window 6 approval is prohibited until reindex plus soak evidence satisfies the release gates.

