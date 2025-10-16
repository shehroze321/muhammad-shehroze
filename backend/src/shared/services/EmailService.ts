import nodemailer from 'nodemailer';
import { config } from '../../config/env';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      service: config.emailService,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });
  }

  async sendEmailVerification(email: string, name: string, otp: string): Promise<void> {
    const html = this.getEmailVerificationTemplate(name, otp, email);
    
    await this.transporter.sendMail({
      from: config.emailFrom,
      to: email,
      subject: 'Verify Your EchoWrite Account',
      html,
    });
  }

  async sendPasswordReset(email: string, name: string, otp: string): Promise<void> {
    const html = this.getPasswordResetTemplate(name, otp, email);
    
    await this.transporter.sendMail({
      from: config.emailFrom,
      to: email,
      subject: 'Reset Your EchoWrite Password',
      html,
    });
  }

  async sendNewDeviceLogin(email: string, name: string, deviceInfo: string, otp: string): Promise<void> {
    const html = this.getNewDeviceLoginTemplate(name, deviceInfo, otp, email);
    
    await this.transporter.sendMail({
      from: config.emailFrom,
      to: email,
      subject: 'New Device Login - EchoWrite',
      html,
    });
  }

  private getEmailVerificationTemplate(name: string, otp: string, email: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your EchoWrite Account</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .otp-box { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to EchoWrite!</h1>
            </div>
            <div class="content">
                <h2>Hi ${name}!</h2>
                <p>Thank you for signing up for EchoWrite. To complete your registration and start creating amazing social media posts, please verify your email address.</p>
                
                <div class="otp-box">
                    <h3>Your Verification Code</h3>
                    <div class="otp-code">${otp}</div>
                    <p>This code will expire in 10 minutes</p>
                </div>
                
                <p>Simply enter this code in the verification form to activate your account.</p>
                
                <p>If you didn't create an account with EchoWrite, please ignore this email.</p>
                
                <p>Best regards,<br>The EchoWrite Team</p>
            </div>
            <div class="footer">
                <p>© 2025 EchoWrite. All rights reserved.</p>
                <p>This email was sent to ${email}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getPasswordResetTemplate(name: string, otp: string, email: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your EchoWrite Password</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .otp-box { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Hi ${name}!</h2>
                <p>We received a request to reset your EchoWrite account password. If you made this request, use the code below to reset your password.</p>
                
                <div class="otp-box">
                    <h3>Your Reset Code</h3>
                    <div class="otp-code">${otp}</div>
                    <p>This code will expire in 15 minutes</p>
                </div>
                
                <p>Enter this code in the password reset form to create a new password.</p>
                
                <p><strong>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</strong></p>
                
                <p>Best regards,<br>The EchoWrite Team</p>
            </div>
            <div class="footer">
                <p>© 2025 EchoWrite. All rights reserved.</p>
                <p>This email was sent to ${email}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private getNewDeviceLoginTemplate(name: string, deviceInfo: string, otp: string, email: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Device Login - EchoWrite</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .device-info { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .otp-box { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📱 New Device Login</h1>
            </div>
            <div class="content">
                <h2>Hi ${name}!</h2>
                <p>We noticed a login attempt from a new device. For your security, please verify this login attempt.</p>
                
                <div class="device-info">
                    <h3>Device Information:</h3>
                    <p><strong>${deviceInfo}</strong></p>
                </div>
                
                <div class="otp-box">
                    <h3>Verification Code</h3>
                    <div class="otp-code">${otp}</div>
                    <p>This code will expire in 10 minutes</p>
                </div>
                
                <p>Enter this code to complete the login process.</p>
                
                <p><strong>If this wasn't you, please change your password immediately and contact our support team.</strong></p>
                
                <p>Best regards,<br>The EchoWrite Team</p>
            </div>
            <div class="footer">
                <p>© 2025 EchoWrite. All rights reserved.</p>
                <p>This email was sent to ${email}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
