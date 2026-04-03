import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendAdminNotification(subject: string, htmlContent: string) {
    try {
      await this.transporter.sendMail({
        from: `"Eco Tech Hub Hub" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: subject,
        html: htmlContent,
      });
      this.logger.log(`Notification sent: ${subject}`);
    } catch (error) {
      this.logger.error('Failed to send email notification', error);
    }
  }
}