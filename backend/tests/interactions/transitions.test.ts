import assert from 'node:assert/strict';
import test from 'node:test';

import { transitionReaction } from '../../services/activityV2Service.js';

test('reaction target-state transitions are retry safe', () => {
  assert.equal(transitionReaction(null, 'like'), 'like');
  assert.equal(transitionReaction('like', 'like'), 'like');
  assert.equal(transitionReaction('dislike', 'like'), 'like');
  assert.equal(transitionReaction('like', 'unlike'), null);
  assert.equal(transitionReaction(null, 'unlike'), null);
  assert.equal(transitionReaction('like', 'dislike'), 'dislike');
  assert.equal(transitionReaction('dislike', 'undislike'), null);
});
