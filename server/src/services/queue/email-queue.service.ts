import { emailQueue } from "@/lib/queue";

export class EmailQueueService {
  async sendVerificationEmail(email: string, token: string) {
    await emailQueue.add("verification-email", {
      type: "verification",
      to: email,
      token,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await emailQueue.add("password-reset-email", {
      type: "password-reset",
      to: email,
      token,
    });
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    await emailQueue.add("custom-email", {
      type: "custom",
      to,
      subject,
      html,
      text,
    });
  }
}
