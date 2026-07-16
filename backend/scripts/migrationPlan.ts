export const LEGACY_BASELINE_TAGS = [
  '0000_initial_schema',
  '0001_custom_triggers',
  '0002_add_indexes',
  '0003_container_boards_rls',
  '0004_wonderful_bullseye',
  '0005_wise_skrulls',
  '0006_sad_cobalt_man',
  '0007_add_user_feedback',
] as const;

// These migrations were merged into the journal with timestamps older than
// the parent branch's already-applied 0007 entry. Drizzle compares against the
// newest recorded timestamp, so parent-history databases need them reconciled
// explicitly before the normal migrator runs.
export const RETROACTIVE_LEGACY_TAGS = [
  '0004_add_likes_given',
  '0005_add_is_saved',
] as const;
