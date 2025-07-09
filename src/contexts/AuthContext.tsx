import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, type User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Starting authentication check...');
      const token = localStorage.getItem('authToken');
      console.log('AuthContext: Token found:', !!token);

      // TEMPORARY: Skip authentication for testing
      // TODO: Remove this and restore proper authentication
      console.log('AuthContext: TEMPORARY - Simulating authenticated user for testing');
      setUser({
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        isVerified: true,
        preferences: {
          favoriteSports: ['football'],
          favoriteTeams: ['KC', 'LAL'],
          notifications: {
            email: true,
            push: true,
            trades: true,
            waivers: true
          }
        },
        stats: {
          totalLeagues: 0,
          totalWins: 0,
          totalLosses: 0,
          championships: 0
        },
        createdAt: new Date()
      });

      console.log('AuthContext: Setting loading to false');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });

      // Store the token in localStorage
      if (response.token) {
        console.log('AuthContext: Storing token in localStorage');
        localStorage.setItem('authToken', response.token);
      }

      console.log('AuthContext: Setting user:', response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      // Store the token in localStorage
      if (response.token) {
        console.log('AuthContext: Storing token in localStorage (register)');
        localStorage.setItem('authToken', response.token);
      }

      console.log('AuthContext: Setting user (register):', response.user);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Remove token from localStorage and clear user state
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
