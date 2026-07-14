import { pgTable, uuid, varchar, text, date, integer, doublePrecision, jsonb, boolean, timestamp, primaryKey, unique, interval, check, AnyPgColumn, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// 1. USERS
export const users = pgTable('users', {
  user_id: uuid('user_id').primaryKey().notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  full_name: varchar('full_name', { length: 100 }),
  date_of_birth: date('date_of_birth', { mode: 'string' }),
  bio: text('bio'),
  github_url: varchar('github_url', { length: 512 }),
  github_id: varchar('github_id', { length: 100 }).unique(),
  github_handle: varchar('github_handle', { length: 100 }),
  avatar_url: varchar('avatar_url', { length: 512 }),
  followers_count: integer('followers_count').default(0),
  following_count: integer('following_count').default(0),
  likes_given_count: integer('likes_given_count').default(0),
  saved_repos_count: integer('saved_repos_count').default(0),
  interests: jsonb('interests').default('[]').notNull(),
  skills: jsonb('skills').default('[]').notNull(),
  tech_stack: jsonb('tech_stack').default('[]').notNull(),
  onboarding_completed: boolean('onboarding_completed').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 2. FOLLOWS
export const follows = pgTable('follows', {
  follower_id: uuid('follower_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  following_id: uuid('following_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.follower_id, t.following_id] }),
  noSelfFollow: check('no_self_follow', sql`${t.follower_id} <> ${t.following_id}`),
  followerIdx: index('follows_follower_id_idx').on(t.follower_id),
  followingIdx: index('follows_following_id_idx').on(t.following_id),
}));

// 3. REFRESH TOKENS
export const refreshTokens = pgTable('refresh_tokens', {
  token_id: uuid('token_id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  refresh_token_hash: text('refresh_token_hash').notNull().unique(),
  expires_at: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  is_revoked: boolean('is_revoked').default(false),
  last_used_at: timestamp('last_used_at', { withTimezone: true, mode: 'string' }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 4. OAUTH CODES
export const oauthCodes = pgTable('oauth_codes', {
  code: uuid('code').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
});

// 5. REPOS
export const repos = pgTable('repo', {
  repo_id: uuid('repo_id').defaultRandom().primaryKey(),
  github_repo_url: varchar('github_repo_url', { length: 200 }).notNull().unique(),
  owner_id: varchar('owner_id', { length: 100 }).notNull(),
  repo_name: varchar('repo_name', { length: 200 }).notNull(),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  description: text('description'),
  language_used: jsonb('language_used').default('[]'),
  topics: jsonb('topics').default('[]'),
  readme_summary: text('readme_summary'),
  readme_md: text('readme_md'),
  likes_count: integer('likes_count').default(0),
  comments_count: integer('comments_count').default(0),
  saves_count: integer('saves_count').default(0),
  views_count: integer('views_count').default(0),
  forks_count: integer('forks_count').default(0),
  star_count: integer('star_count').default(0),
  pr_count: integer('pr_count').default(0),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  ownerIdx: index('repos_owner_id_idx').on(t.owner_id),
}));

// 6. ACTIVITY
export const activities = pgTable('activity', {
  activity_id: uuid('activity_id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  repo_id: uuid('repo_id').references(() => repos.repo_id, { onDelete: 'cascade' }).notNull(),
  time_spent: interval('time_spent'),
  likelihood_count: integer('likelihood_count').default(0),
  is_saved: boolean('is_saved').default(false),
}, (t) => ({
  unq: unique('activity_user_repo_unique').on(t.user_id, t.repo_id),
  repoIdx: index('activity_repo_id_idx').on(t.repo_id),
}));

export const userFeedback = pgTable('user_feedback', {
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  repo_id: uuid('repo_id').references(() => repos.repo_id, { onDelete: 'cascade' }).notNull(),
  interaction_type: varchar('interaction_type', { length: 50 }).notNull(),
  feedback_score: doublePrecision('feedback_score').notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.repo_id, t.interaction_type] }),
  userUpdatedIdx: index('user_feedback_user_updated_idx').on(t.user_id, t.updated_at),
  scoreCheck: check(
    'user_feedback_score_range',
    sql`${t.feedback_score} >= -1.0 AND ${t.feedback_score} <= 1.0`,
  ),
}));

