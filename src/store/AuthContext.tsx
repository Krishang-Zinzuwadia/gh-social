import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from '../utils/storage';
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

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
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
            await SecureStore.deleteItemAsync('access_token');
            setUser(null);
          } catch (e) {
            console.error('Failed to clear session storage', e);
            setUser(null);
            throw e;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  const checkOnboardingStatus = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const setSession = async (token: string, authUser: any) => {
    await SecureStore.setItemAsync('access_token', token);
    await fetchUserProfile(token);
  };

  const signOut = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error(e);
    }
    try {
      await SecureStore.deleteItemAsync('access_token');
      setUser(null);
    } catch (e) {
      console.error('Failed to clear session storage', e);
      setUser(null);
      throw e;
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
