import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
