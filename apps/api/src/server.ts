import {
  startMaintenanceScheduler,
  stopMaintenanceScheduler,
} from './api/maintenance/maintenance.scheduler';
import { createApp } from './app';
import { config } from './config/index';
import { startOutboxWorker, stopOutboxWorker } from './core/events';
import { logger } from './core/index';

const startServer = async (): Promise<void> => {
  try {
    const app = createApp();
    startOutboxWorker();
    startMaintenanceScheduler();

    const server = app.listen(config.server.port, () => {
      logger.info(`🚀 Server running on port ${config.server.port}`);
      logger.info(`📖 Environment: ${config.env}`);
      logger.info(`❤️  Health check: http://0.0.0.0:${config.server.port}/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      stopOutboxWorker();
      stopMaintenanceScheduler();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
      throw reason;
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
