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
    HEALTH: '/api/auth/health',
  },
};

// Token management (keep your existing functions)
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

// Axios instance for auth requests
import axios from 'axios';

// Create axios instance with CORS-friendly configuration
export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // Keep this as false
});

// Request interceptor
authClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} request to: ${config.url}`, {
      data: config.data ? { ...config.data, password: config.data.password ? '***' : undefined } : undefined
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
authClient.interceptors.response.use(
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
      code: error.code,
      response: error.response?.data
    });
    
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('blocked by DevTools')) {
      console.error('🌐 CORS Error Detected: Request was blocked by browser CORS policy');
      error.isCorsError = true;
    }
    
    return Promise.reject(error);
  }
);

// Enhanced backend connection test
export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test with different methods
    const response = await authClient.get('/api/auth/health', {
      timeout: 10000,
    });
    
    console.log('✅ Backend connection successful:', response.data);
    return { 
      success: true, 
      data: response.data,
      status: response.status 
    };
  } catch (error: any) {
    console.error('❌ Backend connection failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      isCorsError: error.isCorsError
    });
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      status: error.response?.status,
      isCorsError: error.isCorsError || false
    };
  }
};

// Direct fetch test (bypass axios)
export const testBackendWithFetch = async () => {
  try {
    console.log('🔍 Testing backend with fetch API...');
    const response = await fetch(`${API_BASE_URL}/api/auth/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fetch test successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Fetch test failed:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error: any) {
    console.error('❌ Fetch test error:', error);
    return { success: false, error: error.message };
  }
};