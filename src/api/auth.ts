import { API_URL } from './config';

export const register = async (email: string, password: string, fullName: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      email, 
      password, 
      username: email.split('@')[0], // Generate a default username based on email
      full_name: fullName 
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to register');
  }
  return data.data; // Expected { accessToken, user }
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to login');
  }
  return data.data; // Expected { accessToken, user }
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to logout');
  }
  return data;
};

export const getOAuthUrl = async (provider: 'github' | 'google'): Promise<string> => {
  const response = await fetch(`${API_URL}/auth/oauth/${provider}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Failed to get ${provider} OAuth URL`);
  }
  return data.data.url as string;
};

export const exchangeCode = async (code: string): Promise<{ accessToken: string; user: any }> => {
  const response = await fetch(`${API_URL}/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to exchange authorization code');
  }
  return data.data as { accessToken: string; user: any };
};
