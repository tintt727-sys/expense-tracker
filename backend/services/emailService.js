import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Expense Tracker <onboarding@resend.dev>';

/**
 * Send an OTP code via Resend email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.otp - 6-digit OTP code
 * @param {'REGISTER'|'LOGIN'|'FORGOT_PASSWORD'} options.type - Purpose of OTP
 * @param {string} [options.name] - User name if available
 */
export const sendOtpEmail = async ({ to, otp, type, name = 'User' }) => {
  let subject = 'Your Verification Code';
  let title = 'Verification Code';
  let description = 'Please use the verification code below to complete your request.';

  if (type === 'REGISTER') {
    subject = `${otp} is your verification code for Expense Tracker Pro`;
    title = 'Account Registration';
    description = 'Welcome! Enter this verification code to complete your registration and activate your account.';
  } else if (type === 'LOGIN') {
    subject = `${otp} is your Expense Tracker Pro login code`;
    title = 'Two-Factor Login Verification';
    description = 'A login attempt was made for your account. Enter this verification code to sign in.';
  } else if (type === 'FORGOT_PASSWORD') {
    subject = `${otp} is your password reset code`;
    title = 'Password Reset Verification';
    description = 'We received a request to reset your password. Use the verification code below to set a new password.';
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #7c3aed; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; }
        .expiry { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 20px; }
        .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Expense Tracker Pro</h1>
          <p>${title}</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || 'User'},</div>
          <div class="desc">${description}</div>
          <div class="otp-box">
            <div class="otp-label">Your One-Time Code</div>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="expiry">⏳ This code will expire in <strong>5 minutes</strong>.</div>
          <div class="warning">
            If you did not request this verification code, please ignore this email or update your account credentials. Never share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Expense Tracker Pro. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `${title}\n\nHello ${name || 'User'},\n${description}\n\nYour OTP Code: ${otp}\n(Expires in 5 minutes)\n\nIf you did not request this, please ignore this email.`;

  // Always log OTP to backend console for easy local verification & debugging
  console.log(`\n======================================================`);
  console.log(`🔑 [EMAIL OTP] ${type} for ${to}: [ ${otp} ]`);
  console.log(`======================================================\n`);

  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is not configured in .env. Falling back to console-only mode.');
    return { success: false, fallback: true, message: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      html,
      text
    });

    if (response.error) {
      console.error('❌ Resend API returned error:', response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Resend email sent successfully! ID: ${response.data?.id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Resend API exception:', error.message || error);
    return { success: false, error: error.message || error };
  }
};
