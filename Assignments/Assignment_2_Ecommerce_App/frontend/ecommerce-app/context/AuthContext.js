import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        // ✅ Guest mode automatically enable
        const guestUser = {
          id: 'guest',
          name: 'Guest User',
          email: 'guest@example.com',
          isGuest: true
        };
        setUser(guestUser);
        setIsAuthenticated(true); // Guest ko bhi authenticated consider karo
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Guest mode as fallback
      const guestUser = {
        id: 'guest',
        name: 'Guest User', 
        email: 'guest@example.com',
        isGuest: true
      };
      setUser(guestUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Login Function
  const login = async (email, password) => {
    try {
      const userData = {
        id: Date.now(),
        name: email.split('@')[0] || 'User',
        email: email,
        isGuest: false
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', 'user-token-123');

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  // 📝 Signup Function  
  const signup = async (userData) => {
    try {
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        address: userData.address || '',
        phone: userData.phone || '',
        isGuest: false
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('token', 'new-user-token-123');

      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: 'Signup failed' };
    }
  };

  // 👤 Guest Login Function
  const loginAsGuest = async () => {
    try {
      const guestUser = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        isGuest: true
      };

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      await AsyncStorage.setItem('token', 'guest-token-123');

      setUser(guestUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Guest login failed:', error);
      return { success: false, error: 'Guest login failed' };
    }
  };

  // 🚪 Logout Function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✏️ Update Profile
  const updateProfile = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    loginAsGuest, // ✅ Guest login function
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};