import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginRequest, SignupRequest } from '@/services/authService';
import { getToken, getUser, setUser, removeTokens, setToken, setRefreshToken } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (data: SignupRequest) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getToken();
        const user = getUser();
        
        console.log('🔐 Initializing auth - Token:', !!token, 'User:', !!user);
        
        if (token && user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        removeTokens();
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = async (data: SignupRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Signup attempt with data:', { ...data, password: '***' });
      
      const response = await authService.signup(data);
      
      console.log('✅ Signup response:', response);
      
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        
        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        toast({
          title: "Account Created",
          description: `Welcome to PatientCare, ${user.firstName}!`,
        });
        
        return { success: true };
      } else {
        console.error('❌ Invalid signup response structure:', response);
        return { 
          success: false, 
          error: response.message || 'Invalid response from server' 
        };
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        // Handle validation errors
        const data = error.response.data;
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0] || errorMessage;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔑 Login attempt for user:', username);
      const response = await authService.login({ username, password });
      
      console.log('✅ Login response:', response);
      
      if (response.success && response.data) {
        const { token, refreshToken, user } = response.data;
        
        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        toast({
          title: "Success",
          description: `Welcome back, ${user.firstName}!`,
        });
        
        return { success: true };
      } else {
        console.error('❌ Invalid login response structure:', response);
        return { 
          success: false, 
          error: response.message || 'Invalid response from server' 
        };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Service unavailable. Please try again later.';
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if the API call fails, we should clear local state
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      removeTokens();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    signup,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}