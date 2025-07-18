import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private provider: 'sendgrid' | 'smtp' | 'console';
  private transporter?: nodemailer.Transporter;

  constructor() {
    // Determine which email provider to use based on environment variables
    if (process.env.SENDGRID_API_KEY) {
      this.provider = 'sendgrid';
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.provider = 'smtp';
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.provider = 'console';
      console.log('⚠️ No email provider configured. Emails will be logged to console.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = process.env.EMAIL_FROM || 'noreply@ventrilinks.com';

    try {
      switch (this.provider) {
        case 'sendgrid':
          await sgMail.send({
            to: options.to,
            from: from,
            subject: options.subject,
            text: options.text || this.htmlToText(options.html),
            html: options.html,
          });
          console.log(`✅ Email sent via SendGrid to ${options.to}`);
          return true;

        case 'smtp':
          if (!this.transporter) {
            throw new Error('SMTP transporter not configured');
          }
          await this.transporter.sendMail({
            from: from,
            to: options.to,
            subject: options.subject,
            text: options.text || this.htmlToText(options.html),
            html: options.html,
          });
          console.log(`✅ Email sent via SMTP to ${options.to}`);
          return true;

        case 'console':
        default:
          console.log('=== EMAIL DEBUG (Console Mode) ===');
          console.log('To:', options.to);
          console.log('From:', from);
          console.log('Subject:', options.subject);
          console.log('HTML Content:');
          console.log(options.html);
          console.log('================================');
          return true;
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 100px;
              height: 100px;
              margin: 0 auto 20px;
              display: block;
            }
            h1 {
              color: #2563eb;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 10px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VentriLinks</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <p>Hi there,</p>
            
            <p>We received a request to reset your password for your VentriLinks account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${resetLink}
            </p>
            
            <div class="footer">
              <p>This email was sent to ${email} because a password reset was requested for this account.</p>
              <p>&copy; ${new Date().getFullYear()} VentriLinks. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your VentriLinks Password',
      html: html,
    });
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();