import type { RepoRow, UserProfile } from '../types/database.js';

const DEFAULT_ML_TIMEOUT_MS = 10000;

export interface MlRecommendationBatches {
  batch_1?: unknown[];
  batch_2?: unknown[];
  batch_3?: unknown[];
  [key: string]: unknown;
}

export interface MlOnboardPayload {
  user_id: string;
  github_username?: string | null;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  interests?: string[];
  skills?: string[];
  tech_stack?: string[];
  avatar_url?: string | null;
}

export interface MlEmbedRepositoryPayload {
  repo_id: string;
  github_repo: string;
  github_repo_url?: string | null;
  description?: string | null;
  primary_language?: string | null;
  languages?: string[];
  topics?: string[];
  readme_summary?: string | null;
  star_count?: number;
  fork_count?: number;
  open_issues_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

function parseTimeout(): number {
  const raw = process.env.ML_TIMEOUT;
  if (!raw) return DEFAULT_ML_TIMEOUT_MS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(`[MLService] Invalid ML_TIMEOUT value "${raw}", using ${DEFAULT_ML_TIMEOUT_MS}ms.`);
    return DEFAULT_ML_TIMEOUT_MS;
  }

  return parsed;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

class MLService {
  private readonly baseURL: string | null;
  private readonly timeoutMs: number;
  private readonly internalSecret: string | null;

  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL?.replace(/\/+$/, '') ?? null;
    this.timeoutMs = parseTimeout();
    this.internalSecret = process.env.INTERNAL_API_SECRET ?? null;
  }

  private async post<TResponse>(path: string, payload: unknown): Promise<TResponse> {
    if (!this.baseURL) {
      throw new Error('ML_SERVICE_URL is not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.internalSecret ? { 'x-internal-secret': this.internalSecret } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const responseText = await response.text();
      const responseBody = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        const detail = responseBody?.detail ?? response.statusText;
        throw new Error(`status=${response.status} message=${detail}`);
      }

      return responseBody as TResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateRecommendations(userId: string): Promise<MlRecommendationBatches> {
    try {
      const response = await this.post<{ data?: MlRecommendationBatches } & MlRecommendationBatches>('/api/v1/recommendations/generate', {
        user_id: userId,
      });
      return response.data ?? response;
    } catch (error) {
      console.error(`[MLService] generateRecommendations failed for user ${userId}:`, error);
      throw error;
    }
  }

  async onboardUser(payload: MlOnboardPayload): Promise<void> {
    try {
      await this.post('/api/v1/onboard', payload);
    } catch (error) {
      console.error(`[MLService] onboardUser failed for user ${payload.user_id}:`, error);
      throw error;
    }
  }

  async onboardUserBestEffort(payload: MlOnboardPayload): Promise<void> {
    try {
      await this.onboardUser(payload);
    } catch {
      // Caller flows such as signup/onboarding should not fail because ML is unavailable.
    }
  }

  async embedRepository(payload: MlEmbedRepositoryPayload): Promise<void> {
    try {
      await this.post('/api/v1/embed-repo', payload);
    } catch (error) {
      console.error(`[MLService] embedRepository failed for repo ${payload.repo_id}:`, error);
      throw error;
    }
  }

  async embedRepositoryBestEffort(payload: MlEmbedRepositoryPayload): Promise<void> {
    try {
      await this.embedRepository(payload);
    } catch {
      // Repository import has already succeeded; indexing can be retried out of band.
    }
  }
}

export const mlService = new MLService();

export function buildMlOnboardPayload(userId: string, profile: Partial<UserProfile>): MlOnboardPayload {
  return {
    user_id: userId,
    github_username: profile.github_handle,
    username: profile.username,
    full_name: profile.full_name,
    bio: profile.bio,
    interests: normalizeStringArray(profile.interests),
    skills: normalizeStringArray(profile.skills),
    tech_stack: normalizeStringArray(profile.tech_stack),
    avatar_url: profile.avatar_url,
  };
}

export function buildMlEmbedRepositoryPayload(repo: RepoRow): MlEmbedRepositoryPayload {
  const languageUsed = repo.language_used;
  const languages = Array.isArray(languageUsed)
    ? normalizeStringArray(languageUsed)
    : languageUsed && typeof languageUsed === 'object'
      ? Object.keys(languageUsed)
      : [];

  return {
    repo_id: repo.repo_id,
    github_repo: repo.full_name,
    github_repo_url: repo.github_repo_url,
    description: repo.description,
    primary_language: languages[0] ?? null,
    languages,
    topics: normalizeStringArray(repo.topics),
    readme_summary: repo.readme_summary,
    star_count: repo.star_count ?? 0,
    fork_count: repo.forks_count ?? 0,
    open_issues_count: repo.open_issues_count ?? 0,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
  };
}
