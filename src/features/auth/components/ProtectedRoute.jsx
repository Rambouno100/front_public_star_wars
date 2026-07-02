import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { data: user, isLoading } = useMe();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};
