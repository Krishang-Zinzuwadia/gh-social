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
  signOut: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (token: string) => {
    try {
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
      } else {
        // If unauthorized, clear token
        if (response.status === 401) {
          try {
            await removeStorageItem('access_token');
          } catch (e) {
            console.error('Failed to clear session storage', e);
          } finally {
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

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

  useEffect(() => {
    // Session hydration is the provider's mount-time external synchronization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
    // Authentication is hydrated once on provider mount; later refreshes are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkOnboardingStatus = async () => {
    const token = await getStorageItem('access_token');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const setSession = async (token: string, authUser: any) => {
    await setStorageItem('access_token', token);
    await fetchUserProfile(token);
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
    <AuthContext.Provider value={{ user, isLoading, setSession, signOut, checkOnboardingStatus }}>
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
