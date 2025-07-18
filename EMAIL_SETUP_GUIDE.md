# Email Setup Guide for VentriLinks Password Reset

## Quick Setup (5 minutes)

### Option 1: SendGrid (Recommended - Easiest)

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com/free/
   - Create a free account (100 emails/day free)
   - Verify your email address

2. **Get your API Key**
   - Login to SendGrid dashboard
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Give it a name like "VentriLinks Password Reset"
   - Select "Mail Send" permission
   - Copy the API key (starts with `SG.`)

3. **Update your .env file**
   ```bash
   # In your server/.env file, add:
   SENDGRID_API_KEY=SG.your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   ```

4. **Install and run**
   ```bash
   ./setup-email.sh
   # Then restart your server
   ```

### Option 2: Gmail SMTP

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication

2. **Create App Password**
   - Go to Google Account > Security > 2-Step Verification
   - Click "App passwords"
   - Select "Mail" and "Other"
   - Name it "VentriLinks"
   - Copy the 16-character password

3. **Update your .env file**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:5173
   ```

### Option 3: Outlook/Hotmail SMTP

1. **Update your .env file**
   ```bash
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password
   EMAIL_FROM=your-email@outlook.com
   FRONTEND_URL=http://localhost:5173
   ```

## Installation Steps

1. **Run the setup script**
   ```bash
   ./setup-email.sh
   ```

2. **Or install manually**
   ```bash
   cd server
   npm install @sendgrid/mail nodemailer @types/nodemailer
   ```

3. **Add Airtable Fields** (Important!)
   - Go to your Airtable "Startup Submissions" table
   - Add these new fields:
     - `Password Reset Token` (Single line text)
     - `Password Reset Expiry` (Date)

4. **Restart your server**
   ```bash
   cd server
   npm run dev
   ```

## Testing the Setup

1. **Go to your login page**: `http://localhost:5173/client/login`
2. **Click "Forgot password? Click here to reset it"**
3. **Enter an email address that exists in your Airtable**
4. **Check your server console for email logs**

### Console Mode (Default)
If no email provider is configured, emails will be logged to your server console:
```
=== EMAIL DEBUG (Console Mode) ===
To: user@example.com
From: noreply@ventrilinks.com
Subject: Reset Your VentriLinks Password
HTML Content: [full email HTML]
================================
```

Look for the reset link in the HTML content and copy it to your browser.

## Troubleshooting

### Common Issues:

1. **"No email provider configured"**
   - Check your .env file has the correct email variables
   - Restart your server after updating .env

2. **SendGrid "Unauthorized" error**
   - Verify your API key is correct
   - Check the API key has "Mail Send" permissions

3. **Gmail "Authentication failed"**
   - Make sure 2FA is enabled
   - Use App Password, not your regular password
   - Check username/password are correct

4. **Emails not arriving**
   - Check spam folder
   - Verify email address exists in Airtable
   - Check server logs for error messages

### Email Template Customization

The email template is defined in `server/services/email.ts`. You can customize:
- Company branding
- Email styling
- Button colors
- Footer information

## Production Considerations

1. **Domain Authentication** (SendGrid)
   - Set up domain authentication for better delivery
   - Use your own domain instead of generic sendgrid.net

2. **Email Monitoring**
   - Monitor email delivery rates
   - Set up webhooks for bounce/spam reports

3. **Rate Limiting**
   - Implement rate limiting for password reset requests
   - Prevent abuse of the reset system

## Support

If you need help with email setup:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test with a simple email first
4. Check your email provider's documentation

## Cost Information

- **SendGrid**: 100 emails/day free, then $14.95/month for 40,000 emails
- **Gmail SMTP**: Free with personal account, limited sending
- **AWS SES**: $0.10 per 1,000 emails (very cheap for high volume)