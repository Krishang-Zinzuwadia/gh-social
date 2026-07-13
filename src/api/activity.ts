import { API_URL } from './config';
import type { FeedbackAction } from '../constants/feedbackActions';

export type { FeedbackAction } from '../constants/feedbackActions';

export async function getSavedRepos(userId: string, token: string, limit: number = 20, offset: number = 0) {
  const response = await fetch(`${API_URL}/activity/user/${userId}/saved?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch saved repos');
  }

  const json = await response.json();
  return json.data;
}

export async function toggleSaveRepo(userId: string, repoId: string, token: string) {
  const response = await fetch(`${API_URL}/activity/user/${userId}/repo/${repoId}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to toggle save for repo');
  }

  const json = await response.json();
  return json.data;
}

export async function sendBatchedActivity(events: { repo_id: string; action: FeedbackAction; dwell_seconds?: number }[], token: string) {
  if (events.length === 0) return;
  
  const response = await fetch(`${API_URL}/activity/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send batched activity');
  }

  const json = await response.json();
  return json.data;
}
