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
  backendStatus: 'checking' | 'connected' | 'error';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
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

        // Test backend connection with retries
        console.log('🔍 Starting backend health check...');
        setBackendStatus('checking');
        
        const connection = await import('@/config/api').then(module => module.testBackendConnection(3, 2000));
        
        if (connection.success) {
          console.log('✅ Backend is online and responding');
          setBackendStatus('connected');
        } else {
          console.error('❌ Backend connection failed after all retries:', connection);
          setBackendStatus('error');
          
          // Show a warning toast about backend connection
          toast({
            title: "Backend Connection Issue",
            description: "The server might be starting up. Please wait a moment and try again.",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        removeTokens();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setBackendStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

  const signup = async (data: SignupRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Signup attempt with data:', { ...data, password: '***' });
      
      if (backendStatus === 'error') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please try again later.' 
        };
      }

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
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔑 Login attempt for user:', username);
      
      if (backendStatus === 'error') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please try again later.' 
        };
      }

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
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
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
    backendStatus,
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