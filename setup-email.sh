#!/bin/bash

echo "🚀 Setting up email functionality for VentriLinks..."

# Navigate to server directory
cd server

# Install email dependencies
echo "📦 Installing email packages..."
npm install @sendgrid/mail nodemailer
npm install --save-dev @types/nodemailer

echo "✅ Email packages installed successfully!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your email provider credentials"
else
    echo "⚠️  .env file already exists. Please ensure email variables are configured."
fi

echo ""
echo "🎉 Email setup complete!"
echo ""
echo "Next steps:"
echo "1. Choose an email provider (SendGrid recommended)"
echo "2. Update your .env file with the appropriate credentials"
echo "3. Restart your server"
echo ""
echo "📧 Email Provider Options:"
echo "• SendGrid (easiest): https://sendgrid.com/free/"
echo "• Gmail SMTP: Use App Passwords with 2FA enabled"
echo "• Outlook SMTP: Use your regular credentials"
echo ""