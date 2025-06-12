'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { apiService } from '@/lib/api';
import { setToken, removeToken, getToken } from '@/lib/cookies';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getToken();
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login({ username, password });
      if (response.status) {
        const userData = response.data;
        setUser(userData);
        setToken(userData.token || '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      if (response.status) {
        const newUser = response.data;
        setUser(newUser);
        setToken(newUser.token || '');
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    apiService.logout();
    removeToken();
    setUser(null);
  };

  const isAdmin = user?.account_type === 'admin';
  const isMember = user?.account_type === 'member';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        register, 
        logout, 
        isAdmin, 
        isMember 
      }}
    >
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