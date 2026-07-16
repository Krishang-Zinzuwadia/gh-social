import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { API_URL } from '../api/config';

interface User {
  user_id: string;
  username: string;
  email?: string;
  onboarding_completed: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setSession: (token: string, user: any) => Promise<void>;
  enterOnboardingPreview: () => Promise<void>;
  completeOnboardingPreview: () => void;
  signOut: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const isDemoModeEnabled =
  __DEV__ && process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const token = await getStorageItem('access_token');
      if (token) {
        await fetchUserProfile(token);
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    const response = await fetch(`${API_URL}/onboarding/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const responseData = await response.json();
      const { isComplete, profile } = responseData.data;
      setUser({
        ...profile,
        onboarding_completed: isComplete
      }); // backend returns { success: true, data: { isComplete, profile } }
      return;
    }

    if (response.status === 401) {
      await removeStorageItem('access_token');
      setUser(null);
      throw new Error('Your session expired. Please start the demo again.');
    }

    throw new Error(`Could not load your profile (${response.status}).`);
  };

  const checkOnboardingStatus = async () => {
    const token = await getStorageItem('access_token');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const setSession = async (token: string, authUser: any) => {
    await setStorageItem('access_token', token);

    // Let routing move a newly-created account into onboarding immediately,
    // then replace this optimistic value with the canonical backend profile.
    setUser({
      ...authUser,
      user_id: authUser?.user_id ?? authUser?.id,
      username:
        authUser?.username ??
        authUser?.user_metadata?.user_name ??
        'new-user',
      onboarding_completed: false,
    });
    await fetchUserProfile(token);
  };

  const enterOnboardingPreview = async () => {
    if (!isDemoModeEnabled) return;

    // This preview is intentionally local-only: no auth or backend request.
    await removeStorageItem('access_token').catch(() => undefined);
    setUser({
      user_id: 'local-onboarding-preview',
      username: 'preview_user',
      full_name: 'Preview User',
      onboarding_completed: false,
      isPreview: true,
    });
  };

  const completeOnboardingPreview = () => {
    setUser((currentUser) =>
      currentUser?.isPreview
        ? { ...currentUser, onboarding_completed: true }
        : currentUser,
    );
  };

  const signOut = async () => {
    try {
      const token = await getStorageItem('access_token');
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error(e);
    }
    
    try {
      await removeStorageItem('access_token');
    } catch (e) {
      console.error('Failed to clear session storage', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setSession, enterOnboardingPreview, completeOnboardingPreview, signOut, checkOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
