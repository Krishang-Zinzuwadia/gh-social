import { Repo, TabName } from '../types';

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
  };
};

type GitHubSearchResponse = {
  items?: GitHubRepository[];
};

const GITHUB_SEARCH_URL = 'https://api.github.com/search/repositories';
const AVATAR_COLORS = [
  ['#64D2FF', '#2A7FBF'],
  ['#FFB340', '#E08700'],
  ['#BF5AF2', '#8944AB'],
  ['#63E6A9', '#2E9E6B'],
  ['#FF6482', '#C93A56'],
] as const;

function formatCompactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return value.toString();
}

function getRecentDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getAvatarGradient(seed: string): readonly [string, string] {
  const charTotal = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charTotal % AVATAR_COLORS.length];
}

function buildSearchQuery(tab: TabName, searchQuery: string): string {
  const q = searchQuery.trim();

  if (q) {
    return tab === 'Trending'
      ? `${q} in:name,description stars:>100`
      : `${q} in:name,description`;
  }

  if (tab === 'Trending') {
    return `stars:>1000 pushed:>${getRecentDate(30)}`;
  }

  return 'topic:open-source stars:>500';
}

export async function fetchExploreRepos(
  tab: TabName,
  searchQuery: string,
  signal?: AbortSignal
): Promise<Repo[]> {
  const params = new URLSearchParams({
    q: buildSearchQuery(tab, searchQuery),
    order: 'desc',
    per_page: '24',
  });
  const sort = tab === 'Trending' ? 'stars' : searchQuery.trim() ? undefined : 'updated';

  if (sort) {
    params.set('sort', sort);
  }

  const response = await fetch(`${GITHUB_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Unable to load repositories right now.');
  }

  const payload = (await response.json()) as GitHubSearchResponse;

  return (payload.items ?? []).map((repo) => {
    const avatarGradient = getAvatarGradient(repo.owner.login);

    return {
      id: repo.id.toString(),
      name: repo.name,
      description: repo.description ?? 'No description provided.',
      stars: formatCompactCount(repo.stargazers_count),
      forks: formatCompactCount(repo.forks_count),
      author: repo.owner.login,
      avatarInitial: repo.owner.login.slice(0, 2).toUpperCase(),
      avatarColor: avatarGradient[0],
      avatarGradient,
      language: repo.language ?? undefined,
      url: repo.html_url,
    };
  });
}
