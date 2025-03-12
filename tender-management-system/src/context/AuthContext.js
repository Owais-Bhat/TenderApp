import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDemoData } from '../utils/demoData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data and check if user is logged in
    const loadDataAndUser = async () => {
      try {
        // Initialize demo data first
        await initializeDemoData(AsyncStorage);
        
        // Then check if user is logged in
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data or initialize demo data', error);
      } finally {
        setLoading(false);
      }
    };

    loadDataAndUser();
  }, []);

  const login = async (userData) => {
    try {
      // In a real app, we'd make an API call to verify credentials
      // For this demo, we'll check if the user exists in AsyncStorage
      
      const storedUsers = await AsyncStorage.getItem('users');
      let users = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
        
        // Find user by email
        const foundUser = users.find(u => u.email === userData.email);
        
        if (foundUser) {
          // Verify password (in a real app, we'd use bcrypt or similar)
          if (foundUser.password === userData.password) {
            // Determine if the user is an admin based on the role
            const userWithRole = {
              ...foundUser,
              isAdmin: foundUser.role === 'admin' || userData.role === 'admin'
            };
            
            // Store the current user (without password) in AsyncStorage
            const userToStore = { ...userWithRole };
            delete userToStore.password;
            
            await AsyncStorage.setItem('user', JSON.stringify(userToStore));
            setUser(userToStore);
            return true;
          }
        }
      }
      
      // If we're in demo mode and no users exist, allow login with any credentials
      if (users.length === 0) {
        const demoUser = {
          ...userData,
          isAdmin: userData.role === 'admin',
          name: userData.name || userData.email.split('@')[0],
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
        return true;
      }
      
      return false; // Login failed
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout failed', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // In a real app, we'd make an API call to register the user
      // For this demo, we'll store the user in AsyncStorage
      
      // Create new user object with provided role or default to user
      const newUser = {
        ...userData,
        isAdmin: userData.isAdmin || userData.role === 'admin' || false,
        role: userData.role || 'user',
        createdAt: new Date().toISOString()
      };
      
      // Get existing users
      const storedUsers = await AsyncStorage.getItem('users');
      let users = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
        
        // Check if email already exists
        if (users.some(user => user.email === userData.email)) {
          return false; // Email already registered
        }
      }
      
      // Add new user to users array
      users.push(newUser);
      
      // Save updated users array
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Also log the user in directly (without storing password in current user)
      const userToStore = { ...newUser };
      delete userToStore.password;
      delete userToStore.confirmPassword;
      
      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  };

  const updateUserProfile = async (updatedUserData) => {
    try {
      // In a real app, we'd make an API call to update the user's data
      // For this demo, we'll just update it directly in AsyncStorage
      
      const updatedUser = {
        ...user,
        ...updatedUserData,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update in the users array if it exists
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        let users = JSON.parse(storedUsers);
        users = users.map(u => {
          if (u.email === user.email) {
            // Update user but preserve password
            return { ...u, ...updatedUserData, updatedAt: new Date().toISOString() };
          }
          return u;
        });
        
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Profile update failed', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateUserProfile,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 