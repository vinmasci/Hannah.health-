# WhatsApp Integration for Hannah.health

## Overview
Hannah.health WhatsApp integration enables users to log meals, exercise, and health metrics through simple text messages. No app opening required - just text like you're chatting with a friend.

## Core Concept
- **Natural language food logging** via WhatsApp messages
- **AI-powered nutrition analysis** using GPT-4o Mini
- **Automatic calorie and macro tracking**
- **Daily reminders and summaries**
- **Zero friction** - works within existing messaging habits

## Technical Architecture

### 1. Messaging Layer
- **WhatsApp Business API** (free tier: 1000 conversations/month)
- **Webhook endpoint** receives messages
- **Message queue** for reliability
- **Rate limiting** to prevent abuse

### 2. AI Processing
- **GPT-4o Mini** ($0.15/1M tokens)
- **Cost**: ~$0.30/user/month
- **Accuracy**: 95% for food recognition
- **Speed**: <500ms response time

### 3. Core Features

#### Food Logging
```
User: "had chicken schnitzel and chips from the pub"
Hannah: "✅ Logged lunch!
         Calories: 850
         Protein: 45g
         Carbs: 65g
         Fat: 38g
         Daily total: 1,420 cal"
```

#### Exercise Tracking
```
User: "walked 8500 steps"
Hannah: "🚶 Great job! That's about 340 calories burned
         Net calories today: 1,080"
```

#### Smart Reminders
```
Hannah (8am): "🌅 Morning! What's for breakfast?"
Hannah (12pm): "🍽️ Lunch time! What are you having?"
Hannah (6pm): "🍴 Dinner check-in! What's on the menu?"
Hannah (9pm): "📊 Daily summary: 1,850 cal, 92g protein ✅"
```

## Implementation Plan

### Phase 1: MVP (Week 1)
- [ ] Set up WhatsApp Business account
- [ ] Create webhook endpoint
- [ ] Integrate GPT-4o Mini
- [ ] Basic food parsing
- [ ] Simple calorie response

### Phase 2: Smart Features (Week 2)
- [ ] Scheduled reminders
- [ ] Daily/weekly summaries
- [ ] Exercise tracking
- [ ] Water intake logging
- [ ] Mood/energy tracking

### Phase 3: Advanced (Week 3)
- [ ] Photo analysis ("here's my lunch 📸")
- [ ] Barcode scanning via photo
- [ ] Recipe suggestions
- [ ] Shopping list generation
- [ ] Meal prep reminders

## User Onboarding Flow

### Day 1: Welcome
```
Hannah: "👋 G'day! I'm Hannah, your nutrition assistant. 
         Save my number and text me whenever you eat!
         
         Let's start with your goals:
         1️⃣ Weight loss
         2️⃣ Muscle gain
         3️⃣ Health tracking
         
         Reply with a number!"
```

### Day 2-7: Building Habits
- Gentle reminders at meal times
- Positive reinforcement
- Weekly progress summary

### Day 8+: Established Routine
- User-initiated logging
- Optional reminders
- Weekly insights

## Cost Structure

### Per 100 Active Users
- **WhatsApp API**: Free (under 1000 conversations)
- **GPT-4o Mini**: $30/month
- **Hosting (Vercel)**: Free
- **Database (Supabase)**: Free tier
- **Total**: $30/month

### At Scale (1000 users)
- **WhatsApp API**: $50/month
- **GPT-4o Mini**: $300/month
- **Hosting**: $20/month
- **Database**: $25/month
- **Total**: $395/month
- **Revenue** (at $4.99/user): $4,990/month
- **Profit**: $4,595/month

## Australian Market Optimizations

### Food Recognition
- Understands Australian portions ("schooner", "pot", "middy")
- Knows pub foods ("parma", "schnittie", "potato scallops")
- Recognizes brands (Woolies, Coles, Hungry Jack's)
- Metric measurements by default

### Meal Timing
- Breakfast: 7-9am AEDT
- Morning tea: 10-11am
- Lunch: 12-2pm
- Arvo tea: 3-4pm
- Dinner: 6-8pm

### Cultural Considerations
- Casual, friendly tone ("no worries", "too easy")
- Understands "smashed avo", "fairy bread", "tim tams"
- Weekend BBQ tracking
- Coffee culture (flat white, long black)

## Privacy & Security

### Data Handling
- End-to-end encryption via WhatsApp
- No message logs stored
- Nutrition data anonymized
- GDPR/Privacy Act compliant
- User can delete all data anytime

### Medical Disclaimer
- Not medical advice
- Estimates only
- Consult healthcare provider
- ED-safe mode available

## Success Metrics

### Week 1 Goals
- 10 beta users
- 90% message response rate
- <1 second response time
- 80% daily active users

### Month 1 Goals
- 100 users
- 4.5+ app store rating equivalent
- 70% weekly retention
- 5 meals logged per user per day

### Month 3 Goals
- 1000 users
- Break even on costs
- 60% monthly retention
- Partnership with nutritionist/GP

## Technical Stack

### Backend
```javascript
// Core dependencies
express: API server
twilio/whatsapp-api: Messaging
openai: GPT-4o Mini
supabase: Database
node-cron: Scheduled messages
```

### Deployment
```yaml
Platform: Vercel
Region: Sydney (ap-southeast-2)
Database: Supabase (Sydney)
CDN: Cloudflare
Monitoring: Vercel Analytics
```

## Quick Start Code

```javascript
// server.js
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());

// WhatsApp webhook
app.post('/webhook', async (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  
  // Parse with AI
  const nutrition = await analyzeFood(message);
  
  // Send response
  await sendWhatsApp(from, formatResponse(nutrition));
  
  res.sendStatus(200);
});

async function analyzeFood(text) {
  const response = await openai.createChatCompletion({
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: "Parse food into calories and macros. Be accurate for Australian foods."
    }, {
      role: "user",
      content: text
    }]
  });
  
  return JSON.parse(response.data.choices[0].message.content);
}
```

## Next Steps
1. Create WhatsApp Business account
2. Set up Twilio/Meta API
3. Deploy webhook endpoint
4. Test with 5 friends
5. Iterate based on feedback

## Related Documents
- `user_lifecycle_document.md` - Overall user journey
- `context.md` - Project context
- `ai-service.js` - AI integration code
- `database_documentation.md` - Data storage schema