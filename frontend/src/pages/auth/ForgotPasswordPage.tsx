import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';
import { OtpInput } from '../../components/OtpInput';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.toLowerCase().trim());
      success(res.message || 'Reset code sent to your email.');
      setStep('reset');
      setOtp('');
      setResendCooldown(60);
    } catch (err: any) {
      error(err.message || 'Failed to request reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      error('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword) {
      error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.toLowerCase().trim(),
        otp,
        newPassword
      });
      success(res.message || 'Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      error(err.message || 'Password reset failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    try {
      setResending(true);
      const res = await authService.resendOtp({
        email: email.toLowerCase().trim(),
        type: 'FORGOT_PASSWORD'
      });
      setResendCooldown(60);
      setOtp('');
      info(res.message || 'A new reset code has been sent to your email.');
    } catch (err: any) {
      error(err.message || 'Failed to resend reset code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

      {step === 'request' ? (
        <>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Password Recovery
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your registered email and we will send a 6-digit OTP code to reset your password.
            </p>
          </div>

          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending OTP Code...</span>
              ) : (
                <>
                  <span>Send Reset OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* OTP + New Password Step */
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setStep('request')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to enter email
          </button>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the 6-digit code sent to <strong className="text-purple-600 dark:text-purple-400">{email}</strong> and your new password.
            </p>
          </div>

          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Enter 6-Digit OTP Code
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Reset & Save Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Didn't receive the code?</span>
            {resendCooldown > 0 ? (
              <span className="font-semibold text-slate-400">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
