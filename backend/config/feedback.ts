export const FEEDBACK_WEIGHTS = {
  like: 1.0,
  save: 0.8,
  dislike: -1.0,
  unlike: 0.0,
  unsave: 0.0,
  click: 0.2,
  skip: -0.2,
} as const;

export type FeedbackInteraction = keyof typeof FEEDBACK_WEIGHTS | 'dwell';

export function isFeedbackInteraction(value: unknown): value is FeedbackInteraction {
  return typeof value === 'string'
    && (value === 'dwell' || Object.hasOwn(FEEDBACK_WEIGHTS, value));
}
