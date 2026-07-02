import { storage } from "@/utils/storage";
import axios from "axios";
import { API_URL } from "./config";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private client = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getItemAsync("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    let isRefreshing = false;
    let failedQueue: any[] = [];

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Note: Use axios directly without interceptors to avoid infinite loops
            const res = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true },
            );
            
            if (res.data && res.data.data && res.data.data.accessToken) {
              const { accessToken } = res.data.data;
              await storage.setItemAsync("accessToken", accessToken);
              
              this.client.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              processQueue(null, accessToken);
              return this.client(originalRequest);
            } else {
              throw new Error("Invalid token refresh response");
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            
            // Token expired or invalid, clear storage
            await storage.deleteItemAsync("accessToken");
            await storage.deleteItemAsync("refreshToken");
            
            return Promise.reject({
              success: false,
              error: "Session expired. Please log in again.",
            });
          } finally {
            isRefreshing = false;
          }
        }

        // Return standardized error format
        const errorMessage =
          error.response?.data?.error || error.message || "Network error";
        return Promise.reject({
          success: false,
          error: errorMessage,
        });
      },
    );
  }

  // Auth endpoints
  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ accessToken: string; user: any }>> {
    return this.client.post("/auth/login", { email, password });
  }

  async signup(
    email: string,
    password: string,
    username: string,
    full_name: string,
  ): Promise<ApiResponse<{ accessToken: string; user: any }>> {
    return this.client.post("/auth/signup", {
      email,
      password,
      username,
      full_name,
    });
  }

  async logout(): Promise<void> {
    return this.client.post("/auth/logout");
  }

  async getOAuthUrl(
    provider: "github" | "google",
    redirectUri?: string,
    intent?: "login" | "signup",
  ): Promise<ApiResponse<{ url: string }>> {
    const params: any = {};
    if (redirectUri) params.redirectUri = redirectUri;
    if (intent) params.intent = intent;
    return this.client.get(`/auth/oauth/${provider}`, { params });
  }

  async exchangeAuthCode(
    code: string,
  ): Promise<ApiResponse<{ accessToken: string; user?: any }>> {
    return this.client.post("/auth/exchange", { code });
  }

  async exchangeSupabaseToken(
    supabaseToken: string,
  ): Promise<ApiResponse<{ accessToken: string; user?: any }>> {
    return this.client.post("/auth/exchange", { supabaseToken });
  }

  // Onboarding endpoints
  async getOnboardingStatus(): Promise<ApiResponse<any>> {
    return this.client.get("/users/onboarding/status");
  }

  async setupOnboarding(data: {
    username: string;
    full_name?: string;
    date_of_birth?: string;
    bio?: string;
    avatar_url?: string;
    interests?: string[];
    skills?: string[];
    tech_stack?: string[];
  }, token?: string): Promise<ApiResponse<any>> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    return this.client.put("/onboarding/setup", data, config);
  }

  // Generic get/post/put/delete methods
  async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
