import { apiClient, API_ENDPOINTS, setToken, setRefreshToken, setUser } from '@/config/api';

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
  specialization?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const authData = response.data.data;
      
      // Store tokens and user data
      setToken(authData.token);
      if (authData.refreshToken) {
        setRefreshToken(authData.refreshToken);
      }
      setUser(authData.user);
      
      return authData;
    } catch (error: any) {
      console.error('Login service error:', error);
      
      // Enhance error message for better user feedback
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.SIGNUP,
        userData
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

      const authData = response.data.data;
      
      // Store tokens and user data
      setToken(authData.token);
      if (authData.refreshToken) {
        setRefreshToken(authData.refreshToken);
      }
      setUser(authData.user);
      
      return authData;
    } catch (error: any) {
      console.error('Signup service error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always remove tokens even if API call fails
      const { removeTokens } = await import('@/config/api');
      removeTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Token refresh failed');
    }
    
    const data = response.data.data;
    setToken(data.token);
    
    return data;
  }

  async verifyToken(): Promise<{ valid: boolean }> {
    const response = await apiClient.get<ApiResponse<{ valid: boolean }>>(
      API_ENDPOINTS.AUTH.VERIFY
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Token verification failed');
    }
    
    return response.data.data;
  }
}

export const authService = new AuthService();