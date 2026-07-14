import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  CANONICAL_FEEDBACK_ACTIONS,
  FEEDBACK_ACTIONS,
  FEEDBACK_EVENT_POLICIES,
  LONG_DWELL_SECONDS,
  buildCanonicalFeedbackEvent,
  getFeedbackEventPolicy,
  normalizeFeedbackAction,
  replayFeedbackEvents,
} from './index.js';

const userId = '65df25de-10fe-4777-8f94-2db42a1f27f5';
const repoId = '4ea47d7f-5095-4137-8fbc-c6a16722bb03';

function event(action, sequence, overrides = {}) {
  return buildCanonicalFeedbackEvent({
    event_id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    occurred_at: `2026-07-14T00:00:${String(sequence).padStart(2, '0')}.000Z`,
    user_id: userId,
    repo_id: repoId,
    action,
    ...(action === FEEDBACK_ACTIONS.dwell ? { dwell_seconds: 4 } : {}),
    ...overrides,
  });
}

test('the JSON schema and runtime export the same canonical vocabulary', async () => {
  const schema = JSON.parse(
    await readFile(new URL('./feedback-event.schema.json', import.meta.url), 'utf8'),
  );

  assert.deepEqual(schema.$defs.action.enum, [...CANONICAL_FEEDBACK_ACTIONS]);
  assert.deepEqual(Object.keys(FEEDBACK_EVENT_POLICIES), [...CANONICAL_FEEDBACK_ACTIONS]);
  assert.deepEqual(new Set(Object.values(FEEDBACK_ACTIONS)), new Set(CANONICAL_FEEDBACK_ACTIONS));
});

test('legacy ML terms are normalized instead of dropped', () => {
  assert.equal(normalizeFeedbackAction('click'), FEEDBACK_ACTIONS.readmeOpen);
  assert.equal(normalizeFeedbackAction('skip'), FEEDBACK_ACTIONS.impression);
  assert.equal(normalizeFeedbackAction('unknown'), null);
});

test('impressions are log-only and strong-intent signals update the model', () => {
  const impression = event(FEEDBACK_ACTIONS.impression, 1);
  const readmeOpen = event(FEEDBACK_ACTIONS.readmeOpen, 2);
  const githubOpen = event(FEEDBACK_ACTIONS.githubOpen, 3);
  const save = event(FEEDBACK_ACTIONS.save, 4);
  const shortDwellPolicy = getFeedbackEventPolicy(FEEDBACK_ACTIONS.dwell, 5);
  const longDwellPolicy = getFeedbackEventPolicy(FEEDBACK_ACTIONS.dwell, LONG_DWELL_SECONDS);

  assert.equal(impression.model_update, false);
  assert.equal(impression.intent_weight, 0);
  for (const strongEvent of [readmeOpen, githubOpen, save]) {
    assert.equal(strongEvent.model_update, true);
    assert.equal(strongEvent.intent_strength, 'strong');
    assert.ok(strongEvent.intent_weight > impression.intent_weight);
  }
  assert.equal(shortDwellPolicy.intent_strength, 'weak');
  assert.equal(longDwellPolicy.intent_strength, 'strong');
  assert.ok(longDwellPolicy.intent_weight > shortDwellPolicy.intent_weight);
});

test('negative and reversal events carry replayable feature operations', () => {
  assert.equal(event(FEEDBACK_ACTIONS.dislike, 1).intent_strength, 'negative');
  assert.deepEqual(
    [
      event(FEEDBACK_ACTIONS.unlike, 2),
      event(FEEDBACK_ACTIONS.unsave, 3),
      event(FEEDBACK_ACTIONS.undislike, 4),
    ].map(({ action, feature_operation, reverses }) => ({ action, feature_operation, reverses })),
    [
      { action: 'unlike', feature_operation: 'clear', reverses: 'like' },
      { action: 'unsave', feature_operation: 'clear', reverses: 'save' },
      { action: 'undislike', feature_operation: 'clear', reverses: 'dislike' },
    ],
  );
});

test('canonical events can be replayed into deterministic model features', () => {
  const features = replayFeedbackEvents([
    event(FEEDBACK_ACTIONS.impression, 1),
    event(FEEDBACK_ACTIONS.readmeOpen, 2),
    event(FEEDBACK_ACTIONS.githubOpen, 3),
    event(FEEDBACK_ACTIONS.like, 4),
    event(FEEDBACK_ACTIONS.unlike, 5),
    event(FEEDBACK_ACTIONS.save, 6),
    event(FEEDBACK_ACTIONS.unsave, 7),
    event(FEEDBACK_ACTIONS.dislike, 8),
    event(FEEDBACK_ACTIONS.undislike, 9),
    event(FEEDBACK_ACTIONS.dwell, 10, { dwell_seconds: LONG_DWELL_SECONDS }),
  ]);

  assert.deepEqual(features, {
    impression_count: 1,
    readme_open_count: 1,
    github_open_count: 1,
    share_count: 0,
    dwell_seconds: LONG_DWELL_SECONDS,
    long_dwell_count: 1,
    liked: false,
    saved: false,
    disliked: false,
    model_update_count: 9,
  });
});
