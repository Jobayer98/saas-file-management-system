import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './lib/logger';
import prisma from './lib/prisma';
import { initializeRedis, closeRedis } from './lib/redis';
import { bootstrapAdmin } from './utils/bootstrap';
import { initializeContainer } from './container';
import { SchedulerService } from './services/scheduler/scheduler.service';

const PORT = process.env.PORT || 5000;
const scheduler = new SchedulerService();

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Initialize Redis
    initializeRedis();
    logger.info('✅ Redis connected');

    // Initialize dependency injection container
    initializeContainer(prisma);
    logger.info('✅ Dependency container initialized');

    // Bootstrap: Create default admin if not exists
    await bootstrapAdmin();

    // Start scheduled jobs
    scheduler.start();
    logger.info('✅ Scheduled jobs started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  scheduler.stop();
  await closeRedis();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  scheduler.stop();
  await closeRedis();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
