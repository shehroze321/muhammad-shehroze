import { v4 as uuidv4 } from 'uuid';
import { UserDevice } from '@prisma/client';
import { databaseService } from '../../config/database';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
}

export class DeviceService {
  private static get prisma() {
    return databaseService.getClient();
  }
  static generateDeviceId(): string {
    return uuidv4();
  }

  static parseUserAgent(userAgent: string): string {
    // Simple user agent parsing
    if (userAgent.includes('Chrome')) {
      return userAgent.includes('Windows') ? 'Chrome on Windows' : 
             userAgent.includes('Mac') ? 'Chrome on macOS' :
             userAgent.includes('Linux') ? 'Chrome on Linux' : 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return userAgent.includes('Windows') ? 'Firefox on Windows' :
             userAgent.includes('Mac') ? 'Firefox on macOS' :
             userAgent.includes('Linux') ? 'Firefox on Linux' : 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return userAgent.includes('iPhone') ? 'Safari on iPhone' :
             userAgent.includes('iPad') ? 'Safari on iPad' :
             userAgent.includes('Mac') ? 'Safari on macOS' : 'Safari';
    } else if (userAgent.includes('Edge')) {
      return 'Microsoft Edge';
    } else {
      return 'Unknown Browser';
    }
  }

  static async registerDevice(
    userId: string, 
    deviceInfo: DeviceInfo
  ): Promise<UserDevice> {
    // Check if device already exists
    const existingDevice = await this.prisma.userDevice.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId
        }
      }
    });

    if (existingDevice) {
      // Update last used time
      return await this.prisma.userDevice.update({
        where: { id: existingDevice.id },
        data: { 
          lastUsedAt: new Date(),
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress
        }
      });
    }

    // Create new device
    return await this.prisma.userDevice.create({
      data: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        isTrusted: false, // New devices are not trusted by default
      }
    });
  }

  static async isDeviceTrusted(userId: string, deviceId: string): Promise<boolean> {
    const device = await this.prisma.userDevice.findUnique({
      where: {
        userId_deviceId: {
          userId,
          deviceId
        }
      }
    });

    return device?.isTrusted || false;
  }

  static async trustDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.userDevice.update({
      where: {
        userId_deviceId: {
          userId,
          deviceId
        }
      },
      data: { isTrusted: true }
    });
  }

  static async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' }
    });
  }

  static async removeDevice(userId: string, deviceId: string): Promise<void> {
    await this.prisma.userDevice.delete({
      where: {
        userId_deviceId: {
          userId,
          deviceId
        }
      }
    });
  }

  static async cleanupOldDevices(daysOld: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.prisma.userDevice.deleteMany({
      where: {
        lastUsedAt: { lt: cutoffDate }
      }
    });
  }
}
