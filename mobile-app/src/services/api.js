import axios from 'axios';
import { Platform } from 'react-native';
import { getSecureItem, setSecureItem, deleteSecureItem } from '../utils/secureStore';

const FALLBACK_DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const FALLBACK_PROD_URL = 'https://api.kavach.ai';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? FALLBACK_DEV_URL : FALLBACK_PROD_URL);

console.log('[KAVACH API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available in SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getSecureItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[KAVACH API] Error retrieving token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized (401) responses
let onUnauthorizedCallback = null;
export const registerUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[KAVACH API] Unauthorized response received (401). Logging out...');
      try {
        await deleteSecureItem('user_token');
      } catch (err) {
        console.error('[KAVACH API] Failed to delete token:', err);
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const kavachAPI = {
  // Auth Operations
  login: async (email, password) => {
    // FastAPI OAuth2PasswordRequestForm expects form-urlencoded username and password
    const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const response = await api.post('/api/v1/auth/login', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Save token if successful
    if (response.data?.token?.access_token) {
      await setSecureItem('user_token', response.data.token.access_token);
    }
    return response.data;
  },

  register: async (userData) => {
    // Expects: email, password, full_name, role, investigator_code (optional)
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  logout: async () => {
    await deleteSecureItem('user_token');
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  },

  // Cases / Shield Operations
  getMyCases: async () => {
    const response = await api.get('/api/v1/cases/me');
    return response.data; // PaginatedCaseResponse: { items: [...], total: N }
  },

  createCase: async (caseData) => {
    // Authenticated case reporting
    // expects: scam_type, description, lat, lng, city
    const response = await api.post('/api/v1/cases/', caseData);
    return response.data;
  },

  submitIncidentReport: async (reportData) => {
    // Centralized submission: try authenticated first, fallback to anonymous if needed
    try {
      const token = await getSecureItem('user_token');
      if (token) {
        return await kavachAPI.createCase({
          scam_type: reportData.scam_type || 'OTHER',
          description: reportData.description || reportData.details,
          lat: reportData.lat,
          lng: reportData.lng,
          city: reportData.city,
        });
      }
    } catch (e) {
      console.warn('[KAVACH API] Error reading token for incident report, trying public:', e);
    }
    
    // Fallback/anonymous report endpoint
    const response = await api.post('/api/v1/public/report', {
      details: reportData.description || reportData.details || '',
      phone: reportData.phone || null,
      upi: reportData.upi || null,
    });
    return response.data;
  },

  // Scam Scanning (State-less / Public Analyze)
  analyzeSuspiciousText: async (text) => {
    const response = await api.post('/api/v1/public/analyze', { text });
    return response.data;
  },

  analyzeScreenshot: async (fileUri, fileName = 'screenshot.jpg') => {
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      type: 'image/jpeg',
      name: fileName,
    });

    const response = await api.post('/api/v1/public/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Assistant Interaction
  askAssistant: async (message, context = '') => {
    const response = await api.post('/api/v1/assistant/chat', { message, context });
    return response.data; // { reply: "..." }
  },

  // Check Phone Reputation (can leverage the analyze endpoint to scan the text context)
  checkPhoneReputation: async (phoneNumber) => {
    const response = await api.post('/api/v1/public/analyze', { text: `Phone number check: ${phoneNumber}` });
    return response.data;
  },
};

export default api;