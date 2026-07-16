# Person A Verification - Data and Durable Events

Date: 2026-07-15

## Environment

- Disposable PostgreSQL 16 container: `gh-social-v2-test`, host port `55432`.
- Production Supabase was not modified.
- `BOOTSTRAP_SUPABASE_AUTH_STUB=1` was used only for the generic PostgreSQL empty-database drill. It is forbidden when `NODE_ENV=production`.

## Results

| Gate | Result | Evidence |
|---|---|---|
| Empty migration | Pass | All migrations `0000` through `0008` applied. |
| Migration re-run | Pass | Second run was a no-op. |
| Schema/grant audit | Pass | 27 v2 tables and 9 migration hashes; no `anon`/`authenticated` grants. |
| Backfill re-run | Pass | Counts and deterministic checksums matched on consecutive runs; zero unexplained rejects in the fixture. |
| Interaction idempotency | Pass | Duplicate event returns duplicate; same ID with different content is rejected. |
| Interaction concurrency | Pass | Concurrent opposing reactions serialize without deadlock and preserve mutual exclusion. |
| Counter reconciliation | Pass | Recomputed reaction totals match authoritative state. |
| Outbox multi-worker claim | Pass | Concurrent workers claimed distinct rows using `SKIP LOCKED`. |
| Outbox terminal/replay | Pass | Permanent failure moved to dead state and operator replay returned it to pending. |
| HTTP transaction/outbox | Pass | Authenticated interaction committed product state and outbox in one request. |
| Backup/restore drill | Pass | `pg_dump` custom archive restored to `ghsocial_restore`; restored schema audit passed. |

## Defects Found And Fixed

1. Generic PostgreSQL migration required an explicit non-production `auth.users` stub because historical migrations assume Supabase.
2. JSON payloads were bound as generic objects; all v2 interaction and ingestion writes now serialize explicitly to `jsonb`.
3. Reaction reversal deltas violated nonnegative checks before `ON CONFLICT`; aggregate rows are now ensured before bounded updates.
4. Legacy backfill assumed a nonexistent `likes_given_count`; it now derives likes and saves from authoritative activity rows.
5. Backfill conflict handlers changed timestamps on every run; updates are now conditional and checksum-stable.
6. User and repository topic mappings are included in backfill counts and checksums.

## Production-Only Gates

- A production-like clone migration must be executed against a current sanitized Supabase clone.
- Supabase PITR availability and RPO/RTO must be recorded by the production database owner.
- Connection saturation, WAL growth, and slow-query thresholds require staging/production telemetry.

