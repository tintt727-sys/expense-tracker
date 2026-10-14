import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_pro_super_secret_jwt_key_2026';

// Helper to generate secure 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Step 1: Initiate User Registration
 * Validates data and sends a 6-digit OTP code to the email
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Clean up any pending registration OTPs for this email
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type: 'REGISTER' }
    });

    // Save pending registration details inside the OTP record
    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        type: 'REGISTER',
        payload: JSON.stringify({
          name: name.trim(),
          password: hashedPassword
        }),
        expiresAt
      }
    });

    // Send OTP via Resend email
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      type: 'REGISTER',
      name: name.trim()
    });

    return res.status(200).json({
      requireOtp: true,
      email: normalizedEmail,
      message: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * Step 2: Verify Registration OTP & Create User
 */
export const registerVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const formattedOtp = otp.toString().trim();

    const record = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: 'REGISTER'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ message: 'No pending registration found or code expired.' });
    }

    if (new Date() > new Date(record.expiresAt)) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (record.otp !== formattedOtp) {
      return res.status(400).json({ message: 'Incorrect verification code. Please try again.' });
    }

    // Parse registration payload
    let payload = {};
    try {
      payload = JSON.parse(record.payload || '{}');
    } catch (e) {
      return res.status(400).json({ message: 'Invalid registration state. Please register again.' });
    }

    // Check once again if user already created
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: payload.name || 'User',
          email: normalizedEmail,
          password: payload.password,
          role: 'user'
        }
      });
    }

    // Cleanup OTP record
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type: 'REGISTER' }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Account created and verified successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register verify error:', error);
    return res.status(500).json({ message: 'Server error during registration verification.' });
  }
};

/**
 * Step 1: Initiate Login with Password check
 * If password matches, sends OTP to email
 */
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Password is valid -> Generate and send OTP for 2-step verification
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type: 'LOGIN' }
    });

    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        type: 'LOGIN',
        payload: JSON.stringify({ rememberMe: !!rememberMe }),
        expiresAt
      }
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      type: 'LOGIN',
      name: user.name
    });

    return res.json({
      requireOtp: true,
      email: normalizedEmail,
      message: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * Step 2: Verify Login OTP
 */
export const loginVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const formattedOtp = otp.toString().trim();

    const record = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: 'LOGIN'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ message: 'No login request found or code expired.' });
    }

    if (new Date() > new Date(record.expiresAt)) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return res.status(400).json({ message: 'Verification code has expired. Please log in again.' });
    }

    if (record.otp !== formattedOtp) {
      return res.status(400).json({ message: 'Incorrect verification code. Please try again.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let payload = {};
    try {
      payload = JSON.parse(record.payload || '{}');
    } catch (e) {
      payload = {};
    }

    // Clean up OTP
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type: 'LOGIN' }
    });

    const expiresIn = payload.rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login verify error:', error);
    return res.status(500).json({ message: 'Server error during login verification.' });
  }
};

/**
 * Step 1: Forgot Password - Send OTP Code
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Security best practice: don't reveal non-existent user
      return res.json({
        requireOtp: true,
        email: normalizedEmail,
        message: 'If an account matches this email, a verification code has been sent.'
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for reset

    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type: 'FORGOT_PASSWORD' }
    });

    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        type: 'FORGOT_PASSWORD',
        expiresAt
      }
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      type: 'FORGOT_PASSWORD',
      name: user.name
    });

    return res.json({
      requireOtp: true,
      email: normalizedEmail,
      message: 'A password reset code has been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error during password recovery.' });
  }
};

/**
 * Step 2: Reset Password with OTP Code
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Preferred flow: OTP + email
    if (email && otp) {
      const normalizedEmail = email.toLowerCase().trim();
      const formattedOtp = otp.toString().trim();

      const record = await prisma.otpVerification.findFirst({
        where: {
          email: normalizedEmail,
          type: 'FORGOT_PASSWORD'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!record) {
        return res.status(400).json({ message: 'No reset request found or code expired.' });
      }

      if (new Date() > new Date(record.expiresAt)) {
        await prisma.otpVerification.delete({ where: { id: record.id } });
        return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
      }

      if (record.otp !== formattedOtp) {
        return res.status(400).json({ message: 'Incorrect verification code. Please try again.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { password: hashedPassword }
      });

      await prisma.otpVerification.deleteMany({
        where: { email: normalizedEmail, type: 'FORGOT_PASSWORD' }
      });

      return res.json({ message: 'Password has been reset successfully. You may now log in.' });
    }

    // Legacy fallback: JWT token
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || decoded.purpose !== 'password_reset') {
          return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: decoded.id },
          data: { password: hashedPassword }
        });

        return res.json({ message: 'Password has been reset successfully. You may now log in.' });
      } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }
    }

    return res.status(400).json({ message: 'Email, OTP code, and new password are required.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error resetting password.' });
  }
};

/**
 * Resend OTP Code for any flow
 */
export const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ message: 'Email and verification type are required.' });
    }

    const validTypes = ['REGISTER', 'LOGIN', 'FORGOT_PASSWORD'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid verification type.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find previous pending record
    const existing = await prisma.otpVerification.findFirst({
      where: { email: normalizedEmail, type },
      orderBy: { createdAt: 'desc' }
    });

    if (type === 'REGISTER' && !existing) {
      return res.status(400).json({ message: 'Registration session expired. Please enter details again.' });
    }

    let user = null;
    if (type === 'LOGIN' || type === 'FORGOT_PASSWORD') {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
    }

    const newOtp = generateOtp();
    const expiresAt = new Date(Date.now() + (type === 'FORGOT_PASSWORD' ? 10 : 5) * 60 * 1000);

    // Update or create
    await prisma.otpVerification.deleteMany({
      where: { email: normalizedEmail, type }
    });

    await prisma.otpVerification.create({
      data: {
        email: normalizedEmail,
        otp: newOtp,
        type,
        payload: existing?.payload || null,
        expiresAt
      }
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp: newOtp,
      type,
      name: user ? user.name : 'User'
    });

    return res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error resending verification code.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, password, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();

    if (newPassword) {
      if (!password) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating profile.' });
  }
};

/**
 * Firebase Google Login Endpoint
 * Connects Firebase Google authenticated user with Expense Tracker backend session
 */
export const firebaseGoogleLogin = async (req, res) => {
  try {
    const { email, name, firebaseUid } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required for Google login.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Create user with a generated secure random password
      const randomPassword = `google_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          name: name ? name.trim() : 'Google User',
          email: normalizedEmail,
          password: hashedPassword,
          role: 'user'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Google login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Firebase Google login error:', error);
    return res.status(500).json({ message: 'Server error during Google login.' });
  }
};

