import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const emailQueue = new Queue("email", {
  connection: {
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port) || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
