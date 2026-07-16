import { API_URL } from './config';

type ApiEnvelope<T> = { success: true; data: T } | { success?: false; error?: string };

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); }
  catch { throw new Error(`Backend returned invalid JSON (${response.status}).`); }
}

export async function apiV2<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const response = await fetch(`${API_URL}/v2${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await readJson(response) as ApiEnvelope<T> | null;
  if (!response.ok) {
    const error = new Error(payload && 'error' in payload && payload.error
      ? payload.error : `Backend request failed (${response.status}).`);
    Object.assign(error, { status: response.status, retryAfter: response.headers.get('retry-after') });
    throw error;
  }
  if (!payload || !('data' in payload)) throw new Error('Backend response did not contain data.');
  return payload.data;
}

export async function apiV2Raw<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<{ data: T; response: Response }> {
  const response = await fetch(`${API_URL}/v2${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await readJson(response) as T | { error?: string } | null;
  if (!response.ok) {
    const error = new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error
      ? String(payload.error) : `Backend request failed (${response.status}).`);
    Object.assign(error, { status: response.status, retryAfter: response.headers.get('retry-after') });
    throw error;
  }
  return { data: payload as T, response };
}
