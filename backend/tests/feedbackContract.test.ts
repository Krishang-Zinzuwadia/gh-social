import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_FEEDBACK_ACTIONS,
  FEEDBACK_WEIGHTS,
  isFeedbackInteraction,
} from '../config/feedback.js';
import {
  FEEDBACK_ACTIONS,
  buildCanonicalFeedbackEvent,
  type FeedbackAction,
} from '@gh-social/feedback-events';
import { getMlFeedbackDisposition } from '../services/mlService.js';

function buildEvent(action: FeedbackAction, sequence: number) {
  return buildCanonicalFeedbackEvent({
    event_id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    occurred_at: `2026-07-14T00:00:${String(sequence).padStart(2, '0')}.000Z`,
    user_id: '65df25de-10fe-4777-8f94-2db42a1f27f5',
    repo_id: '4ea47d7f-5095-4137-8fbc-c6a16722bb03',
    action,
    ...(action === FEEDBACK_ACTIONS.dwell ? { dwell_seconds: 31 } : {}),
  });
}

test('every backend feedback action is accepted or intentionally log-only in ML', () => {
  const dispositions = CANONICAL_FEEDBACK_ACTIONS.map((action, index) => {
    assert.equal(isFeedbackInteraction(action), true);
    const event = buildEvent(action, index + 1);
    return [action, getMlFeedbackDisposition(event)] as const;
  });

  assert.deepEqual(dispositions, [
    ['impression', 'log_only'],
    ['dwell', 'accepted'],
    ['readme_open', 'accepted'],
    ['github_open', 'accepted'],
    ['like', 'accepted'],
    ['save', 'accepted'],
    ['share', 'accepted'],
    ['dislike', 'accepted'],
    ['unlike', 'accepted'],
    ['unsave', 'accepted'],
    ['undislike', 'accepted'],
  ]);
});

test('backend weights are derived from the canonical vocabulary', () => {
  assert.deepEqual(Object.keys(FEEDBACK_WEIGHTS), [...CANONICAL_FEEDBACK_ACTIONS]);
  assert.equal(FEEDBACK_WEIGHTS.impression, 0);
  assert.ok(FEEDBACK_WEIGHTS.readme_open > FEEDBACK_WEIGHTS.impression);
  assert.ok(FEEDBACK_WEIGHTS.github_open > FEEDBACK_WEIGHTS.readme_open);
  assert.ok(FEEDBACK_WEIGHTS.save > FEEDBACK_WEIGHTS.github_open);
});
