// Spring Boot Backend API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  // Patients
  PATIENTS: {
    BASE: '/patients',
    BY_ID: (id: string) => `/patients/${id}`,
    SEARCH: '/patients/search',
    CONSENT: (id: string) => `/patients/${id}/consent`,
    EXPORT_EXCEL: '/patients/export/excel',
    EXPORT_PDF: '/patients/export/pdf',
  },
  // Procedures
  PROCEDURES: {
    BASE: '/procedures',
    BY_ID: (id: string) => `/procedures/${id}`,
    BY_PATIENT: (patientId: string) => `/procedures/patient/${patientId}`,
  },
  // Vital Data
  VITAL_DATA: {
    BASE: '/vital-data',
    BY_ID: (id: string) => `/vital-data/${id}`,
    BY_PATIENT: (patientId: string) => `/vital-data/patient/${patientId}`,
  },
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: string) => `/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `/appointments/patient/${patientId}`,
  },
  // Doctor Analysis
  ANALYSIS: {
    BASE: '/analysis',
    BY_ID: (id: string) => `/analysis/${id}`,
    BY_PATIENT: (patientId: string) => `/analysis/patient/${patientId}`,
  },
  // Prescriptions
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    BY_ID: (id: string) => `/prescriptions/${id}`,
    BY_PATIENT: (patientId: string) => `/prescriptions/patient/${patientId}`,
  },
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
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

        const { token } = response.data;
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
