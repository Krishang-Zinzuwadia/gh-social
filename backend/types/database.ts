import type { LanguageBreakdown } from './github.js';

// ─── Activity Table ─────────────────────────────────────────────────────────

export interface ActivityRow {
  activity_id: string;
  user_id: string;
  repo_id: string;
  time_spent: string | null;
  likelihood_count: number;
  is_saved: boolean;
}

export interface ActivityInsert extends Omit<ActivityRow, 'activity_id' | 'time_spent' | 'likelihood_count' | 'is_saved'> {
  time_spent?: string | null;
  likelihood_count?: number;
  is_saved?: boolean;
}

export type ActivityUpdate = Partial<ActivityInsert>;

// ─── Users Table ────────────────────────────────────────────────────────────

export interface UserRow {
  user_id: string;
  username: string;
  github_id: string | null;
  github_handle: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  saved_repos_count: number;
  interests: string[];
  created_at: string;
}

export interface UserInsert extends Omit<UserRow, 'created_at' | 'followers_count' | 'following_count' | 'saved_repos_count' | 'interests'> {
  followers_count?: number;
  following_count?: number;
  saved_repos_count?: number;
  interests?: string[];
  created_at?: string;
}

export type UserUpdate = Partial<UserInsert>;

export type UserProfile = Pick<
  UserRow,
  | 'username'
  | 'github_handle'
  | 'avatar_url'
  | 'followers_count'
  | 'following_count'
  | 'saved_repos_count'
  | 'interests'
  | 'created_at'
>;

// ─── Follows Table ──────────────────────────────────────────────────────────

export interface FollowRow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type FollowInsert = Omit<FollowRow, 'created_at'> & { created_at?: string };

export type FollowUpdate = Partial<FollowInsert>;

// ─── Comment Table ──────────────────────────────────────────────────────────

export interface CommentRow {
  comment_id: string;
  user_id: string;
  repo_id: string;
  parent_comment_id: string | null;
  comment: string;
  created_at: string;
}

export type CommentInsert = Omit<CommentRow, 'comment_id' | 'created_at'> & { created_at?: string };

export type CommentUpdate = Partial<CommentInsert>;

// ─── Repo Table ─────────────────────────────────────────────────────────────

export interface RepoRow {
  repo_id: string;
  github_repo_url: string;
  owner_id: string;
  repo_name: string;
  full_name: string;
  description: string | null;
  language_used: LanguageBreakdown[];
  topics: string[];
  readme_summary: string | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number;
  forks_count: number;
  pr_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface RepoInsert extends Omit<RepoRow, 'repo_id' | 'language_used' | 'topics' | 'likes_count' | 'comments_count' | 'saves_count' | 'views_count' | 'forks_count' | 'pr_count' | 'created_at' | 'updated_at'> {
  language_used?: LanguageBreakdown[];
  topics?: string[];
  likes_count?: number;
  comments_count?: number;
  saves_count?: number;
  views_count?: number;
  forks_count?: number;
  pr_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type RepoUpdate = Partial<RepoInsert>;

// ─── Boards Table ───────────────────────────────────────────────────────────

export interface BoardRow {
  board_id: string;
  user_id: string;
  board_name: string;
  visibility: 'public' | 'private';
  description: string | null;
  repos_count: number;
  created_at: string | null;
}

export interface BoardInsert extends Omit<BoardRow, 'board_id' | 'repos_count' | 'created_at'> {
  repos_count?: number;
  created_at?: string | null;
}

export type BoardUpdate = Partial<BoardInsert>;

// Board - Repo join table
export interface BoardRepoRow {
  board_id: string;
  repo_id: string;
  added_at: string | null;
}

export type BoardRepoInsert = Omit<BoardRepoRow, 'added_at'> & { added_at?: string | null };

// ─── Boards Containers (containers that hold multiple boards) ────────────────

export interface BoardsContainerRow {
  container_id: string;
  user_id: string;
  container_name: string;
  description: string | null;
  created_at: string | null;
}

export interface BoardsContainerInsert extends Omit<BoardsContainerRow, 'container_id' | 'created_at'> {
  created_at?: string | null;
}

export interface ContainerBoardRow {
  container_id: string;
  board_id: string;
  added_at: string | null;
}

export type ContainerBoardInsert = Omit<ContainerBoardRow, 'added_at'> & { added_at?: string | null };

