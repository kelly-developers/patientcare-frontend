import { apiClient, API_ENDPOINTS, setToken, setRefreshToken, setUser, removeTokens } from '@/config/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'DOCTOR' | 'NURSE' | 'ADMIN' | 'PATIENT';
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    const { token, refreshToken, user } = response.data;
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(user);
    
    return response.data;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    
    const { token, refreshToken, user } = response.data;
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(user);
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      removeTokens();
    }
  },

  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
      return true;
    } catch (error) {
      return false;
    }
  },
};
