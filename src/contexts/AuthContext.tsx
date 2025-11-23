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
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const token = getToken();
        const user = getUser(); // This now safely handles null/undefined
        
        console.log('Initializing auth - Token:', !!token, 'User:', !!user);
        
        if (token && user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
        } else {
          // Clear any partial/invalid state
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any corrupted data
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
      console.log('Signup attempt with data:', { ...data, password: '***' });
      const response = await authService.signup(data);
      
      console.log('Signup response:', response);
      
      // Store tokens and user data
      if (response.token && response.refreshToken && response.user) {
        setToken(response.token);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        toast({
          title: "Account Created",
          description: `Welcome to CardioCare, ${response.user.firstName}!`,
        });
        
        return { success: true };
      } else {
        console.error('Invalid signup response:', response);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle different error formats
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Login attempt for user:', username);
      const response = await authService.login({ username, password });
      
      console.log('Login response:', response);
      
      // Store tokens and user data
      if (response.token && response.refreshToken && response.user) {
        setToken(response.token);
        setRefreshToken(response.refreshToken);
        setUser(response.user);
        
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        toast({
          title: "Success",
          description: `Welcome back, ${response.user.firstName}!`,
        });
        
        return { success: true };
      } else {
        console.error('Invalid login response:', response);
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Service unavailable. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
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