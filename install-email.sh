#!/bin/bash

echo "🚀 Installing Email Dependencies for VentriLinks..."

# Install the email packages
npm install @sendgrid/mail nodemailer @types/nodemailer

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "📄 Creating server/.env file..."
    cat > server/.env << 'EOF'
# Email Configuration (Choose one option)

# Option 1: SendGrid (Recommended)
# Get your API key from https://sendgrid.com/free/
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Option 2: Gmail SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Email settings
EMAIL_FROM=noreply@ventrilinks.com
FRONTEND_URL=http://localhost:5173

# Your existing Airtable config (don't change these)
AIRTABLE_API_KEY=patPnlxR05peVEnUc.e5a8cfe5a3f88676da4b3c124c99ed46026b4f869bb5b6a3f54cd45db17fd58f
BASE_ID=app768aQ07mCJoyu8
EOF
    echo "✅ Created server/.env file"
else
    echo "⚠️ server/.env already exists, skipping creation"
fi

echo ""
echo "🎉 Email dependencies installed successfully!"
echo ""
echo "📧 Next steps:"
echo "1. Add these fields to your Airtable 'Startup Submissions' table:"
echo "   - 'Password Reset Token' (Single line text)"
echo "   - 'Password Reset Expiry' (Date)"
echo ""
echo "2. Choose an email provider and update server/.env:"
echo "   - SendGrid (easiest): https://sendgrid.com/free/"
echo "   - Gmail SMTP: Use App Password with 2FA"
echo ""
echo "3. Restart your server: npm run dev"
echo ""
echo "✅ Ready to test password reset!"