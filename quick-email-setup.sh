#!/bin/bash

echo "🚀 VentriLinks Email Setup"
echo "=========================="

# Install dependencies
echo "1. Installing email packages..."
cd server
npm install @sendgrid/mail nodemailer @types/nodemailer

echo "2. .env file created at server/.env"
echo "3. Next steps:"
echo "   → Update server/.env with your SendGrid API key"
echo "   → Add Airtable fields: 'Password Reset Token' and 'Password Reset Expiry'"
echo "   → Restart your server: npm run dev"
echo ""
echo "SendGrid setup: https://sendgrid.com/free/"
echo "Get API key: Settings → API Keys → Create API Key"
echo ""
echo "✅ Ready to configure your email provider!"