import * as cron from 'node-cron';
import { getContainer } from '@/container';
import logger from '@/lib/logger';

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  start() {
    this.scheduleTrashCleanup();
    logger.info('✓ Scheduler service started');
  }

  /**
   * Schedule trash cleanup to run daily at 2 AM
   * Deletes items that have been in trash for more than 30 days
   */
  private scheduleTrashCleanup() {
    // Run every day at 2:00 AM
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running scheduled trash cleanup...');
        const container = getContainer();
        const result = await container.trashService.cleanupOldTrashItems();
        logger.info(`✓ ${result.message}`);
      } catch (error) {
        logger.error('Error during scheduled trash cleanup:', error);
      }
    });

    this.jobs.set('trash-cleanup', job);
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`✓ Stopped scheduled job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all scheduled jobs
   */
  getStatus() {
    const status: Record<string, boolean> = {};
    this.jobs.forEach((job, name) => {
      status[name] = job.getStatus() === 'scheduled';
    });
    return status;
  }
}
