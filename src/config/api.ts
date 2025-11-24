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
    BY_ID: (id) => `/api/patients/${id}`,
    SEARCH: '/api/patients/search',
    CONSENT: (id) => `/api/patients/${id}/consent`,
    EXPORT_EXCEL: '/api/patients/export/excel',
    EXPORT_PDF: '/api/patients/export/pdf',
  },
  PROCEDURES: {
    BASE: '/api/procedures',
    BY_ID: (id) => `/api/procedures/${id}`,
    BY_PATIENT: (patientId) => `/api/procedures/patient/${patientId}`,
    STATUS: '/api/procedures/status',
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id) => `/api/appointments/${id}`,
    BY_PATIENT: (patientId) => `/api/appointments/patient/${patientId}`,
  },
  ANALYSIS: {
    BASE: '/api/analysis',
    BY_ID: (id) => `/api/analysis/${id}`,
    BY_PATIENT: (patientId) => `/api/analysis/patient/${patientId}`,
  },
  PRESCRIPTIONS: {
    BASE: '/api/prescriptions',
    BY_ID: (id) => `/api/prescriptions/${id}`,
    BY_PATIENT: (patientId) => `/api/prescriptions/patient/${patientId}`,
  },
  VITAL_DATA: {
    BASE: '/api/vital-data',
    BY_ID: (id) => `/api/vital-data/${id}`,
    BY_PATIENT: (patientId) => `/api/vital-data/patient/${patientId}`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
  },
};

// Token management
export const TOKEN_KEY = 'patientcare_token';
export const REFRESH_TOKEN_KEY = 'patientcare_refresh_token';
export const USER_KEY = 'patientcare_user';

export const getToken = () => {
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

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  }
};

export const getRefreshToken = () => {
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

export const setRefreshToken = (token) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token in localStorage:', error);
    }
  }
};

export const removeTokens = () => {
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

export const getUser = () => {
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

export const setUser = (user) => {
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

// Login function with token storage
export const loginUser = async (credentials) => {
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
export const logoutUser = async () => {
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