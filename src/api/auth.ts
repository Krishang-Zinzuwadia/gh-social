import { API_URL } from './config';

export const register = async (email: string, password: string, fullName: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to logout');
  }
  return data;
};
