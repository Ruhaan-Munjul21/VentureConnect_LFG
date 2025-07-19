# 🚀 Airtable Integration Guide

Complete setup guide for automated startup pitch deck analysis with Airtable.

## 📋 Overview

This integration automatically processes startup pitch decks uploaded to Airtable and generates comprehensive AI analysis including:

- **Competitive positioning analysis**
- **Strengths & weaknesses assessment**
- **Market positioning evaluation**
- **Investment scoring (1-10 scale)**
- **Strategic recommendations**

## 🛠️ Quick Setup

### 1. Install Dependencies
```bash
pip install flask requests python-dotenv openai pymupdf
```

### 2. Configure Environment
Create/update your `.env` file:
```bash
OPENAI_API_KEY=your-openai-api-key
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-base-id
WEBHOOK_URL=https://your-server.com  # Optional for webhooks
```

### 3. Setup Airtable Fields
```bash
python setup_airtable_integration.py
```

This will:
- ✅ Test your Airtable connection
- 📋 Check for required fields
- 🔧 Show setup instructions for missing fields

### 4. Test the Integration
```bash
python airtable_analyzer.py --process
```

## 📊 Required Airtable Fields

Add these fields to your **Startup Submissions** table:

### 📎 Input Fields (Required)
- **`Non-Confidential Pitch Deck`** - Attachment field for PDF uploads
- **`Startup Name`** - Single line text for company name

### 🤖 AI Analysis Fields (Auto-populated)
- **`AI Analysis Status`** - Single select: `Pending`, `Processing`, `Complete`, `Error`
- **`Overall Score`** - Number (0-10)
- **`Technology Score`** - Number (0-10)  
- **`Market Score`** - Number (0-10)
- **`Team Score`** - Number (0-10)
- **`Technology Score Reasoning`** - Long text (detailed explanation for technology score)
- **`Market Score Reasoning`** - Long text (detailed explanation for market score)
- **`Team Score Reasoning`** - Long text (detailed explanation for team score)
- **`AI Analysis Summary`** - Long text (executive summary + key points)
- **`Investment Thesis`** - Long text (investment rationale)
- **`Competitive Differentiation`** - Long text (unique advantages)
- **`AI Detected Therapeutic Focus`** - Single line text (for biotech)
- **`Analysis Last Updated`** - Date and time
- **`Analysis Notes`** - Long text (status messages)

## 🔄 Processing Methods

### Method 1: Manual Processing (Recommended for Start)
```bash
# Process all pending submissions
python airtable_analyzer.py --process

# Show required field setup
python airtable_analyzer.py --setup
```

### Method 2: Webhook Automation (For Production)
```bash
# Start webhook server
python webhook_handler.py --port 5000

# Show webhook setup instructions  
python webhook_handler.py --setup
```

### Method 3: Scheduled Processing
Add to crontab for regular processing:
```bash
# Run every 30 minutes
*/30 * * * * cd /path/to/project && python airtable_analyzer.py --process
```

## 🔗 Webhook Setup (Automatic Processing)

### 1. Start Webhook Server
```bash
python webhook_handler.py
```

### 2. Configure Airtable Automation
1. Go to your Airtable base
2. Click **"Automations"** tab
3. Create new automation:
   - **Trigger**: When record matches conditions
   - **Table**: Startup Submissions  
   - **Condition**: `Non-Confidential Pitch Deck` is not empty
   - **Action**: Send webhook
   - **URL**: `https://your-server.com/webhook/airtable`
   - **Method**: POST
   - **Body**: Include all fields

### 3. Test Webhook
```bash
curl -X POST https://your-server.com/webhook/manual \
  -H "Content-Type: application/json" \
  -d '{"record_id": "recXXXXXXXXXXXXXX", "startup_name": "Test Company"}'
```

## 📈 Analysis Workflow

### 1. PDF Upload Detection
- User uploads pitch deck PDF to Airtable
- System detects new attachment
- Status set to "Pending"

### 2. Automatic Processing
- PDF downloaded and converted to slide images
- GPT-4o Vision analyzes each slide
- Comprehensive analysis generated
- Results saved back to Airtable

### 3. Analysis Output
- **Scores**: Technology, Market, Team (1-10)
- **Summary**: Executive summary with key insights
- **Detailed Analysis**: Strengths, weaknesses, positioning
- **Investment Thesis**: Value proposition and opportunity

## 🎯 Usage Examples

