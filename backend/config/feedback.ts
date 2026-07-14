import {
  CANONICAL_FEEDBACK_ACTIONS,
  FEEDBACK_EVENT_POLICIES,
  isCanonicalFeedbackAction,
  normalizeFeedbackAction,
  type FeedbackAction,
} from '@gh-social/feedback-events';

export { CANONICAL_FEEDBACK_ACTIONS, normalizeFeedbackAction };
export type FeedbackInteraction = FeedbackAction;

export const FEEDBACK_WEIGHTS: Readonly<Record<FeedbackInteraction, number>> = Object.freeze(
  Object.fromEntries(
    CANONICAL_FEEDBACK_ACTIONS.map((action) => [action, FEEDBACK_EVENT_POLICIES[action].intent_weight]),
  ) as Record<FeedbackInteraction, number>,
);

export function isFeedbackInteraction(value: unknown): value is FeedbackInteraction {
  return isCanonicalFeedbackAction(value);
}
