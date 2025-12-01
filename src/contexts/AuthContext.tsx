import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginRequest, SignupRequest } from '@/services/authService';
import { getToken, getUser, setUser, removeTokens, setToken, setRefreshToken, testBackendConnection, testBackendWithFetch, testMultipleEndpoints } from '@/config/api';
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
  retryBackendConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { toast } = useToast();

  const checkBackendConnection = async () => {
    try {
      console.log('🔍 Starting comprehensive backend health check...');
      setBackendStatus('checking');
      
      // Try multiple connection strategies
      const connection = await testBackendConnection(3, 2000);
      
      if (connection.success) {
        console.log('✅ Backend is online and responding');
        setBackendStatus('connected');
        return true;
      } else {
        console.error('❌ Axios connection failed, trying fetch...');
        
        // Try fetch as fallback
        const fetchResult = await testBackendWithFetch();
        if (fetchResult.success) {
          console.log('✅ Fetch connection successful');
          setBackendStatus('connected');
          return true;
        }
        
        // Try multiple endpoints
        console.log('🔍 Testing multiple endpoints...');
        const endpointResults = await testMultipleEndpoints();
        const successfulEndpoint = endpointResults.find(result => result.success);
        
        if (successfulEndpoint) {
          console.log('✅ Found working endpoint:', successfulEndpoint.endpoint);
          setBackendStatus('connected');
          return true;
        }
        
        console.error('❌ All connection attempts failed');
        setBackendStatus('error');
        
        toast({
          title: "Backend Connection Issue",
          description: "Cannot connect to the server. Please check if the backend is running and try again.",
          variant: "destructive",
          duration: 5000,
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error during backend connection check:', error);
      setBackendStatus('error');
      return false;
    }
  };

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

        // Test backend connection
        await checkBackendConnection();
        
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

  const retryBackendConnection = async () => {
    setIsLoading(true);
    await checkBackendConnection();
    setIsLoading(false);
  };

  const signup = async (data: SignupRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Signup attempt with data:', { ...data, password: '***' });
      
      if (backendStatus === 'error') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check the connection and try again.' 
        };
      }

      const response = await authService.signup(data);
      
      console.log('✅ Signup response:', response);
      
      // Handle the response - it should already be in the correct format from authService
      if (response.success && response.token && response.user) {
        setToken(response.token);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        setUser(response.user);
        
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        toast({
          title: "Account Created",
          description: `Welcome to PatientCare, ${response.user.firstName}!`,
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.message || 'Signup completed but no token received' 
        };
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.isCorsError) {
        errorMessage = 'CORS error: Cannot connect to server. Please check backend configuration.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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
          error: 'Cannot connect to server. Please check the connection and try again.' 
        };
      }

      const response = await authService.login({ username, password });
      
      console.log('✅ Login response:', response);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }
        setUser(response.user);
        
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        toast({
          title: "Success",
          description: `Welcome back, ${response.user.firstName}!`,
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
      
      if (error.isCorsError) {
        errorMessage = 'CORS error: Cannot connect to server. Please check backend configuration.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Only attempt logout if backend is connected
      if (backendStatus === 'connected') {
        await authService.logout();
      }
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
    retryBackendConnection,
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