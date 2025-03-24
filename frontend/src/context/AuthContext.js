import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/auth';
import { connectSocket, disconnectSocket } from '../services/socket';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Load user from storage
  const loadUser = async () => {
    setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUser(user);
        // Connect to WebSocket
        await connectSocket();
      }
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        setUser(result.user);
        // Connect to WebSocket
        await connectSocket();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.register(userData);

      if (result.success) {
        setUser(result.user);
        // Connect to WebSocket
        await connectSocket();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);

    try {
      // Disconnect from WebSocket
      disconnectSocket();

      // Logout from server
      await authService.logout();

      // Clear user state
      setUser(null);

      return { success: true };
    } catch (error) {
      console.log('Error during logout:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
