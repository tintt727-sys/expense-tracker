import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { CurrencyProvider } from './hooks/useCurrency';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboardPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Main Application Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
