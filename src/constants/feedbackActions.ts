export {
  CANONICAL_FEEDBACK_ACTIONS,
  FEEDBACK_ACTIONS,
  LONG_DWELL_SECONDS,
  normalizeFeedbackAction,
} from '@gh-social/feedback-events';
export type { FeedbackAction, FeedbackEventInput } from '@gh-social/feedback-events';

// A card must remain at least 50% visible for this long before we count
// an impression. This keeps quick passive swipes neutral.
export const IMPRESSION_VISIBILITY_THRESHOLD_MS = 1000;

// Dwell mirrors the ML service's accidental-scroll threshold.
export const DWELL_VISIBILITY_THRESHOLD_MS = 3000;