// Append-only canonical events are the replay source for ML features.
export const feedbackEventLog = pgTable('feedback_event_log', {
  event_id: uuid('event_id').primaryKey(),
  schema_version: integer('schema_version').notNull(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  repo_id: uuid('repo_id').references(() => repos.repo_id, { onDelete: 'cascade' }).notNull(),
  action: varchar('action', { length: 32 }).notNull(),
  dwell_seconds: doublePrecision('dwell_seconds'),
  model_update: boolean('model_update').notNull(),
  intent_weight: doublePrecision('intent_weight').notNull(),
  intent_strength: varchar('intent_strength', { length: 16 }).notNull(),
  feature_operation: varchar('feature_operation', { length: 16 }).notNull(),
  reverses: varchar('reverses', { length: 32 }),
  occurred_at: timestamp('occurred_at', { withTimezone: true, mode: 'string' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => ({
  userOccurredIdx: index('feedback_event_log_user_occurred_idx').on(t.user_id, t.occurred_at, t.event_id),
  repoOccurredIdx: index('feedback_event_log_repo_occurred_idx').on(t.repo_id, t.occurred_at, t.event_id),
  schemaVersionCheck: check('feedback_event_log_schema_version', sql`${t.schema_version} = 1`),
  actionCheck: check(
    'feedback_event_log_action',
    sql`${t.action} IN ('impression', 'dwell', 'readme_open', 'github_open', 'like', 'save', 'share', 'dislike', 'unlike', 'unsave', 'undislike')`,
  ),
  dwellCheck: check(
    'feedback_event_log_dwell',
    sql`(${t.action} = 'dwell' AND ${t.dwell_seconds} > 0) OR (${t.action} <> 'dwell' AND ${t.dwell_seconds} IS NULL)`,
  ),
  intentWeightCheck: check(
    'feedback_event_log_intent_weight',
    sql`${t.intent_weight} >= -1.0 AND ${t.intent_weight} <= 1.0`,
  ),
  intentStrengthCheck: check(
    'feedback_event_log_intent_strength',
    sql`${t.intent_strength} IN ('neutral', 'weak', 'strong', 'negative', 'reversal')`,
  ),
  featureOperationCheck: check(
    'feedback_event_log_feature_operation',
    sql`${t.feature_operation} IN ('increment', 'accumulate', 'set', 'clear')`,
  ),
  reversalCheck: check(
    'feedback_event_log_reversal',
    sql`(${t.action} = 'unlike' AND ${t.reverses} = 'like') OR (${t.action} = 'unsave' AND ${t.reverses} = 'save') OR (${t.action} = 'undislike' AND ${t.reverses} = 'dislike') OR (${t.action} NOT IN ('unlike', 'unsave', 'undislike') AND ${t.reverses} IS NULL)`,
  ),
  impressionPolicyCheck: check(
    'feedback_event_log_impression_policy',
    sql`${t.action} <> 'impression' OR (${t.model_update} = false AND ${t.intent_weight} = 0)`,
  ),
}));

// 7. COMMENT
export const comments = pgTable('comment', {
  comment_id: uuid('comment_id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  repo_id: uuid('repo_id').references(() => repos.repo_id, { onDelete: 'cascade' }).notNull(),
  parent_comment_id: uuid('parent_comment_id').references((): AnyPgColumn => comments.comment_id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  repoIdx: index('comment_repo_id_idx').on(t.repo_id),
  userIdx: index('comment_user_id_idx').on(t.user_id),
  parentCommentIdx: index('comment_parent_comment_id_idx').on(t.parent_comment_id),
}));

// 8. BOARDS
export const boards = pgTable('boards', {
  board_id: uuid('board_id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  board_name: varchar('board_name', { length: 100 }).notNull(),
  visibility: varchar('visibility', { length: 20 }).default('public').notNull(),
  description: text('description'),
  repos_count: integer('repos_count').default(0),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  visibilityCheck: check('visibility_check', sql`${t.visibility} IN ('public', 'private')`),
  userIdx: index('boards_user_id_idx').on(t.user_id),
}));

// 9. BOARD REPOS
export const boardRepos = pgTable('board_repos', {
  board_id: uuid('board_id').references(() => boards.board_id, { onDelete: 'cascade' }).notNull(),
  repo_id: uuid('repo_id').references(() => repos.repo_id, { onDelete: 'cascade' }).notNull(),
  added_at: timestamp('added_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.board_id, t.repo_id] }),
  repoIdx: index('board_repos_repo_id_idx').on(t.repo_id),
}));

// 10. BOARDS CONTAINERS
export const boardsContainers = pgTable('boards_containers', {
  container_id: uuid('container_id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.user_id, { onDelete: 'cascade' }).notNull(),
  container_name: varchar('container_name', { length: 100 }).default('boards_container').notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  userIdx: index('boards_containers_user_id_idx').on(t.user_id),
}));

// 11. CONTAINER BOARDS
export const containerBoards = pgTable('container_boards', {
  container_id: uuid('container_id').references(() => boardsContainers.container_id, { onDelete: 'cascade' }).notNull(),
  board_id: uuid('board_id').references(() => boards.board_id, { onDelete: 'cascade' }).notNull(),
  added_at: timestamp('added_at', { mode: 'string' }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.container_id, t.board_id] }),
  boardIdx: index('container_boards_board_id_idx').on(t.board_id),
}));

// 12. TRENDING REPOSITORIES
export const trendingRepos = pgTable('trending_repositories', {
  repo_id: uuid('repo_id').primaryKey(),
  full_name: varchar('full_name', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  owner: varchar('owner', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  description: text('description'),
  star_count: integer('star_count').default(0),
  daily_stars: integer('daily_stars').default(0),
  fork_count: integer('fork_count').default(0),
  primary_language: varchar('primary_language', { length: 50 }),
  topics: jsonb('topics').default('[]'),
  readme: text('readme'),
  trending_rank: integer('trending_rank'),
});
