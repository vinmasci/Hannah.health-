# Twilio SMS Setup for Hannah Health 📱

## Overview
Hannah Health uses Twilio to enable SMS-based food logging. Users can text their meals to a dedicated phone number and receive AI-powered nutritional guidance from Hannah.

## Live Configuration

### Twilio Account Details
- **Account SID**: `[CONFIGURED IN .ENV]`
- **Phone Number**: `[CONFIGURED IN .ENV]`
- **Messaging Service SID**: `[CONFIGURED IN .ENV]`
- **Status**: Trial Account (Active)

### Vercel Webhook Deployment
- **Production URL**: `https://backend-d7dxznoom-vincents-projects-8ffc51f8.vercel.app`
- **Webhook Endpoint**: `/api/sms-webhook`
- **Full Webhook URL**: `https://backend-d7dxznoom-vincents-projects-8ffc51f8.vercel.app/api/sms-webhook`
- **Deployment Protection**: DISABLED (must remain public for Twilio access)

## Setup Instructions

### 1. Twilio Configuration

#### Create Account
1. Sign up at [twilio.com](https://twilio.com)
2. Get free trial credits ($15)
3. Purchase phone number (~$1/month)
4. Note: Trial accounts require phone number verification

#### Configure Messaging Service
1. Navigate to Messaging → Services
2. Click "My New Custom Service"
3. Go to Integration settings
4. Select "Send a webhook"
5. Configure all three URLs:
   - Request URL: `[your-vercel-url]/api/sms-webhook`
   - Fallback URL: `[your-vercel-url]/api/sms-webhook`
   - Delivery Status Callback: `[your-vercel-url]/api/sms-webhook`

#### Verify Phone Numbers (Trial Only)
For trial accounts, verify recipient numbers:
1. Go to Phone Numbers → Verified Caller IDs
2. Add recipient phone number
3. Complete verification via SMS/call

### 2. Vercel Deployment

#### Environment Variables
```bash
# Required in Vercel
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
OPENAI_API_KEY=your_openai_key_here
```

#### Add Variables to Vercel
```bash
vercel env add TWILIO_AUTH_TOKEN production
vercel env add OPENAI_API_KEY production
```

#### Webhook Function Code
Location: `backend/api/sms-webhook.js`
```javascript
const twilio = require('twilio');
const OpenAI = require('openai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { From, Body } = req.body;
  
  // Process with OpenAI
  // Send reply via Twilio
  // Return TwiML response
  
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');
};
```

#### Deploy to Vercel
```bash
cd backend
vercel --prod --yes
```

### 3. CRITICAL: Disable Vercel Authentication

**This is the most common issue!**

1. Go to Vercel Dashboard → Project Settings
2. Find "Deployment Protection"
3. **Toggle OFF** Vercel Authentication
4. Save changes
5. Redeploy: `vercel --prod --yes`

Without this, Twilio cannot reach your webhook!

## Testing

### Test Webhook Directly
```bash
curl -X POST https://your-vercel-url/api/sms-webhook \
  -d "From=%2B61423691622&Body=Test" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Test SMS Sending
```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json \
  --data-urlencode "Body=Test message" \
  --data-urlencode "From=+15513685291" \
  --data-urlencode "To=+61423691622" \
  -u YOUR_SID:YOUR_AUTH_TOKEN
```

### Test Full Flow
1. Text the Twilio number: +1 (551) 368-5291
2. Send: "Hi"
3. Should receive Hannah's welcome message

## Troubleshooting

### Common Issues

#### 1. No Response to Texts
- **Check**: Vercel Authentication is OFF
- **Check**: Webhook URLs are correct in Twilio
- **Check**: Phone number is verified (trial accounts)
- **Check**: Environment variables in Vercel

#### 2. 401 Authentication Error
- Vercel Protection is still ON
- Solution: Disable in Vercel settings

#### 3. 500 Server Error
- Missing environment variables
- Check: `vercel env ls`
- Add missing vars: `vercel env add VAR_NAME production`

#### 4. International Numbers
- Format: Include country code (+61 for Australia)
- Trial accounts may have geographic restrictions

### Debug Commands

Check Vercel logs:
```bash
vercel logs https://your-deployment-url
```

Check webhook accessibility:
```bash
curl -I https://your-deployment-url/api/sms-webhook
# Should return 405 (Method Not Allowed) for GET
# NOT 401 (Authentication Required)
```

## Cost Analysis

### Twilio Costs
- Phone Number: $1/month
- SMS (US): $0.0079 per message
- SMS (Australia): ~$0.05 per message
- Trial Account: $15 free credit

### Monthly Estimates (1000 users)
- Phone number: $1
- US users (10 msgs/day): $2,370
- AU users (10 msgs/day): $15,000
- **Use US numbers when possible!**

## Production Considerations

### Security
1. Never commit auth tokens to git
2. Use environment variables for all secrets
3. Implement rate limiting
4. Add user authentication/verification

### Scaling
1. Upgrade from trial account
2. Use Messaging Service for multiple numbers
3. Implement proper database (not in-memory)
4. Add message queuing for high volume

### Features to Add
- MMS photo support
- WhatsApp Business API integration
- Voice call support
- Scheduled reminders
- Multi-language support

## Related Documentation
- [SMS-HANNAH.md](./SMS-HANNAH.md) - Full feature specification
- [context.md](./context.md) - Project overview
- [development-diary.md](./development-diary.md) - Implementation notes

## Quick Reference

**Twilio Number**: +1 (551) 368-5291  
**Webhook**: `https://backend-jjq4pheg9-vincents-projects-8ffc51f8.vercel.app/api/sms-webhook`  
**Console**: https://console.twilio.com  
**Vercel Project**: https://vercel.com/vincents-projects-8ffc51f8/backend

---

*Last Updated: January 27, 2025*
*Status: FULLY WORKING - SMS Gateway connected to main AI backend*

## MAJOR UPDATE: SMS Gateway Integration

### What Changed
- Moved from Vercel to local SMS gateway
- Connected to same AI backend as iOS app
- Full OpenAI + Brave Search integration working
- Intelligent responses for complex questions
- Added theatrical personality for entertaining, dramatic responses

### Current Working Setup
1. **Main AI Backend** (port 3001) - Shared with iOS app
2. **SMS Gateway** (port 3000) - Bridges Twilio to backend with theatrical personality
3. **Localtunnel** - Exposes gateway to internet (URL changes on restart!)
4. **Result**: Same AI intelligence for both SMS and app, with theatrical flair!

**IMPORTANT**: Localtunnel URL changes every restart. Must update Twilio webhook each time!

### Example Working Queries
- "What muesli bars at Coles are 90 calories?" ✅
- "How many calories in a Big Mac?" ✅
- "What healthy snacks are under 100 calories?" ✅

All queries now use Brave Search for real data and OpenAI for intelligent responses!

### Theatrical Personality Feature
Hannah now responds with dramatic theatrical style:
- **Dramatic flair**: "Oh my!", "How marvelous!", "Absolutely divine!", "How splendid!"
- **Witty and sophisticated responses** with theatrical charm
- **Concise SMS-optimized** - Responses kept under 320 characters (2 SMS messages)
- **Error messages with style**: "Oh dear! I'm having a dramatic moment. Please resend your message!"

Example responses:
- "Oh my! A Big Mac has 563 calories. Perhaps consider a grilled chicken wrap, darling!"
- "How marvelous! Bananas are 89 calories of pure potassium perfection!"

### Recent Fixes (January 27, 2025)

**Fixed**: Personality prompt was being sent as the message, causing search failures
- **Problem**: SMS gateway was sending entire theatrical prompt to backend
- **Error**: Brave Search API returned 422 (query too long - max 50 words)
- **Solution**: Now sends actual user message with personality in `context.systemPrompt`

**Current Message Flow**:
```javascript
// SMS Gateway sends:
{
  message: "I ate a banana",  // Actual user message only
  context: {
    systemPrompt: "theatrical personality instructions...",  // Personality separate
    source: "sms"
  }
}
```

### Running the System

1. **Start Main Backend** (if not running):
   ```bash
   cd backend
   node server.js  # Runs on port 3001
   ```

2. **Start SMS Gateway**:
   ```bash
   cd backend
   SMS_PORT=3000 node sms-gateway.js
   ```

3. **Start Localtunnel**:
   ```bash
   npx localtunnel --port 3000
   # Note the URL it gives you (e.g., https://fifty-facts-invent.loca.lt)
   ```

4. **Update Twilio Webhook**:
   - Go to [Twilio Console](https://console.twilio.com)
   - Messaging → Services → Your Service → Integration
   - Update all webhook URLs to: `[your-localtunnel-url]/sms-webhook`
   - Save changes