export const FEEDBACK_SCHEMA_VERSION: 1;

export const CANONICAL_FEEDBACK_ACTIONS: readonly [
  'impression',
  'dwell',
  'readme_open',
  'github_open',
  'like',
  'save',
  'share',
  'dislike',
  'unlike',
  'unsave',
  'undislike',
];

export type FeedbackAction = typeof CANONICAL_FEEDBACK_ACTIONS[number];
export type IntentStrength = 'neutral' | 'weak' | 'strong' | 'negative' | 'reversal';
export type FeatureOperation = 'increment' | 'accumulate' | 'set' | 'clear';

export const FEEDBACK_ACTIONS: Readonly<{
  impression: 'impression';
  dwell: 'dwell';
  readmeOpen: 'readme_open';
  githubOpen: 'github_open';
  like: 'like';
  save: 'save';
  share: 'share';
  dislike: 'dislike';
  unlike: 'unlike';
  unsave: 'unsave';
  undislike: 'undislike';
}>;

export const LEGACY_FEEDBACK_ACTION_ALIASES: Readonly<{
  click: 'readme_open';
  skip: 'impression';
}>;

export const LONG_DWELL_SECONDS: 30;

export interface FeedbackEventPolicy {
  model_update: boolean;
  intent_weight: number;
  intent_strength: IntentStrength;
  feature_operation: FeatureOperation;
  reverses?: FeedbackAction;
}

export const FEEDBACK_EVENT_POLICIES: Readonly<Record<FeedbackAction, Readonly<FeedbackEventPolicy>>>;

export interface FeedbackEventInput {
  repo_id: string;
  action: FeedbackAction;
  dwell_seconds?: number;
}

export interface FeedbackEventSource extends FeedbackEventInput {
  user_id: string;
  event_id: string;
  occurred_at: string;
}

export interface CanonicalFeedbackEvent extends FeedbackEventSource, FeedbackEventPolicy {
  schema_version: 1;
}

export interface ReplayedFeedbackFeatures {
  impression_count: number;
  readme_open_count: number;
  github_open_count: number;
  share_count: number;
  dwell_seconds: number;
  long_dwell_count: number;
  liked: boolean;
  saved: boolean;
  disliked: boolean;
  model_update_count: number;
}

export function isCanonicalFeedbackAction(value: unknown): value is FeedbackAction;
export function normalizeFeedbackAction(value: unknown): FeedbackAction | null;
export function getFeedbackEventPolicy(action: FeedbackAction, dwellSeconds?: number): FeedbackEventPolicy;
export function buildCanonicalFeedbackEvent(input: FeedbackEventSource): CanonicalFeedbackEvent;
export function replayFeedbackEvents(events: readonly CanonicalFeedbackEvent[]): ReplayedFeedbackFeatures;
