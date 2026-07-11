export const FEEDBACK_WEIGHTS = {
  impression: 0.0,
  readme_open: 0.2,
  github_open: 0.3,
  like: 1.0,
  save: 0.8,
  share: 0.6,
  dislike: -1.0,
  undislike: 0.0,
  unlike: 0.0,
  unsave: 0.0,
} as const;

export type FeedbackInteraction = keyof typeof FEEDBACK_WEIGHTS | 'dwell';

export function isFeedbackInteraction(value: unknown): value is FeedbackInteraction {
  return typeof value === 'string'
    && (value === 'dwell' || Object.hasOwn(FEEDBACK_WEIGHTS, value));
}
