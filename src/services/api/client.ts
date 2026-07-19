/**
 * Base API Client for KAVACH AI Frontend
 * Provides centralized fetch configuration, interceptors, and error handling.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'api'; // 'demo' | 'api'

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

export const apiClient = {
  getAuthToken(): string | null {
    // We will use localStorage for simplicity, can be updated to context/state later
    return localStorage.getItem('kavach_token');
  },

  setAuthToken(token: string) {
    localStorage.setItem('kavach_token', token);
  },

  clearAuthToken() {
    localStorage.removeItem('kavach_token');
  },

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, requiresAuth = true, headers, ...customConfig } = options;
    
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    };

    try {
      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }
        
        if (response.status === 401) {
          // Token is invalid/expired — clear auth and signal re-authentication
          this.clearAuthToken();
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        // NOTE: 403 Forbidden means authenticated but insufficient role.
        // Do NOT clear auth state or redirect to login on 403.
        
        throw new ApiError(
          response.status, 
          errorData?.error?.message || errorData.detail || errorData.message || 'API request failed', 
          errorData
        );
      }

      // Check for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
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
