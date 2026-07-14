import { fetch } from 'expo/fetch';
import { API_URL } from './config';
import {
  normalizeFeedbackAction,
  type FeedbackEventInput,
} from '../constants/feedbackActions';

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

export async function sendBatchedActivity(events: FeedbackEventInput[], token: string) {
  if (events.length === 0) return;

  const canonicalEvents = events.map((event) => {
    const action = normalizeFeedbackAction(event.action);
    if (!action) {
      throw new Error(`Unsupported feedback action: ${String(event.action)}`);
    }
    if (action === 'dwell' && (
      typeof event.dwell_seconds !== 'number'
      || !Number.isFinite(event.dwell_seconds)
      || event.dwell_seconds <= 0
    )) {
      throw new Error('dwell_seconds must be positive for dwell events');
    }

    return {
      repo_id: event.repo_id,
      action,
      ...(action === 'dwell' ? { dwell_seconds: event.dwell_seconds } : {}),
    };
  });

  const response = await fetch(`${API_URL}/activity/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ events: canonicalEvents }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send batched activity');
  }

  const json = await response.json();
  return json.data;
}
