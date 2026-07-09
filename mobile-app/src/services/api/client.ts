/**
 * KAVACH Mobile App — API Client
 * Mirrors the web's apiClient using fetch + AsyncStorage for token management.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'kavach_token';

// Use environment variable or fallback to localhost
// For Android emulator: 10.0.2.2, for iOS simulator: localhost
const getDefaultBaseUrl = () => {
  return 'http://10.0.2.2:8000';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  requiresAuth?: boolean;
}

let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

export const apiClient = {
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, requiresAuth = true, headers, ...customConfig } = options;

    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => searchParams.append(key, params[key]));
      url += `?${searchParams.toString()}`;
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await this.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }

        if (response.status === 401) {
          await this.clearAuthToken();
          if (logoutCallback) logoutCallback();
        }

        throw new ApiError(
          response.status,
          errorData?.error?.message || errorData.detail || errorData.message || 'API request failed',
          errorData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error instanceof Error ? error.message : 'Network Error');
    }
  },

  get<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
