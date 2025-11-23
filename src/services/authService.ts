import { authClient } from '@/config/api';

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
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
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
  };
}

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await authClient.post('/api/auth/signup', data);
    return response.data;
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await authClient.post('/api/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await authClient.post('/api/auth/logout');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await authClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  async verifyToken(): Promise<{ success: boolean; message: string }> {
    const response = await authClient.get('/api/auth/verify');
    return response.data;
  }
};