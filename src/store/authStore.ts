import { apiClient } from "@/api/client";
import { storage } from "@/utils/storage";
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    user_name?: string;
    full_name?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    full_name: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (
    provider: "github" | "google",
    redirectUri?: string,
    intent?: "login" | "signup",
  ) => Promise<string>;
  exchangeOAuthCode: (code: string) => Promise<void>;
  exchangeSupabaseToken: (supabaseToken: string) => Promise<void>;
  setOAuthTokens: (accessToken: string, user: User) => Promise<void>;
  checkOnboardingStatus: () => Promise<{ onboarding_completed: boolean }>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    console.log("[AuthStore] Login called with:", email);
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      console.log("[AuthStore] Login response:", response);

      if (response.success && response.data) {
        const { accessToken, user } = response.data;
        console.log("[AuthStore] Storing access token and user");

        // Store tokens
        await storage.setItemAsync("accessToken", accessToken);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log("[AuthStore] Login successful, state updated");
      } else {
        console.log("[AuthStore] Login failed:", response.error);
        throw new Error(response.error || "Invalid credentials");
      }
    } catch (error: any) {
      console.error("[AuthStore] Login error:", error);
      set({
        error: error.error || error.message || "Invalid credentials",
        isLoading: false,
      });
      throw error;
    }
  },

  signup: async (
    email: string,
    password: string,
    username: string,
    full_name: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.signup(
        email,
        password,
        username,
        full_name,
      );

      if (response.success && response.data) {
        const { accessToken, user } = response.data;

        // Store tokens
        await storage.setItemAsync("accessToken", accessToken);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || "Signup failed");
      }
    } catch (error: any) {
      set({
        error: error.error || error.message || "Signup failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("[AuthStore] Logout error:", error);
    } finally {
      await storage.deleteItemAsync("accessToken");
      await storage.deleteItemAsync("refreshToken");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  oauthLogin: async (
    provider: "github" | "google",
    redirectUri?: string,
    intent?: "login" | "signup",
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getOAuthUrl(
        provider,
        redirectUri,
        intent,
      );

      if (response.success && response.data?.url) {
        // Return the URL for the caller to handle navigation
        set({ isLoading: false });
        return response.data.url;
      } else {
        throw new Error(response.error || "Failed to get OAuth URL");
      }
    } catch (error: any) {
      set({
        error: error.error || error.message || "OAuth failed",
        isLoading: false,
      });
      throw error;
    }
  },

  exchangeOAuthCode: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.exchangeAuthCode(code);

      if (response.success && response.data?.accessToken) {
        await storage.setItemAsync("accessToken", response.data.accessToken);
        if (response.data.user) {
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isAuthenticated: true, isLoading: false });
        }
      } else {
        throw new Error(response.error || "Failed to exchange code");
      }
    } catch (error: any) {
      set({
        error: error.error || error.message || "Code exchange failed",
        isLoading: false,
      });
      throw error;
    }
  },

  exchangeSupabaseToken: async (supabaseToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.exchangeSupabaseToken(supabaseToken);

      if (response.success && response.data?.accessToken) {
        await storage.setItemAsync("accessToken", response.data.accessToken);
        if (response.data.user) {
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isAuthenticated: true, isLoading: false });
        }
      } else {
        throw new Error(response.error || "Failed to exchange token");
      }
    } catch (error: any) {
      set({
        error: error.error || error.message || "Token exchange failed",
        isLoading: false,
      });
      throw error;
    }
  },

  setOAuthTokens: async (accessToken: string, user: User) => {
    set({ isLoading: true, error: null });
    try {
      // Store access token
      await storage.setItemAsync("accessToken", accessToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to set OAuth tokens",
        isLoading: false,
      });
      throw error;
    }
  },

  checkOnboardingStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getOnboardingStatus();

      if (response.success && response.data) {
        set({ isLoading: false });
        return {
          onboarding_completed: response.data.onboarding_completed || false,
        };
      } else {
        set({ isLoading: false });
        return { onboarding_completed: false };
      }
    } catch (error: any) {
      console.error("[AuthStore] Check onboarding status error:", error);
      set({ isLoading: false });
      return { onboarding_completed: false };
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getItemAsync("accessToken");
      if (token) {
        // Token exists - user is considered authenticated
        // In a real app, you might want to validate the token here
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
