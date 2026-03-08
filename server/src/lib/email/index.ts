import nodemailer from 'nodemailer';
import logger from '../logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const APP_NAME = process.env.APP_NAME || 'File Management System';
const APP_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Professional email template wrapper
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom spacing -->
        <table role="presentation" style="width: 600px; max-width: 100%; margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 0 40px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                This email was sent to you by ${APP_NAME}. If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email sending failed', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
    </div>
    
    <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
      Verify Your Email Address
    </h2>
    
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
      Thank you for signing up! Please verify your email address to activate your account and get started.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
        Verify Email Address
      </a>
    </div>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; word-break: break-all;">
        <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
          ${verificationUrl}
        </a>
      </p>
    </div>
    
    <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
        <strong>⏰ This link will expire in 24 hours.</strong><br>
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Verify Your Email - ${APP_NAME}`,
    html: emailTemplate(content),
    text: `Welcome to ${APP_NAME}!\n\nPlease verify your email by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
    </div>
    
    <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">
      Reset Your Password
    </h2>
    
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);">
        Reset Password
      </a>
    </div>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; word-break: break-all;">
        <a href="${resetUrl}" style="color: #ef4444; text-decoration: none; font-size: 14px;">
          ${resetUrl}
        </a>
      </p>
    </div>
    
    <div style="margin-top: 32px; padding: 16px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
        <strong>⏰ This link will expire in 1 hour.</strong><br>
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
    
    <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 4px;">
      <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
        <strong>Security Tip:</strong> Never share your password with anyone. ${APP_NAME} will never ask for your password via email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Reset Your Password - ${APP_NAME}`,
    html: emailTemplate(content),
    text: `Password Reset Request\n\nYou requested to reset your password. Visit this link to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email or contact support.\n\n${APP_NAME}`,
  });
};
