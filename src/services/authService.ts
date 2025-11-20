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
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const authData = response.data.data;
    
    // Store tokens and user data
    setToken(authData.token);
    if (authData.refreshToken) {
      setRefreshToken(authData.refreshToken);
    }
    setUser(authData.user);
    
    return authData;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      userData
    );
    const authData = response.data.data;
    
    // Store tokens and user data
    setToken(authData.token);
    if (authData.refreshToken) {
      setRefreshToken(authData.refreshToken);
    }
    setUser(authData.user);
    
    return authData;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
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
    const data = response.data.data;
    
    // Update the token
    setToken(data.token);
    
    return data;
  }

  async verifyToken(): Promise<{ valid: boolean }> {
    const response = await apiClient.get<ApiResponse<{ valid: boolean }>>(
      API_ENDPOINTS.AUTH.VERIFY
    );
    return response.data.data;
  }
}

export const authService = new AuthService();