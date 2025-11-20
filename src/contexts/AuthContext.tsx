import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginRequest, SignupRequest } from '@/services/authService';
import { getToken, getUser, setUser, removeTokens } from '@/config/api';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  const signup = async (data: SignupRequest) => {
    try {
      const response = await authService.signup(data);
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      return { success: false, error: errorMessage };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setIsAuthenticated(true);
      setCurrentUser(response.user);
      
      toast({
        title: "Success",
        description: `Welcome back, ${response.user.firstName}!`,
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, signup }}>
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