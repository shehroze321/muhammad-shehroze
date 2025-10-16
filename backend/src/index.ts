import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { databaseService } from './config/database';
import { errorHandler } from './shared/middleware/errorHandler';
import { startCronJobs } from './jobs/cronJobs';

import authRoutes from './modules/users/presentation/auth.routes';
import sessionRoutes from './modules/sessions/presentation/session.routes';
import conversationRoutes from './modules/conversations/presentation/conversation.routes';
import chatRoutes from './modules/chat/presentation/chat.routes';
import subscriptionRoutes from './modules/subscriptions/presentation/subscription.routes';

const app: Application = express();

const allowedOrigins = config.clientUrl.split(',').map(url => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req, res) => {
  const dbHealth = await databaseService.healthCheck();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

app.get('/api/health', async (_req, res) => {
  const dbHealth = await databaseService.healthCheck();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

app.use(errorHandler);

const PORT = config.port;

async function startServer() {
  try {
    console.log('Starting EchoWrite Backend Server...');
    console.log('=====================================');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${PORT}`);
    console.log(`Client URL: ${config.clientUrl}`);
    console.log(`Email From: ${config.emailFrom}`);
    console.log(`App Name: ${config.appName}`);
    console.log('');

    await databaseService.connect();

    // Start the server
    app.listen(PORT, () => {
      console.log('');
      console.log('Server started successfully!');
      console.log('================================');
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Database: ${databaseService.getConnectionStatus()}`);
      console.log('');

      startCronJobs();
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

export default app;

