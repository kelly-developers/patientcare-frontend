// API Configuration
export const API_BASE_URL = 'https://patientcarebackend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },
  PATIENTS: {
    BASE: '/api/patients',
    BY_ID: (id: string) => `/api/patients/${id}`,
    SEARCH: '/api/patients/search',
    CONSENT: (id: string) => `/api/patients/${id}/consent`,
    EXPORT_EXCEL: '/api/patients/export/excel',
    EXPORT_PDF: '/api/patients/export/pdf',
  },
  PROCEDURES: {
    BASE: '/api/procedures',
    BY_ID: (id: string) => `/api/procedures/${id}`,
    BY_PATIENT: (patientId: string) => `/api/procedures/patient/${patientId}`,
  },
  VITAL_DATA: {
    BASE: '/api/vital-data',
    BY_ID: (id: string) => `/api/vital-data/${id}`,
    BY_PATIENT: (patientId: string) => `/api/vital-data/patient/${patientId}`,
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id: string) => `/api/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/api/appointments/patient/${patientId}`,
  },
  ANALYSIS: {
    BASE: '/api/analysis',
    BY_ID: (id: string) => `/api/analysis/${id}`,
    BY_PATIENT: (patientId: string) => `/api/analysis/patient/${patientId}`,
  },
  PRESCRIPTIONS: {
    BASE: '/api/prescriptions',
    BY_ID: (id: string) => `/api/prescriptions/${id}`,
    BY_PATIENT: (patientId: string) => `/api/prescriptions/patient/${patientId}`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
  },
};

// Token management
export const TOKEN_KEY = 'patientcare_token';
export const REFRESH_TOKEN_KEY = 'patientcare_refresh_token';
export const USER_KEY = 'patientcare_user';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token from localStorage:', error);
      return null;
    }
  }
  return null;
};

export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token in localStorage:', error);
    }
  }
};

export const removeTokens = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing tokens from localStorage:', error);
    }
  }
};

export const getUser = (): any => {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (user && user !== 'undefined' && user !== 'null') {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        console.error('Error clearing invalid user data:', e);
      }
      return null;
    }
  }
  return null;
};

export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  }
};

// Axios instance configuration
import axios from 'axios';

// Create base client configuration
const createClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  // Add request interceptor for debugging
  client.interceptors.request.use(
    (config) => {
      console.log(`🚀 ${config.method?.toUpperCase()} request to: ${config.url}`, {
        headers: config.headers,
        data: config.data ? { ...config.data, password: config.data.password ? '***' : undefined } : undefined
      });
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ Response from ${response.config.url}:`, {
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error(`❌ Error from ${error.config?.url}:`, {
        status: error.response?.status,
        message: error.message,
        response: error.response?.data
      });
      return Promise.reject(error);
    }
  );

  return client;
};

// Main API client with token management
export const apiClient = createClient(API_BASE_URL);

// Request interceptor to add token - BUT NOT FOR AUTH ENDPOINTS
apiClient.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for auth endpoints
    if (config.url?.includes('/api/auth/')) {
      console.log('🔐 Auth endpoint - skipping Authorization header');
      delete config.headers.Authorization;
      return config;
    }
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added Authorization header');
    } else {
      console.log('⚠️ No token found for protected endpoint');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle 401 errors (token expired) - but not for auth endpoints
    if (error.response.status === 401 && !originalRequest._retry && 
        !originalRequest.url?.includes('/api/auth/')) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          removeTokens();
          window.location.href = '/auth';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { token } = response.data.data;
        setToken(token);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeTokens();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Special auth client that never adds tokens
export const authClient = createClient(API_BASE_URL);

// Remove any Authorization headers from auth client requests
authClient.interceptors.request.use(
  (config) => {
    // Ensure no Authorization header for auth requests
    if (config.url?.includes('/api/auth/')) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);