import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  requireOtp?: boolean;
  email?: string;
}

export const authService = {
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<AuthResponse>('/auth/login', data),

  verifyLoginOtp: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>('/auth/login-verify', data),

  register: (data: { name: string; email: string; password: string; confirmPassword?: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  verifyRegisterOtp: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>('/auth/register-verify', data),

  forgotPassword: (email: string) =>
    api.post<{ message: string; requireOtp?: boolean; email?: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),

  resendOtp: (data: { email: string; type: 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' }) =>
    api.post<{ message: string }>('/auth/resend-otp', data),

  firebaseGoogleLogin: (data: { email: string; name?: string; firebaseUid?: string }) =>
    api.post<AuthResponse>('/auth/firebase-login', data),

  getMe: () =>
    api.get<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; password?: string; newPassword?: string }) =>
    api.put<{ message: string; user: User }>('/auth/profile', data)
};

