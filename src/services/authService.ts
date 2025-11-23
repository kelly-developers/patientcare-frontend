import { authClient, apiClient, API_ENDPOINTS } from '@/config/api';

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
  role: string;
  phone?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await authClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await authClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      userData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Signup failed');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we consider logout successful on client side
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await authClient.post<ApiResponse<{ token: string }>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Token refresh failed');
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
      return response.data.success === true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();