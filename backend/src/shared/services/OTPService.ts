import { databaseService } from '../../config/database';

export class OTPService {
  private static get prisma() {
    return databaseService.getClient();
  }

  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static getExpiryTime(minutes: number = 10): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
  }

  static async createEmailVerificationOTP(userId: string, email: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = this.getExpiryTime(10); // 10 minutes

    await this.prisma.emailVerification.deleteMany({
      where: { userId, isUsed: false }
    });

    // Create new OTP
    await this.prisma.emailVerification.create({
      data: {
        userId,
        email,
        otp,
        expiresAt,
      }
    });

    return otp;
  }

  static async createPasswordResetOTP(userId: string, email: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = this.getExpiryTime(15); // 15 minutes

    await this.prisma.passwordReset.deleteMany({
      where: { userId, isUsed: false }
    });

    await this.prisma.passwordReset.create({
      data: {
        userId,
        email,
        otp,
        expiresAt,
      }
    });

    return otp;
  }

  static async verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; reason?: 'invalid' | 'expired' | 'already_used' }> {
 
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        userId,
        otp,
        isUsed: false
      }
    });

    if (!verification) {
      const usedVerification = await this.prisma.emailVerification.findFirst({
        where: {
          userId,
          otp,
          isUsed: true
        }
      });

      if (usedVerification) {
        return { success: false, reason: 'already_used' };
      }

    
      return { success: false, reason: 'invalid' };
    }

    if (verification.expiresAt <= new Date()) {
      return { success: false, reason: 'expired' };
    }

    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true }
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    return { success: true };
  }

  static async verifyPasswordResetOTP(userId: string, otp: string): Promise<boolean> {
    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        userId,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!reset) {
      return false;
    }

    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { isUsed: true }
    });

    return true;
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    const now = new Date();
    
    await Promise.all([
      this.prisma.emailVerification.deleteMany({
        where: { expiresAt: { lt: now } }
      }),
      this.prisma.passwordReset.deleteMany({
        where: { expiresAt: { lt: now } }
      })
    ]);
  }
}
