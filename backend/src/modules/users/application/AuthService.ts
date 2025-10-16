import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { User } from '../domain/entities/User.entity';
import { config } from '../../../config/env';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../../../shared/errors';
import { isValidEmail } from '../../../shared/utils';
import { EmailService } from '../../../shared/services/EmailService';
import { OTPService } from '../../../shared/services/OTPService';
import { DeviceService, DeviceInfo } from '../../../shared/services/DeviceService';

export class AuthService {
  private emailService = new EmailService();

  constructor(private userRepository: IUserRepository) {}

  async register(data: {
    email: string;
    password: string;
    name: string;
    deviceInfo?: DeviceInfo;
  }): Promise<{ user: User; requiresEmailVerification: boolean; message: string }> {
   
    if (!isValidEmail(data.email)) {
      throw new BadRequestError('Invalid email format');
    }


    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

   
    const hashedPassword = await bcrypt.hash(data.password, 10);

 
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    if (data.deviceInfo) {
      await DeviceService.registerDevice(user.id, data.deviceInfo);
    }


    const otp = await OTPService.createEmailVerificationOTP(user.id, user.email);
    
 
    const isEmailConfigured = config.emailUser && config.emailPass && 
                             config.emailUser !== 'your-email@gmail.com' && 
                             config.emailPass !== 'your-app-password';
    

    if (isEmailConfigured) {
      try {
        await this.emailService.sendEmailVerification(user.email, user.name, otp);
        return { 
          user, 
          requiresEmailVerification: true,
          message: 'Registration successful! Please check your email for verification code.'
        };
      } catch (emailError: any) {
        console.error('Failed to send email verification:', emailError);
        
       
        const isAuthError = emailError?.code === 'EAUTH' || 
                           (emailError?.response && emailError.response.includes('Username and Password not accepted'));
        
        if (isAuthError && config.nodeEnv === 'development') {
        
          console.log(`\n🔧 DEVELOPMENT MODE - Invalid email credentials detected!`);
          console.log(`📧 Email verification OTP for ${user.email}: ${otp}\n`);
          console.log(`⚠️  WARNING: Please check your EMAIL_USER and EMAIL_PASS environment variables.\n`);
          return { 
            user, 
            requiresEmailVerification: true,
            message: 'Registration successful! Please check the console for your verification code (email credentials invalid).'
          };
        }
        
       
        await this.userRepository.delete(user.id);
        throw new BadRequestError('Failed to send verification email. Please try again or contact support.');
      }
    } else {
      if (config.nodeEnv === 'production') {
        await this.userRepository.delete(user.id);
        throw new BadRequestError('Email service not configured. Registration cannot be completed.');
      }
      
      console.log(`\n🔧 DEVELOPMENT MODE - No email configuration found`);
      console.log(`📧 Email verification OTP for ${user.email}: ${otp}\n`);
      return { 
        user, 
        requiresEmailVerification: true,
        message: 'Registration successful! Please check the console for your verification code (development mode).'
      };
    }
  }

  async login(data: {
    email: string;
    password: string;
    deviceInfo?: DeviceInfo;
  }): Promise<{ user: User; token: string; requiresDeviceVerification: boolean; message?: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

   
    if (!user.isEmailVerified && config.nodeEnv === 'production') {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    if (data.deviceInfo) {
      const isDeviceTrusted = await DeviceService.isDeviceTrusted(user.id, data.deviceInfo.deviceId);
      
      if (!isDeviceTrusted) {
        const otp = await OTPService.createEmailVerificationOTP(user.id, user.email);
        const deviceName = DeviceService.parseUserAgent(data.deviceInfo.userAgent);
        await this.emailService.sendNewDeviceLogin(user.email, user.name, deviceName, otp);
        
        return {
          user,
          token: '',
          requiresDeviceVerification: true,
          message: 'New device detected. Please check your email for verification code.'
        };
      }

      await DeviceService.registerDevice(user.id, data.deviceInfo);
    }

    const token = this.generateToken(user);

    return { user, token, requiresDeviceVerification: false };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string }
  ): Promise<User> {
    const user = await this.userRepository.update(userId, data);
    return user;
  }

  async verifyEmail(userId: string, otp: string): Promise<{ user: User; token: string; success: boolean; message: string }> {
    const result = await OTPService.verifyEmailOTP(userId, otp);
    
    if (result.success) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      const token = this.generateToken(user);
      
      return { 
        user, 
        token, 
        success: true, 
        message: 'Email verified successfully!' 
      };
    } else {
      let errorMessage = 'Verification code is invalid';
      
      switch (result.reason) {
        case 'expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'already_used':
          errorMessage = 'This verification code has already been used. Please request a new one.';
          break;
        case 'invalid':
        default:
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
      }
      
      throw new BadRequestError(errorMessage);
    }
  }

  async verifyDevice(userId: string, deviceId: string, otp: string): Promise<{ token: string; message: string }> {
    const result = await OTPService.verifyEmailOTP(userId, otp);
    
    if (!result.success) {
      let errorMessage = 'Verification code is invalid';
      
      switch (result.reason) {
        case 'expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'already_used':
          errorMessage = 'This verification code has already been used. Please request a new one.';
          break;
        case 'invalid':
        default:
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
      }
      
      throw new BadRequestError(errorMessage);
    }

    await DeviceService.trustDevice(userId, deviceId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const token = this.generateToken(user);

    return { token, message: 'Device verified successfully!' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string; userId?: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a password reset code has been sent.' };
    }

    const otp = await OTPService.createPasswordResetOTP(user.id, user.email);
    await this.emailService.sendPasswordReset(user.email, user.name, otp);

    return { 
      message: 'If the email exists, a password reset code has been sent.',
      userId: user.id 
    };
  }

  async resetPassword(userId: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const isValid = await OTPService.verifyPasswordResetOTP(userId, otp);
    
    if (!isValid) {
      throw new BadRequestError('Invalid or expired reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(userId, { password: hashedPassword } as any);

    return { message: 'Password reset successfully!' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    const otp = await OTPService.createEmailVerificationOTP(user.id, user.email);
    
    const isEmailConfigured = config.emailUser && config.emailPass && 
                             config.emailUser !== 'your-email@gmail.com' && 
                             config.emailPass !== 'your-app-password';
    
    if (isEmailConfigured) {
      try {
        await this.emailService.sendEmailVerification(user.email, user.name, otp);
        return { message: 'Verification email sent successfully!' };
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        return { message: 'Verification code regenerated. Please check the console for the code (development mode).' };
      }
    } else {
      console.log(`\n🔧 DEVELOPMENT MODE - Resent verification OTP for ${user.email}: ${otp}\n`);
      return { message: 'Verification code regenerated. Please check the console for the code (development mode).' };
    }
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      freeQuotaUsed: user.freeQuotaUsed,
      freeQuotaLimit: user.freeQuotaLimit,
      lastQuotaReset: user.lastQuotaReset,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

