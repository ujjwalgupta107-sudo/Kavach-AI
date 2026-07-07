import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSecureItem, setSecureItem, deleteSecureItem } from '../utils/secureStore';
import { kavachAPI, registerUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check SecureStore for token
  const checkAuthStatus = async () => {
    try {
      const storedToken = await getSecureItem('user_token');
      if (storedToken) {
        // Fetch current user details from API
        try {
          const userData = await kavachAPI.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.warn('[AuthContext] Token verification failed. Clearing storage.', error);
          await deleteSecureItem('user_token');
          setUser(null);
          setToken(null);
        }
      }
    } catch (e) {
      console.error('[AuthContext] Error reading secure store', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Register callback for API 401 interceptor
    registerUnauthorizedHandler(async () => {
      setUser(null);
      setToken(null);
    });
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await kavachAPI.login(email, password);
      // Response matches LoginResponse schema: { user: {...}, token: { access_token: "..." } }
      if (response && response.token && response.token.access_token) {
        setUser(response.user);
        setToken(response.token.access_token);
        return { success: true };
      } else {
        throw new Error('Invalid login response payload');
      }
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (email, password, fullName, role = 'CITIZEN', investigatorCode = '') => {
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        full_name: fullName,
        role,
        investigator_code: role === 'INVESTIGATOR' ? investigatorCode : undefined,
      };
      await kavachAPI.register(payload);
      
      // Auto login after registration
      return await login(email, password);
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await kavachAPI.logout();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        register,
        logout,
        checkAuth: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
