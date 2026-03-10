import { Worker, Job } from "bullmq";
import {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import logger from "@/lib/logger";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

interface EmailJobData {
  type: "verification" | "password-reset" | "custom";
  to: string;
  token?: string;
  subject?: string;
  html?: string;
  text?: string;
}

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    const { type, to, token, subject, html, text } = job.data;

    try {
      switch (type) {
        case "verification":
          if (!token) throw new Error("Token required for verification email");
          await sendVerificationEmail(to, token);
          break;

        case "password-reset":
          if (!token)
            throw new Error("Token required for password reset email");
          await sendPasswordResetEmail(to, token);
          break;

        case "custom":
          if (!subject || !html)
            throw new Error("Subject and HTML required for custom email");
          await sendEmail({ to, subject, html, text });
          break;

        default:
          throw new Error(`Unknown email type: ${type}`);
      }

      logger.info(`Email job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: new URL(redisUrl).hostname,
      port: parseInt(new URL(redisUrl).port) || 6379,
    },
    concurrency: 5,
  },
);

emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err);
});
