import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import { OtpInput } from '../../components/OtpInput';
import { isFirebaseConfigured, signInWithGoogle } from '../../services/firebase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
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

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({ email, password, rememberMe });

      if (res.requireOtp) {
        setStep('otp');
        setOtp('');
        setResendCooldown(60);
        info(res.message || 'Verification code sent to your email.');
      } else if (res.token && res.user) {
        login(res.token, res.user);
        success(`Welcome back, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      info('Firebase API Keys ထည့်သွင်းရန် လိုအပ်ပါသည် (frontend/.env တွင် VITE_FIREBASE_* ကို ဖြည့်ပါ)');
      return;
    }

    try {
      setLoading(true);
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser.email) {
        error('Google account email not found.');
        return;
      }

      const res = await authService.firebaseGoogleLogin({
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Google User',
        firebaseUid: firebaseUser.uid
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        success(`Welcome, ${res.user.name}!`);
        navigate('/');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (!code || code.length !== 6) {
      error('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyLoginOtp({
        email: email.toLowerCase().trim(),
        otp: code
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        success(`Verification successful! Welcome back, ${res.user.name}.`);
        navigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Incorrect or expired verification code.');
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
        type: 'LOGIN'
      });
      setResendCooldown(60);
      setOtp('');
      success(res.message || 'A new code has been sent to your email.');
    } catch (err: any) {
      error(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@expensetracker.pro');
    setPassword('user123');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden transition-all">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

      {step === 'credentials' ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Access your personal finances and track every transaction.
            </p>
          </div>

          <form onSubmit={handleSubmitCredentials} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 accent-purple-600"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Checking credentials...</span>
              ) : (
                <>
                  <span>Continue with Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                  Or
                </span>
              </div>
            </div>

            {/* Google Sign In via Firebase */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Demo Credentials Quick-Fill Helper */}
          <div className="mt-5 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs">
            <span className="text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Demo: user123
            </span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 underline"
            >
              Quick Autofill
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-purple-600 dark:text-purple-400 hover:underline ml-1"
            >
              Create new account
            </Link>
          </div>
        </>
      ) : (
        /* OTP Verification Step */
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setStep('credentials')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to email & password
          </button>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              We sent a 6-digit security code to:
            </p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5 break-all">
              {email}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }}
          >
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Enter 6-Digit OTP Code
            </label>

            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={(completedCode) => handleVerifyOtp(completedCode)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying code...</span>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Didn't receive the email?</span>
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