### Process Single Startup
```python
from airtable_analyzer import AirtableStartupAnalyzer

analyzer = AirtableStartupAnalyzer()
records = analyzer.get_pending_submissions()

if records:
    result = analyzer.analyze_startup_submission(records[0])
    print(f"Analysis result: {result['status']}")
```

### Check Processing Status
```bash
curl https://your-server.com/status
```

### Manual Trigger via API
```bash
curl -X POST https://your-server.com/webhook/manual \
  -H "Content-Type: application/json" \
  -d '{"record_id": "recXXXXXXXXXXXXXX"}'
```

## 📊 Sample Analysis Output

```json
{
  "overall_score": {
    "overall": 7.2,
    "technology": 8,
    "market": 7,
    "team": 7
  },
  "executive_summary": "Innovative biotech company with strong mRNA platform technology targeting metabolic diseases. Experienced team with proven drug development track record.",
  "strengths": [
    "Proprietary platform with competitive differentiation",
    "Experienced scientific leadership team",
    "Clear regulatory pathway for lead programs"
  ],
  "weaknesses": [
    "Early-stage clinical data",
    "Competitive market landscape", 
    "Significant funding requirements"
  ],
  "investment_thesis": "Strong scientific foundation with experienced team positioned to advance novel therapeutics through clinical development.",
  "competitive_differentiation": "Unique mRNA modulation approach with patent protection and validated target biology."
}
```

## 🔧 Troubleshooting

### Common Issues

**❌ "No PDF attachment found"**
- Ensure PDF is uploaded to `Non-Confidential Pitch Deck` field
- Check file is actually a PDF (not image or other format)

**❌ "OpenAI API error"**
- Verify `OPENAI_API_KEY` in .env file
- Check API key has sufficient credits
- Ensure model access (GPT-4o Vision)

**❌ "Airtable connection failed"**
- Verify `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`
- Check API key permissions
- Ensure table name matches exactly

**❌ "Analysis failed"**
- Check PDF file is readable/not corrupted
- Verify sufficient disk space for processing
- Check OpenAI rate limits

### Debug Mode
```bash
# Verbose logging
python airtable_analyzer.py --process --debug

# Check specific record
python airtable_analyzer.py --record-id recXXXXXXXXXXXXXX
```

### Log Files
Check logs in:
- `logs/analysis.log` - Processing logs
- `logs/webhook.log` - Webhook activity
- `logs/errors.log` - Error details

## 💰 Cost Estimation

### Per Analysis (15-slide deck):
- **GPT-4o Vision**: ~$0.30-0.50 per deck
- **GPT-4 Analysis**: ~$0.09 per analysis
- **Total**: ~$0.40-0.60 per startup

### Monthly Volume Examples:
- **10 startups/month**: ~$5-6
- **50 startups/month**: ~$25-30  
- **100 startups/month**: ~$50-60

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "webhook_handler.py", "--host", "0.0.0.0", "--port", "5000"]
```

### Environment Variables
```bash
OPENAI_API_KEY=sk-...
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
WEBHOOK_URL=https://your-domain.com
FLASK_ENV=production
```

### Load Balancing
- Use multiple webhook handler instances
- Queue processing with Redis/Celery for high volume
- Rate limiting for API protection

## 📞 Support & Monitoring

### Health Checks
```bash
curl https://your-server.com/health
```

### Monitoring Endpoints
- `/status` - Current processing queue
- `/health` - Service health
- `/metrics` - Processing statistics

### Alerting
Set up monitoring for:
- Analysis failure rates
- Processing queue length
- API error rates
- Response times

## 🔮 Advanced Features

### Custom Scoring Models
Modify scoring criteria in `startup_analyzer.py`:
```python
def _calculate_score(self, analysis_text: str) -> Dict:
    # Custom scoring logic
    return custom_scores
```

### Industry-Specific Analysis
Add specialized analysis for different sectors:
```python
def analyze_fintech_startup(self, pitch_data):
    # Fintech-specific analysis
    pass
```

### Integration Extensions
- **Slack notifications** for completed analyses
- **Email reports** to stakeholders  
- **Dashboard integration** for real-time metrics
- **CRM sync** for deal pipeline management

---

## ✅ Quick Start Checklist

- [ ] Install dependencies (`pip install -r requirements.txt`)
- [ ] Configure `.env` file with API keys
- [ ] Run setup script (`python setup_airtable_integration.py`)
- [ ] Add required fields to Airtable
- [ ] Test with sample submission (`python airtable_analyzer.py --process`)
- [ ] Set up webhook automation (optional)
- [ ] Upload test pitch deck to verify workflow

**🎉 You're ready to start analyzing startups automatically!**