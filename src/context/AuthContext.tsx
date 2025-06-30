'use client';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/utils/config';

// Define types
interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Define logout as useCallback to prevent unnecessary re-creations
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setUser(null);
    router.push('/auth/login');
  }, [router]); // router is the only dependency

  // Check for existing auth on component mount
  useEffect(() => {
    try {
      // Check if access token exists in local storage
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      
      if (token && username) {
        setUser(username);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up token refresh
  useEffect(() => {
    if (!user) return;
    
    // Function to refresh token
    const refreshToken = async () => {
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) return;
        
        const response = await fetch(`${API_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access);
          return true;
        } else {
          // If refresh fails, log out
          logout();
          return false;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return false;
      }
    };
    
    // Set up interval to refresh token (every 4 minutes if token expires in 5)
    const intervalId = setInterval(refreshToken, 4 * 60 * 1000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [user, logout]); // Added logout as a dependency

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Store tokens and user info
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('username', username);
      
      setUser(username);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Context value
  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};