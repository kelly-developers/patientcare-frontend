import axios from 'axios';

// API Configuration
export const API_BASE_URL = 'https://patientcarebackend.onrender.com';

// API endpoints matching Spring Boot backend
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PATIENTS: {
    BASE: '/api/patients',
    BY_ID: (id: string) => `/api/patients/${id}`,
    BY_PATIENT_ID: (patientId: string) => `/api/patients/patient-id/${patientId}`,
    SEARCH: '/api/patients/search',
    RESEARCH_CONSENT: '/api/patients/research-consent',
    COUNT: '/api/patients/count',
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id: string) => `/api/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/api/appointments/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/api/appointments/doctor/${doctorId}`,
    BY_DATE: (date: string) => `/api/appointments/date/${date}`,
    UPCOMING: (patientId: string) => `/api/appointments/patient/${patientId}/upcoming`,
    UPDATE_STATUS: (id: string) => `/api/appointments/${id}/status`,
    UPDATE_ARRIVAL: (id: string) => `/api/appointments/${id}/arrival`,
  },
  SURGERIES: {
    BASE: '/api/surgeries',
    BY_ID: (id: string) => `/api/surgeries/${id}`,
    BY_PATIENT: (patientId: string) => `/api/surgeries/patient/${patientId}`,
    BY_STATUS: (status: string) => `/api/surgeries/status/${status}`,
    BY_SURGEON: (surgeonName: string) => `/api/surgeries/surgeon/${surgeonName}`,
    PENDING_CONSENT: '/api/surgeries/pending-consent',
    DATE_RANGE: '/api/surgeries/date-range',
    UPDATE_STATUS: (id: string) => `/api/surgeries/${id}/status`,
  },
  CONSENT: {
    BASE: '/api/consent',
    BY_SURGERY: (surgeryId: string) => `/api/consent/surgery/${surgeryId}`,
    UPLOAD: (consentId: string) => `/api/consent/upload/${consentId}`,
    STORED: '/api/consent/stored',
    HAS_VALID: (surgeryId: string) => `/api/consent/surgery/${surgeryId}/has-valid`,
    BY_DECISION: (decision: string) => `/api/consent/decision/${decision}`,
  },
  PREOPERATIVE: {
    BASE: '/api/preoperative',
    BY_ID: (id: string) => `/api/preoperative/${id}`,
    BY_PATIENT: (patientId: string) => `/api/preoperative/patient/${patientId}`,
    IS_COMPLETE: (patientId: string) => `/api/preoperative/patient/${patientId}/complete`,
  },
  DURING_OPERATION: {
    BASE: '/api/during-operation',
    BY_ID: (id: string) => `/api/during-operation/${id}`,
    BY_SURGERY: (surgeryId: string) => `/api/during-operation/surgery/${surgeryId}`,
    BY_STATUS: (status: string) => `/api/during-operation/status/${status}`,
    ACTIVE: '/api/during-operation/active',
    RECENT_BY_PATIENT: (patientId: string) => `/api/during-operation/patient/${patientId}/recent`,
    COMPLETE: (id: string) => `/api/during-operation/${id}/complete`,
    VITALS: (id: string) => `/api/during-operation/${id}/vitals`,
    NOTES: (id: string) => `/api/during-operation/${id}/notes`,
    COMPLICATIONS: (id: string) => `/api/during-operation/${id}/complications`,
  },
  POSTOPERATIVE: {
    BASE: '/api/postoperative',
    BY_ID: (id: string) => `/api/postoperative/${id}`,
    BY_PATIENT: (patientId: string) => `/api/postoperative/patient/${patientId}`,
    BY_SURGERY: (surgeryId: string) => `/api/postoperative/surgery/${surgeryId}`,
    BY_TYPE: (followupType: string) => `/api/postoperative/type/${followupType}`,
    NON_ADHERENT: '/api/postoperative/non-adherent',
    OVERDUE: '/api/postoperative/overdue',
  },
  SURGICAL_DECISIONS: {
    BASE: '/api/surgical-decisions',
    BY_ID: (id: string) => `/api/surgical-decisions/${id}`,
    BY_SURGERY: (surgeryId: string) => `/api/surgical-decisions/surgery/${surgeryId}`,
    CONSENSUS: (surgeryId: string) => `/api/surgical-decisions/consensus/${surgeryId}`,
    BY_SURGEON: (surgeonName: string) => `/api/surgical-decisions/surgeon/${surgeonName}`,
    HAS_CONSENSUS: (surgeryId: string) => `/api/surgical-decisions/${surgeryId}/has-consensus`,
  },
  ANALYSIS: {
    BASE: '/api/analysis',
    BY_ID: (id: string) => `/api/analysis/${id}`,
    BY_PATIENT: (patientId: string) => `/api/analysis/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/api/analysis/doctor/${doctorId}`,
    SURGERY_RECOMMENDED: '/api/analysis/surgery-recommended',
  },
  LAB_TESTS: {
    BASE: '/api/lab-tests',
    BY_ID: (id: string) => `/api/lab-tests/${id}`,
    BY_PATIENT: (patientId: string) => `/api/lab-tests/patient/${patientId}`,
    BY_STATUS: (status: string) => `/api/lab-tests/status/${status}`,
    BY_TYPE: (testType: string) => `/api/lab-tests/type/${testType}`,
    URGENT: '/api/lab-tests/urgent',
    DATE_RANGE: '/api/lab-tests/date-range',
    UPDATE_STATUS: (id: string) => `/api/lab-tests/${id}/status`,
  },
  PRESCRIPTIONS: {
    BASE: '/api/prescriptions',
    BY_ID: (id: string) => `/api/prescriptions/${id}`,
    BY_PATIENT: (patientId: string) => `/api/prescriptions/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `/api/prescriptions/doctor/${doctorId}`,
    PENDING: '/api/prescriptions/pending',
    ACTIVE: (patientId: string) => `/api/prescriptions/patient/${patientId}/active`,
    SEARCH: '/api/prescriptions/search',
    UPDATE_STATUS: (id: string) => `/api/prescriptions/${id}/status`,
  },
  ICU: {
    BASE: '/api/icu',
    BY_ID: (id: string) => `/api/icu/${id}`,
    BY_PATIENT: (patientId: string) => `/api/icu/patient/${patientId}`,
    LATEST: (patientId: string) => `/api/icu/patient/${patientId}/latest`,
    CRITICAL: '/api/icu/critical',
    TIME_RANGE: (patientId: string) => `/api/icu/patient/${patientId}/time-range`,
    STATS: (patientId: string) => `/api/icu/patient/${patientId}/stats`,
    VITALS: (id: string) => `/api/icu/${id}/vitals`,
    MEDICATIONS: (id: string) => `/api/icu/${id}/medications`,
  },
  VITAL_DATA: {
    BASE: '/api/vital-data',
    BY_ID: (id: string) => `/api/vital-data/${id}`,
    BY_PATIENT: (patientId: string) => `/api/vital-data/patient/${patientId}`,
    RECORDED_BY_ME: '/api/vital-data/recorded-by-me',
    CRITICAL: '/api/vital-data/critical',
    RECENT: (patientId: string, hours: number) => `/api/vital-data/patient/${patientId}/recent?hours=${hours}`,
    LATEST: (patientId: string, limit: number) => `/api/vital-data/patient/${patientId}/latest?limit=${limit}`,
  },
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    BY_ID: (id: string) => `/api/notifications/${id}`,
    BY_USER: (userId: string) => `/api/notifications/user/${userId}`,
    UNREAD: '/api/notifications/unread',
    READ: (id: string) => `/api/notifications/${id}/read`,
    READ_ALL: '/api/notifications/read-all',
    DUE: '/api/notifications/due',
    RECENT: '/api/notifications/recent',
    UNREAD_COUNT: (userId: string) => `/api/notifications/user/${userId}/unread-count`,
    EMERGENCY: '/api/notifications/emergency',
  },
  EXPORT: {
    PATIENTS: '/api/export/patients',
    SURGERIES: '/api/export/surgeries',
    APPOINTMENTS: '/api/export/appointments',
    LAB_TESTS: '/api/export/lab-tests',
    PRESCRIPTIONS: '/api/export/prescriptions',
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
    const response = await authClient.post(API_ENDPOINTS.AUTH.SIGNIN, credentials);
    
    if (response.data.accessToken || response.data.token) {
      setToken(response.data.accessToken || response.data.token);
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

// Verify token function - uses /auth/me endpoint
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};