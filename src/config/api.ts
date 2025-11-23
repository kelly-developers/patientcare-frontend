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
    STATUS: '/api/procedures/status',
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
  VITAL_DATA: {
    BASE: '/api/vital-data',
    BY_ID: (id: string) => `/api/vital-data/${id}`,
    BY_PATIENT: (patientId: string) => `/api/vital-data/patient/${patientId}`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
  },
  HEALTH: '/api/health'
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

// Axios instances
import axios from 'axios';

// Common headers
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Auth client (no token required)
export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: commonHeaders,
  timeout: 30000,
  withCredentials: false,
});

// API client (with token)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: commonHeaders,
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor for apiClient to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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

// Response interceptor for apiClient
apiClient.interceptors.response.use(
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
    
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('blocked')) {
      console.error('🌐 CORS Error Detected: Request was blocked by browser CORS policy');
      error.isCorsError = true;
    }
    
    // Handle token expiration
    if (error.response?.status === 401) {
      console.warn('🔐 Token expired or invalid');
      removeTokens();
      // Redirect to login page if needed
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor for authClient
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

// Response interceptor for authClient
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
    
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('blocked')) {
      console.error('🌐 CORS Error Detected: Request was blocked by browser CORS policy');
      error.isCorsError = true;
    }
    
    return Promise.reject(error);
  }
);

// Enhanced backend connection test with multiple strategies
export const testBackendConnection = async (retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Testing backend connection (Attempt ${attempt}/${retries})...`);
      console.log(`🌐 Backend URL: ${API_BASE_URL}`);
      
      const response = await authClient.get(API_ENDPOINTS.HEALTH, {
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      console.log('✅ Backend connection successful:', response.data);
      return { 
        success: true, 
        data: response.data,
        status: response.status,
        attempt 
      };
    } catch (error: any) {
      console.error(`❌ Backend connection failed (Attempt ${attempt}/${retries}):`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        isCorsError: error.isCorsError
      });
      
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Final attempt failed
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          status: error.response?.status,
          isCorsError: error.isCorsError || false,
          attempts: retries
        };
      }
    }
  }
  
  return { 
    success: false, 
    error: 'Max retry attempts reached',
    attempts: retries
  };
};

// Direct fetch test (bypass axios)
export const testBackendWithFetch = async () => {
  try {
    console.log('🔍 Testing backend with fetch API...');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fetch test successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Fetch test failed:', response.status, response.statusText);
      return { success: false, status: response.status, statusText: response.statusText };
    }
  } catch (error: any) {
    console.error('❌ Fetch test error:', error);
    return { success: false, error: error.message };
  }
};

// Test with different endpoints
export const testMultipleEndpoints = async () => {
  const endpoints = [
    API_ENDPOINTS.HEALTH,
    '/api/health/detailed',
    '/health',
    '/'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      const response = await authClient.get(endpoint, { timeout: 10000 });
      results.push({
        endpoint,
        success: true,
        status: response.status,
        data: response.data
      });
      console.log(`✅ ${endpoint}: SUCCESS`);
    } catch (error: any) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
        status: error.response?.status,
        isCorsError: error.isCorsError
      });
      console.log(`❌ ${endpoint}: FAILED - ${error.message}`);
    }
  }
  
  return results;
};