import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from './authStore';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  setSession: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storeUser = useAuthStore(state => state.user);
  const isLoadingStore = useAuthStore(state => state.isLoading);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const setOAuthTokens = useAuthStore(state => state.setOAuthTokens);
  const logoutStore = useAuthStore(state => state.logout);
  const storeCheckOnboardingStatus = useAuthStore(state => state.checkOnboardingStatus);

  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setIsHydrating(false));
  }, []);

  const user = storeUser ? {
    ...storeUser,
    user_id: storeUser.id,
    username: storeUser.user_metadata?.user_name,
    onboarding_completed: storeUser.onboarding_completed,
  } : null;

  const isLoading = isHydrating || isLoadingStore;

  const setSession = async (token: string, authUser: any) => {
    await setOAuthTokens(token, authUser);
  };

  const signOut = async () => {
    await logoutStore();
  };

  const checkOnboardingStatus = async () => {
    await storeCheckOnboardingStatus();
    await checkAuth(); // rehydrate to update the state
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

