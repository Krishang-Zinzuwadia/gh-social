# Person B Verification - Feed and ML Runtime

Date: 2026-07-15

## Results

| Gate | Result | Evidence |
|---|---|---|
| Backend unit/contract suite | Pass | 12 default tests passed; integration tests are opt-in. |
| Backend DB/Redis integration | Pass | 14/14 tests with PostgreSQL and Redis enabled. |
| Registered HTTP v2 flow | Pass | Feed, interaction, ingestion, outbox, readiness, internal auth, and request correlation passed through Express. |
| Redis reservation crash recovery | Pass | Reserved items survived client disconnect, were released in order, reserved again, and committed. |
| Redis Stream crash/reclaim | Pass | Pending message was reclaimed by a second consumer with `XAUTOCLAIM` and acknowledged once. |
| Redis outage fallback | Pass | Feed bypassed personalization, persisted a trending serve, and remained replayable. |
| ML timeout/invalid/429/5xx | Pass | Timeout is retryable; invalid envelopes fail; `429`/`5xx` retry; permanent `4xx` terminates; `Retry-After` is honored. |
| Feed cache-hit objective | Pass locally | Service-level p95 remained below the proposed 250 ms objective. |
| ML regression suite | Pass | 125 passed; 17 explicitly marked integration/benchmark/slow were excluded. |
| Online ML without PostgreSQL | Pass locally | With empty `DATABASE_URL`, v2 health reported Qdrant and Redis healthy and `database_required=false`. |
| Durable v2 feedback acceptance | Pass | Authenticated event returned 202 and appeared once in `ml:feedback:v2`. |
| Qdrant canonical identity | **Fail / cutover blocker** | 165 points audited: 0 canonical, 150 mismatched, 15 missing `payload.repo_id`. |

## Qdrant Finding

The local `osiris_research_corpus` still uses the rejected legacy identity scheme: point IDs are UUID5-like values and payload `repo_id` is generally `owner/name`. No points were mutated. Reindexing requires the backend mapping from GitHub numeric ID to canonical backend UUID. Run:

```powershell
$env:QDRANT_REPOSITORY_COLLECTION='target-collection'
npm.cmd run qdrant:audit
```

The command must report `cutover_ready: true` before `ML_V2_RECOMMENDATIONS` can be enabled.

## Production-Only Gates

- Run load tests at expected feed and interaction concurrency.
- Complete the agreed shadow/canary soak period and record p95/p99, fallback, unknown-ID, and dead-outbox rates.
- Verify model/scaler artifact compatibility in the target ML deployment.

