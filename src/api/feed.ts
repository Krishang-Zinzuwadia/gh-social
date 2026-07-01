import { API_URL } from './config';

export async function fetchFeed(token: string) {
  const response = await fetch(`${API_URL}/feed`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch feed');
  }

  const json = await response.json();
  return json.data;
}
