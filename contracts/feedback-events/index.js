export const FEEDBACK_SCHEMA_VERSION = 1;

export const CANONICAL_FEEDBACK_ACTIONS = Object.freeze([
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
]);

export const FEEDBACK_ACTIONS = Object.freeze({
  impression: 'impression',
  dwell: 'dwell',
  readmeOpen: 'readme_open',
  githubOpen: 'github_open',
  like: 'like',
  save: 'save',
  share: 'share',
  dislike: 'dislike',
  unlike: 'unlike',
  unsave: 'unsave',
  undislike: 'undislike',
});

// Old producers are normalized at ingestion instead of being silently dropped.
export const LEGACY_FEEDBACK_ACTION_ALIASES = Object.freeze({
  click: FEEDBACK_ACTIONS.readmeOpen,
  skip: FEEDBACK_ACTIONS.impression,
});

export const LONG_DWELL_SECONDS = 30;

export const FEEDBACK_EVENT_POLICIES = Object.freeze({
  impression: Object.freeze({
    model_update: false,
    intent_weight: 0,
    intent_strength: 'neutral',
    feature_operation: 'increment',
  }),
  dwell: Object.freeze({
    model_update: true,
    intent_weight: 0.2,
    intent_strength: 'weak',
    feature_operation: 'accumulate',
  }),
  readme_open: Object.freeze({
    model_update: true,
    intent_weight: 0.6,
    intent_strength: 'strong',
    feature_operation: 'increment',
  }),
  github_open: Object.freeze({
    model_update: true,
    intent_weight: 0.8,
    intent_strength: 'strong',
    feature_operation: 'increment',
  }),
  like: Object.freeze({
    model_update: true,
    intent_weight: 1,
    intent_strength: 'strong',
    feature_operation: 'set',
  }),
  save: Object.freeze({
    model_update: true,
    intent_weight: 0.9,
    intent_strength: 'strong',
    feature_operation: 'set',
  }),
  share: Object.freeze({
    model_update: true,
    intent_weight: 0.7,
    intent_strength: 'strong',
    feature_operation: 'increment',
  }),
  dislike: Object.freeze({
    model_update: true,
    intent_weight: -1,
    intent_strength: 'negative',
    feature_operation: 'set',
  }),
  unlike: Object.freeze({
    model_update: true,
    intent_weight: 0,
    intent_strength: 'reversal',
    feature_operation: 'clear',
    reverses: 'like',
  }),
  unsave: Object.freeze({
    model_update: true,
    intent_weight: 0,
    intent_strength: 'reversal',
    feature_operation: 'clear',
    reverses: 'save',
  }),
  undislike: Object.freeze({
    model_update: true,
    intent_weight: 0,
    intent_strength: 'reversal',
    feature_operation: 'clear',
    reverses: 'dislike',
  }),
});

const canonicalFeedbackActionSet = new Set(CANONICAL_FEEDBACK_ACTIONS);

export function isCanonicalFeedbackAction(value) {
  return typeof value === 'string' && canonicalFeedbackActionSet.has(value);
}

export function normalizeFeedbackAction(value) {
  if (isCanonicalFeedbackAction(value)) return value;
  if (typeof value !== 'string') return null;
  return LEGACY_FEEDBACK_ACTION_ALIASES[value] ?? null;
}

export function getFeedbackEventPolicy(action, dwellSeconds) {
  if (!isCanonicalFeedbackAction(action)) {
    throw new TypeError(`Unsupported feedback action: ${String(action)}`);
  }

  const policy = FEEDBACK_EVENT_POLICIES[action];
  if (action !== FEEDBACK_ACTIONS.dwell || (dwellSeconds ?? 0) < LONG_DWELL_SECONDS) {
    return { ...policy };
  }

  return {
    ...policy,
    intent_weight: 0.75,
    intent_strength: 'strong',
  };
}

export function buildCanonicalFeedbackEvent(input) {
  const action = normalizeFeedbackAction(input?.action);
  if (!action) {
    throw new TypeError(`Unsupported feedback action: ${String(input?.action)}`);
  }
  if (typeof input.user_id !== 'string' || input.user_id.length === 0) {
    throw new TypeError('user_id is required');
  }
  if (typeof input.repo_id !== 'string' || input.repo_id.length === 0) {
    throw new TypeError('repo_id is required');
  }
  if (action === FEEDBACK_ACTIONS.dwell
    && (typeof input.dwell_seconds !== 'number' || !Number.isFinite(input.dwell_seconds) || input.dwell_seconds <= 0)) {
    throw new TypeError('dwell_seconds must be positive for dwell events');
  }

  const policy = getFeedbackEventPolicy(action, input.dwell_seconds);
  return {
    schema_version: FEEDBACK_SCHEMA_VERSION,
    event_id: input.event_id,
    occurred_at: input.occurred_at,
    user_id: input.user_id,
    repo_id: input.repo_id,
    action,
    ...(action === FEEDBACK_ACTIONS.dwell ? { dwell_seconds: input.dwell_seconds } : {}),
    ...policy,
  };
}

export function replayFeedbackEvents(events) {
  const features = {
    impression_count: 0,
    readme_open_count: 0,
    github_open_count: 0,
    share_count: 0,
    dwell_seconds: 0,
    long_dwell_count: 0,
    liked: false,
    saved: false,
    disliked: false,
    model_update_count: 0,
  };

  const orderedEvents = [...events].sort((left, right) => {
    const timeOrder = String(left.occurred_at).localeCompare(String(right.occurred_at));
    return timeOrder || String(left.event_id).localeCompare(String(right.event_id));
  });

  for (const event of orderedEvents) {
    if (!isCanonicalFeedbackAction(event.action)) {
      throw new TypeError(`Cannot replay unsupported feedback action: ${String(event.action)}`);
    }
    if (event.model_update) features.model_update_count += 1;

    switch (event.action) {
      case FEEDBACK_ACTIONS.impression:
        features.impression_count += 1;
        break;
      case FEEDBACK_ACTIONS.dwell:
        features.dwell_seconds += event.dwell_seconds ?? 0;
        if ((event.dwell_seconds ?? 0) >= LONG_DWELL_SECONDS) features.long_dwell_count += 1;
        break;
      case FEEDBACK_ACTIONS.readmeOpen:
        features.readme_open_count += 1;
        break;
      case FEEDBACK_ACTIONS.githubOpen:
        features.github_open_count += 1;
        break;
      case FEEDBACK_ACTIONS.share:
        features.share_count += 1;
        break;
      case FEEDBACK_ACTIONS.like:
        features.liked = true;
        features.disliked = false;
        break;
      case FEEDBACK_ACTIONS.save:
        features.saved = true;
        break;
      case FEEDBACK_ACTIONS.dislike:
        features.disliked = true;
        features.liked = false;
        break;
      case FEEDBACK_ACTIONS.unlike:
        features.liked = false;
        break;
      case FEEDBACK_ACTIONS.unsave:
        features.saved = false;
        break;
      case FEEDBACK_ACTIONS.undislike:
        features.disliked = false;
        break;
    }
  }

  return features;
}
