import axios from 'axios';

// API Configuration
export const API_BASE_URL = 'https://patientcarebackend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  HEALTH: {
    BASE: '/health',
    DETAILED: '/health/detailed',
    PING: '/health/ping'
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

// Token refresh function
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      removeTokens();
      return false;
    }

    console.log('🔄 Attempting to refresh token...');
    const response = await authClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: refreshToken
    });

    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      // Update refresh token if provided
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
      }
      console.log('✅ Token refreshed successfully');
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error);
    
    // If refresh token is invalid, clear everything and redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🔄 Refresh token invalid, clearing storage...');
      removeTokens();
      
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
    return false;
  }
};

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

// Response interceptor for apiClient with auto-refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ Error from ${originalRequest?.url}:`, {
      status: error.response?.status,
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    
    // Handle token expiration - auto refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expired, attempting refresh...');
      originalRequest._retry = true;
      
      try {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          // Retry the original request with new token
          const token = getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            console.log('🔄 Retrying original request with new token...');
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Auto-refresh failed:', refreshError);
        // Don't remove tokens here, let the refresh function handle it
      }
    }
    
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('blocked')) {
      console.error('🌐 CORS Error Detected: Request was blocked by browser CORS policy');
      error.isCorsError = true;
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

// Enhanced backend connection test
export const testBackendConnection = async (retries = 3, delay = 2000) => {
  const endpoints = [
    '/health',
    '/health/ping',
    '/',
    '/api/health'
  ];

  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Testing backend connection to ${endpoint} (Attempt ${attempt}/${retries})...`);
        console.log(`🌐 Backend URL: ${API_BASE_URL}`);
        
        const response = await authClient.get(endpoint, {
          timeout: 15000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });
        
        console.log(`✅ Backend connection successful to ${endpoint}:`, response.data);
        return { 
          success: true, 
          data: response.data,
          status: response.status,
          endpoint,
          attempt 
        };
      } catch (error) {
        console.error(`❌ Backend connection failed for ${endpoint} (Attempt ${attempt}/${retries}):`, {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          url: error.config?.url,
          isCorsError: error.isCorsError
        });
        
        if (attempt < retries) {
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  return { 
    success: false, 
    error: 'All connection attempts failed for all endpoints',
    attempts: retries
  };
};

// Direct fetch test (bypass axios)
export const testBackendWithFetch = async () => {
  const endpoints = [
    '/health',
    '/health/ping',
    '/',
    '/api/health'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing backend with fetch API to: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
        console.log(`✅ Fetch test successful to ${endpoint}:`, data);
        return { success: true, data, endpoint };
      } else {
        console.error(`❌ Fetch test failed for ${endpoint}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`❌ Fetch test error for ${endpoint}:`, error);
    }
  }
  
  return { success: false, error: 'All fetch attempts failed' };
};

// Test with different endpoints
export const testMultipleEndpoints = async () => {
  const endpoints = [
    '/health',
    '/health/ping',
    '/health/detailed',
    '/',
    '/api/health'
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
    } catch (error) {
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

// Login function with token storage
export const loginUser = async (credentials: any) => {
  try {
    console.log('🔐 Attempting login...');
    const response = await authClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.data.accessToken) {
      setToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      console.log('✅ Login successful');
      return response.data;
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }
};

// Verify token function
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};