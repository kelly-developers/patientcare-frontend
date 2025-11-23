import { authClient, API_ENDPOINTS } from '@/config/api';

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
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: any;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for user:', credentials.username);
      const response = await authClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error: any) {
      console.error('❌ Login service error:', error);
      throw error;
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting signup for user:', userData.username);
      
      const cleanData = {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        phone: userData.phone?.trim() || null,
        role: userData.role || 'DOCTOR'
      };

      console.log('📤 Sending cleaned signup data:', { ...cleanData, password: '***' });
      
      const response = await authClient.post(API_ENDPOINTS.AUTH.SIGNUP, cleanData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Signup service error:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      console.log('👋 Attempting logout');
      const response = await authClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    } catch (error: any) {
      console.error('❌ Logout service error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting token refresh');
      const response = await authClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
      return response.data;
    } catch (error: any) {
      console.error('❌ Token refresh service error:', error);
      throw error;
    }
  }

  async verifyToken(): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying token');
      const response = await authClient.get(API_ENDPOINTS.AUTH.VERIFY);
      return response.data;
    } catch (error: any) {
      console.error('❌ Token verification service error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();