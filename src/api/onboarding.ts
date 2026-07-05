import { API_URL } from './config';

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

export const setupOnboarding = async (token: string, data: OnboardingData) => {
  const response = await fetch(`${API_URL}/onboarding/setup`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Failed to complete onboarding');
  }
  return resData.data;
};
