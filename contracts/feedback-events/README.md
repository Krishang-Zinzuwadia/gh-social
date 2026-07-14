# Feedback event contract

This package is the source of truth for feedback emitted by the Expo client,
stored by the backend, and consumed by ML.

All events use the semantic canonical action names in
`CANONICAL_FEEDBACK_ACTIONS`. The legacy `click` and `skip` names are accepted
only at ingestion and normalized to `readme_open` and neutral `impression`
events respectively.

`impression` is delivered with `model_update: false`, so ML logs it without a
strong feature update. Reversal events use `feature_operation: "clear"` and a
`reverses` target. Dwell is considered strong intent at 30 seconds or longer.

Consumers in other languages should validate payloads with
`feedback-event.schema.json` and apply events in `(occurred_at, event_id)` order
when rebuilding features.
