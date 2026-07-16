import { Repo, TabName } from '../types';
import { getStorageItem } from '../utils/storage';
import { apiV2 } from './client';

type RepositoryV2 = {
  repo_id: string;
  name: string;
  full_name: string;
  owner: string;
  url: string;
  description: string | null;
  primary_language: string | null;
  star_count?: number | null;
  fork_count?: number | null;
};

const AVATAR_COLORS = [
  ['#64D2FF', '#2A7FBF'], ['#FFB340', '#E08700'], ['#BF5AF2', '#8944AB'],
  ['#63E6A9', '#2E9E6B'], ['#FF6482', '#C93A56'],
] as const;

function formatCompactCount(value = 0): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return value.toString();
}

function getAvatarGradient(seed: string): readonly [string, string] {
  const total = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

export async function fetchExploreRepos(
  tab: TabName,
  searchQuery: string,
  signal?: AbortSignal,
): Promise<Repo[]> {
  const token = await getStorageItem('access_token');
  if (!token) throw new Error('Your session has expired. Please log in again.');
  const query = searchQuery.trim();
  const path = tab === 'Trending'
    ? '/repositories/trending?period=daily'
    : `/repositories?limit=24&offset=0${query ? `&q=${encodeURIComponent(query)}` : ''}`;
  const data = await apiV2<{ items: RepositoryV2[] }>(path, { signal }, token);

  return data.items.map((repo) => {
    const gradient = getAvatarGradient(repo.owner);
    return {
      id: repo.repo_id,
      name: repo.name,
      description: repo.description ?? 'No description provided.',
      stars: formatCompactCount(repo.star_count ?? 0),
      forks: formatCompactCount(repo.fork_count ?? 0),
      author: repo.owner,
      avatarInitial: repo.owner.slice(0, 2).toUpperCase(),
      avatarColor: gradient[0],
      avatarGradient: gradient,
      language: repo.primary_language ?? undefined,
      url: repo.url,
    };
  });
}
