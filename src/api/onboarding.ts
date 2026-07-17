import { apiV2 } from './client';

export interface OnboardingData {
  username: string;
  full_name: string;
  date_of_birth?: string;
  bio?: string;
  github_url?: string;
  github_handle?: string;
  avatar_url?: string;
  interests?: string[];
  skills?: string[];
  tech_stack?: string[];
}

function slug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

export async function setupOnboarding(token: string, data: OnboardingData) {
  await apiV2('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({
      username: data.username,
      full_name: data.full_name,
      bio: data.bio ?? null,
      github_handle: data.github_handle ?? null,
      avatar_url: data.avatar_url ?? null,
    }),
  }, token);
  const topics = [...new Set([
    ...(data.interests ?? []), ...(data.skills ?? []), ...(data.tech_stack ?? []),
  ].map(slug).filter(Boolean))];
  if (topics.length === 0) throw new Error('Choose at least one interest, skill, or technology.');
  return apiV2('/onboarding', {
    method: 'PUT', body: JSON.stringify({ topics, bio: data.bio ?? null }),
  }, token);
}
