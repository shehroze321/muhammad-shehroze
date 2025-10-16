import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT!, 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  clientUrl: process.env.CLIENT_URL!,
  emailHost: process.env.EMAIL_HOST!,
  emailPort: 465,
  emailService: 'gmail',
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER!,
  emailPass: process.env.EMAIL_PASS!,
  emailFrom: process.env.EMAIL_FROM!,

  appName: process.env.APP_NAME!,
  appUrl: process.env.APP_URL!,

  anonymousSessionExpiryDays: parseInt(process.env.ANONYMOUS_SESSION_EXPIRY_DAYS!, 10),
  freeConversationsLimit: parseInt(process.env.FREE_CONVERSATIONS_LIMIT!, 10),
  freeMessagesLimit: parseInt(process.env.FREE_MESSAGES_LIMIT!, 10),
};

const validateEnv = () => {
  const required = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLIENT_URL',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_SECURE',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
    'APP_NAME',
    'APP_URL',
    'ANONYMOUS_SESSION_EXPIRY_DAYS',
    'FREE_CONVERSATIONS_LIMIT',
    'FREE_MESSAGES_LIMIT'
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(` Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  console.log('All required environment variables are configured');
};

validateEnv();

