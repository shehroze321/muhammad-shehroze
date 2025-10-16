import { PrismaClient } from '@prisma/client';
import { config } from './env';

class DatabaseService {
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async connect(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to connect to database...');
      console.log(`📋 Database URL: ${this.maskDatabaseUrl(config.databaseUrl)}`);
      
      await this.prisma.$connect();
      
      // Test the connection with a simple query
      await this.prisma.$queryRaw`SELECT 1 as test`;
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      console.log('✅ Database connection established successfully');
      console.log(`📊 Database: ${this.getDatabaseInfo()}`);
      
      return true;
    } catch (error) {
      this.connectionAttempts++;
      this.isConnected = false;
      
      console.error('❌ Database connection failed:');
      console.error(`   Attempt: ${this.connectionAttempts}/${this.maxRetries}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 Retrying connection in 3 seconds... (${this.connectionAttempts}/${this.maxRetries})`);
        await this.delay(3000);
        return this.connect();
      } else {
        console.error('💥 Maximum connection attempts reached. Server will exit.');
        console.error('🔧 Please check your database configuration:');
        console.error('   1. Verify DATABASE_URL is correct');
        console.error('   2. Check if database server is running');
        console.error('   3. Verify network connectivity');
        console.error('   4. Check database credentials');
        process.exit(1);
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }

  getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Database is not connected. Call connect() first.');
    }
    return this.prisma;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): string {
    return this.isConnected ? 'Connected' : 'Disconnected';
  }

  getDatabaseInfo(): string {
    try {
      const url = new URL(config.databaseUrl);
      if (config.databaseUrl.includes('file:')) {
        return 'SQLite (Local)';
      } else {
        return `PostgreSQL (${url.hostname}:${url.port})`;
      }
    } catch {
      return 'Unknown';
    }
  }

  private maskDatabaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.password) {
        urlObj.password = '***';
      }
      return urlObj.toString();
    } catch {
      return 'Invalid URL';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<{ status: string; database: string; connected: boolean; timestamp: string }> {
    try {
      if (!this.isConnected) {
        return {
          status: 'Disconnected',
          database: this.getDatabaseInfo(),
          connected: false,
          timestamp: new Date().toISOString()
        };
      }

      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      
      return {
        status: 'Healthy',
        database: this.getDatabaseInfo(),
        connected: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.isConnected = false;
      return {
        status: 'Error',
        database: this.getDatabaseInfo(),
        connected: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing database connection...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing database connection...');
  await databaseService.disconnect();
  process.exit(0);
});

export default databaseService;