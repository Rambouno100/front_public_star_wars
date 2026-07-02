import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logoutUser } from './api';

export const AuthContext = createContext(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const login = useCallback((accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    queryClient.clear();
    try { await logoutUser(); } catch {}
  }, [queryClient]);

  const checkAuthStatus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [queryClient]);

  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <AuthContext.Provider value={{ login, logout, checkAuthStatus, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
