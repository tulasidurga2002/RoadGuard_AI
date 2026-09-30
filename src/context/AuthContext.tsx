import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthService, DEMO_ACCOUNTS } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  demoAccounts: typeof DEMO_ACCOUNTS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = AuthService.getCurrentSession();
    return session ? session.user : null;
  });

  const isAuthenticated = !!currentUser;

  const login = (email: string, password: string, rememberMe: boolean = true) => {
    const result = AuthService.login(email, password, rememberMe);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Authentication failed' };
  };

  const signup = (name: string, email: string, password: string, role: UserRole) => {
    const result = AuthService.signup(name, email, password, role);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Registration failed' };
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    // Quick switch to demo account of that role
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role);
    if (demo) {
      const res = AuthService.login(demo.email, demo.password, true);
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        signup,
        logout,
        switchRole,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
