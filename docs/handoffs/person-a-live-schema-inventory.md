# Live Schema Inventory

This is the read-only capture template for the v2 cutover. Record values from a production catalog export; never make live mutations from this document.

## Baseline Findings

- Legacy product objects are in `public`.
- All 16 observed product tables have RLS enabled and no policies.
- `public.migration_history` is empty in the reviewed live catalog.
- Live `user_feedback` uses `(user_id, repo_id)` while migration `0007` uses `(user_id, repo_id, interaction_type)`.
- Live-only objects include `trending_metadata`, `user_recommendation_batches`, additional trending columns, functions, and indexes.

## Catalog Capture

| Schema | Object | Kind | Owner | Rows | RLS | Notes |
| --- | --- | --- | --- | ---: | --- | --- |
| `public` | | | | | | |
| `app` | | | | | | |
| `telemetry` | | | | | | |

## Constraints And Indexes

| Schema.Object | Name | Type | Definition |
| --- | --- | --- | --- |
| | | | |

## Roles And Grants

| Role | Schema/Object | Privilege | Grantor |
| --- | --- | --- | --- |
| | | | |

## Migration History

| Runner | Migration | Hash | Applied At |
| --- | --- | --- | --- |
| | | | |
