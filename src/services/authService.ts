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
      
      // Try both endpoint patterns
      const endpoints = ['/auth/login', '/api/auth/login'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔐 Trying endpoint: ${endpoint}`);
          const response = await authClient.post(endpoint, credentials);
          console.log('✅ Login successful via endpoint:', endpoint);
          return response.data;
        } catch (endpointError: any) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, throw the last error
      throw new Error('All authentication endpoints failed');
      
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
      
      // Try both endpoint patterns
      const endpoints = ['/auth/signup', '/api/auth/signup'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📝 Trying endpoint: ${endpoint}`);
          const response = await authClient.post(endpoint, cleanData);
          console.log('✅ Signup successful via endpoint:', endpoint);
          return response.data;
        } catch (endpointError: any) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
          // Continue to next endpoint
        }
      }
      
      throw new Error('All signup endpoints failed');
      
    } catch (error: any) {
      console.error('❌ Signup service error:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      console.log('👋 Attempting logout');
      
      const endpoints = ['/auth/logout', '/api/auth/logout'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await authClient.post(endpoint);
          console.log('✅ Logout successful via endpoint:', endpoint);
          return response.data;
        } catch (endpointError: any) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
        }
      }
      
      // Even if logout fails on server, consider it successful on client
      return { success: true, message: 'Logged out successfully' };
      
    } catch (error: any) {
      console.error('❌ Logout service error:', error);
      // Still return success for client-side cleanup
      return { success: true, message: 'Logged out successfully' };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting token refresh');
      
      const endpoints = ['/auth/refresh', '/api/auth/refresh'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await authClient.post(endpoint, { refreshToken });
          console.log('✅ Token refresh successful via endpoint:', endpoint);
          return response.data;
        } catch (endpointError: any) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
        }
      }
      
      throw new Error('All token refresh endpoints failed');
      
    } catch (error: any) {
      console.error('❌ Token refresh service error:', error);
      throw error;
    }
  }

  async verifyToken(): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying token');
      
      const endpoints = ['/auth/verify', '/api/auth/verify'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await authClient.get(endpoint);
          console.log('✅ Token verification successful via endpoint:', endpoint);
          return response.data;
        } catch (endpointError: any) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.message);
        }
      }
      
      throw new Error('All token verification endpoints failed');
      
    } catch (error: any) {
      console.error('❌ Token verification service error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();