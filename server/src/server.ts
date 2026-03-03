import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './lib/logger';
import prisma from './lib/prisma';
import { bootstrapAdmin } from './utils/bootstrap';
import { initializeContainer } from './container';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Initialize dependency injection container
    initializeContainer(prisma);
    logger.info('✅ Dependency container initialized');

    // Bootstrap: Create default admin if not exists
    await bootstrapAdmin();

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
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
