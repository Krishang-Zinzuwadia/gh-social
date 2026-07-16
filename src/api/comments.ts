import { API_URL } from './config';

export interface CommentRecord {
  comment_id: string;
  user_id: string;
  repo_id: string;
  parent_comment_id: string | null;
  comment: string;
  created_at: string | null;
}

export interface CommentAuthor {
  user_id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface CreateCommentInput {
  userId: string;
  repoId: string;
  comment: string;
  parentCommentId?: string | null;
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeComment(value: unknown): CommentRecord | null {
  if (!isObject(value)) return null;

  const commentId = value.comment_id;
  const userId = value.user_id;
  const repoId = value.repo_id;
  const body = value.comment;

  if (
    typeof commentId !== 'string' ||
    typeof userId !== 'string' ||
    typeof repoId !== 'string' ||
    typeof body !== 'string'
  ) {
    return null;
  }

  return {
    comment_id: commentId,
    user_id: userId,
    repo_id: repoId,
    parent_comment_id:
      typeof value.parent_comment_id === 'string' ? value.parent_comment_id : null,
    comment: body,
    created_at: typeof value.created_at === 'string' ? value.created_at : null,
  };
}

async function readEnvelope<T>(response: Response, fallbackMessage: string): Promise<T> {
  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // A non-JSON response is handled by the shared fallback below.
  }

  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }

  if (!payload || payload.data === undefined) {
    throw new Error(fallbackMessage);
  }

  return payload.data;
}

export async function getCommentsByRepo(
  repoId: string,
  signal?: AbortSignal,
): Promise<CommentRecord[]> {
  const normalizedRepoId = repoId.trim();
  if (!normalizedRepoId) return [];

  const response = await fetch(
    `${API_URL}/comment/repo/${encodeURIComponent(normalizedRepoId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  const data = await readEnvelope<unknown>(response, 'Failed to load comments');
  if (!Array.isArray(data)) {
    throw new Error('Comments response was not a list');
  }

  return data
    .map(normalizeComment)
    .filter((comment): comment is CommentRecord => comment !== null);
}

export async function createComment(
  input: CreateCommentInput,
  token: string,
): Promise<CommentRecord> {
  const body = input.comment.trim();
  if (!input.userId.trim() || !input.repoId.trim() || !body) {
    throw new Error('A user, repository, and comment are required');
  }

  const response = await fetch(`${API_URL}/comment`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: input.userId,
      repo_id: input.repoId,
      comment: body,
      ...(input.parentCommentId
        ? { parent_comment_id: input.parentCommentId }
        : {}),
    }),
  });

  const data = await readEnvelope<unknown>(response, 'Failed to post comment');
  const comment = normalizeComment(data);
  if (!comment) {
    throw new Error('Comment response was invalid');
  }

  return comment;
}

export async function getCommentAuthor(
  userId: string,
  signal?: AbortSignal,
): Promise<CommentAuthor> {
  const response = await fetch(
    `${API_URL}/users/id/${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  const data = await readEnvelope<unknown>(response, 'Failed to load comment author');
  if (!isObject(data) || typeof data.user_id !== 'string' || typeof data.username !== 'string') {
    throw new Error('Comment author response was invalid');
  }

  return {
    user_id: data.user_id,
    username: data.username,
    full_name: typeof data.full_name === 'string' ? data.full_name : null,
    avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : null,
  };
}
