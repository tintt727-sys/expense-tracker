import { Router } from 'express';
import {
  register,
  registerVerify,
  login,
  loginVerify,
  forgotPassword,
  resetPassword,
  resendOtp,
  firebaseGoogleLogin,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Public auth routes with OTP & Firebase support
router.post('/register', register);
router.post('/register-verify', registerVerify);
router.post('/login', login);
router.post('/login-verify', loginVerify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);
router.post('/firebase-login', firebaseGoogleLogin);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
