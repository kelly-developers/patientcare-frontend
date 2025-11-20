// Spring Boot Backend API Configuration
export const API_BASE_URL = 'https://patientcare-4phl.onrender.com';

// API endpoints - CORRECTED with /api prefix
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/signin',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/signout',
    REFRESH: '/api/auth/refreshtoken',
    VERIFY: '/api/auth/verify',
  },
  // Patients
  PATIENTS: {
    BASE: '/api/patients',
    BY_ID: (id: string) => `/api/patients/${id}`,
    SEARCH: '/api/patients/search',
    CONSENT: (id: string) => `/api/patients/${id}/consent`,
    EXPORT_EXCEL: '/api/patients/export/excel',
    EXPORT_PDF: '/api/patients/export/pdf',
  },
  // Procedures
  PROCEDURES: {
    BASE: '/api/procedures',
    BY_ID: (id: string) => `/api/procedures/${id}`,
    BY_PATIENT: (patientId: string) => `/api/procedures/patient/${patientId}`,
  },
  // Vital Data
  VITAL_DATA: {
    BASE: '/api/vital-data',
    BY_ID: (id: string) => `/api/vital-data/${id}`,
    BY_PATIENT: (patientId: string) => `/api/vital-data/patient/${patientId}`,
  },
  // Appointments
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id: string) => `/api/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/api/appointments/patient/${patientId}`,
  },
  // Doctor Analysis
  ANALYSIS: {
    BASE: '/api/analysis',
    BY_ID: (id: string) => `/api/analysis/${id}`,
    BY_PATIENT: (patientId: string) => `/api/analysis/patient/${patientId}`,
  },
  // Prescriptions
  PRESCRIPTIONS: {
    BASE: '/api/prescriptions',
    BY_ID: (id: string) => `/api/prescriptions/${id}`,
    BY_PATIENT: (patientId: string) => `/api/prescriptions/patient/${patientId}`,
  },
  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
  },
};

// Token management
export const TOKEN_KEY = 'cvms_token';
export const REFRESH_TOKEN_KEY = 'cvms_refresh_token';
export const USER_KEY = 'cvms_user';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = (): any => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Axios instance configuration
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeTokens();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);