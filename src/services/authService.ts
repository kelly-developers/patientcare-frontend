import { authClient, API_ENDPOINTS } from '@/config/api';

export interface LoginRequest {
  usernameOrEmail?: string;
  email?: string;
  username?: string;
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
  specialty?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: any;
  data?: {
    token: string;
    refreshToken: string;
    user: any;
  };
}

export interface BackendAuthResponse {
  token: string;
  type?: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  specialty?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Determine if user is using email or username
      const usernameOrEmail = credentials.email || credentials.username || credentials.usernameOrEmail;
      console.log('🔐 Attempting login for:', usernameOrEmail);
      
      if (!usernameOrEmail) {
        throw new Error('Username or email is required');
      }

      // Send the single field usernameOrEmail to backend
      const response = await authClient.post(API_ENDPOINTS.AUTH.SIGNIN, {
        usernameOrEmail: usernameOrEmail,
        password: credentials.password
      });
      
      console.log('✅ Login raw response:', response.data);
      
      // Convert backend response to expected format
      const backendResponse = response.data as BackendAuthResponse;
      return this.convertBackendResponse(backendResponse);
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
        role: userData.role || 'DOCTOR',
        specialty: userData.specialty || null
      };

      console.log('📤 Sending cleaned signup data:', { ...cleanData, password: '***' });
      const response = await authClient.post(API_ENDPOINTS.AUTH.SIGNUP, cleanData);
      
      console.log('✅ Signup raw response:', response.data);
      
      // Convert backend response to expected format
      const backendResponse = response.data as BackendAuthResponse;
      return this.convertBackendResponse(backendResponse);
    } catch (error: any) {
      console.error('❌ Signup service error:', error);
      throw error;
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      console.log('👋 Attempting logout');
      const response = await authClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      console.log('✅ Logout successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Logout service error:', error);
      return { success: true, message: 'Logged out successfully' };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting token refresh');
      const response = await authClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
      console.log('✅ Token refresh successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Token refresh service error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      console.log('🔍 Getting current user');
      const response = await authClient.get(API_ENDPOINTS.AUTH.ME);
      console.log('✅ Current user fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  }

  private convertBackendResponse(backendResponse: BackendAuthResponse): AuthResponse {
    return {
      success: true,
      token: backendResponse.token,
      refreshToken: backendResponse.token, // Assuming same token for now
      user: {
        id: backendResponse.id.toString(),
        username: backendResponse.username,
        email: backendResponse.email,
        firstName: backendResponse.firstName,
        lastName: backendResponse.lastName,
        role: backendResponse.role || 'DOCTOR',
        phone: backendResponse.phone,
        specialty: backendResponse.specialty
      },
      data: {
        token: backendResponse.token,
        refreshToken: backendResponse.token,
        user: {
          id: backendResponse.id.toString(),
          username: backendResponse.username,
          email: backendResponse.email,
          firstName: backendResponse.firstName,
          lastName: backendResponse.lastName,
          role: backendResponse.role || 'DOCTOR',
          phone: backendResponse.phone,
          specialty: backendResponse.specialty
        }
      }
    };
  }
}

export const authService = new AuthService();