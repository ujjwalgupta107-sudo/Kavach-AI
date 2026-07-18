/**
 * KAVACH Mobile App — Auth Store
 * Zustand store with AsyncStorage persistence, mirroring web's authStore.
 */
import { create } from 'zustand';
import { apiClient, setLogoutCallback } from '../services/api/client';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  language: 'English',

  setLanguage: (lang: string) => set({ language: lang }),

  login: async (token: string, user: User) => {
    await apiClient.setAuthToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await apiClient.clearAuthToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      console.log("authStore checkAuth starting...");
      const token = await apiClient.getAuthToken();
      console.log("authStore checkAuth token fetched:", token);
      if (!token) {
        console.log("authStore checkAuth no token found, logging out...");
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      console.log("authStore checkAuth fetching user profile from /me...");
      const user = await apiClient.get<User>('/api/v1/auth/me');
      console.log("authStore checkAuth user fetched successfully:", user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.log("authStore checkAuth encountered error:", error);
      await apiClient.clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Wire up 401 auto-logout
setLogoutCallback(() => {
  useAuthStore.getState().logout();
});
