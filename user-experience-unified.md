# Hannah.health Unified User Experience

## Vision
A seamless health tracking ecosystem where users can interact via WhatsApp (primary), web app (planning), and AI chat (guidance) - all synchronized and working together.

## The Three Pillars

### 1. WhatsApp Bot (Daily Logging)
**Purpose**: Quick, frictionless food and exercise logging
**When**: Throughout the day, real-time
**User**: Anyone with a phone

### 2. Web Meal Planner (Weekly Planning)  
**Purpose**: Visual meal planning, recipe discovery, shopping lists
**When**: Sunday planning, evening review
**User**: Desktop/tablet users who like to plan ahead

### 3. AI Chat Assistant (Guidance & Support)
**Purpose**: Nutrition advice, motivation, recipe suggestions
**When**: When users need help or have questions
**User**: Users wanting deeper insights

## Unified User Journey

### Day 0: Discovery
1. User finds Hannah.health via social media
2. Lands on beautiful landing page
3. Chooses entry point:
   - "Start texting Hannah" → WhatsApp
   - "Plan your meals" → Web app
   - "Get nutrition help" → AI chat

### Day 1-7: Onboarding

#### WhatsApp First User
```
Morning:
Hannah (WhatsApp): "G'day! I'm Hannah 👋 Text me what you eat and I'll track everything for you. What did you have for breakfast?"
User: "2 eggs on toast"
Hannah: "✅ Logged! 320 cal, 18g protein. I'll check in at lunch!"

Evening:
Hannah: "Great first day! You had 1,850 calories. Want to see your full breakdown? Visit hannah.health/dashboard"
→ User clicks link, sees beautiful dashboard
→ Discovers meal planner
```

#### Web First User
```
1. Creates account on hannah.health
2. Plans week's meals using drag-drop interface
3. Sees prompt: "Want reminders to log your meals? Connect WhatsApp!"
4. Connects WhatsApp
5. Gets reminder: "Hey! I see you planned chicken stir-fry for dinner. Did you have it?"
```

### Week 2: Habit Formation

#### Morning Routine
- 7am: WhatsApp reminder (if enabled)
- User logs breakfast via text
- Data syncs to web dashboard

#### Lunch Time
- 12pm: "Lunch check! What are you having?"
- User sends photo of meal
- AI recognizes food, logs automatically

#### Evening Review
- User opens web app
- Sees daily summary
- Plans tomorrow's meals
- Generates shopping list

### Month 2: Power User

#### Typical Day
```
6am: "morning run 5k"
→ Hannah: "Nice! Burned ~400 cal 🏃"

8am: "protein shake and banana"
→ Hannah: "Logged! 290 cal, 25g protein"

12pm: [Sends photo of lunch]
→ Hannah: "Looks like chicken caesar salad! ~520 cal"

3pm: "feeling snacky"
→ Hannah: "You have 680 cal left today. How about some Greek yogurt (150 cal)?"

6pm: Follows pre-planned dinner from web app

9pm: Reviews weekly trends on dashboard
```

## Feature Integration Map

### Data Flows Everywhere
```
WhatsApp Input → Database → Web Dashboard
Web Meal Plan → WhatsApp Reminders → Logging
AI Suggestions → Meal Planner → Shopping List
```

### Synchronized Features

| Feature | WhatsApp | Web App | AI Chat |
|---------|----------|---------|---------|
| Food Logging | ✅ Primary | ✅ Manual | ✅ Guided |
| Meal Planning | ❌ | ✅ Primary | ✅ Suggests |
| Exercise | ✅ Primary | ✅ View | ✅ Plans |
| Recipes | 📷 Photo | ✅ Browse | ✅ Create |
| Shopping List | 📤 Sends | ✅ Generate | ✅ Optimize |
| Progress | 📊 Summary | ✅ Full | ✅ Insights |
| Reminders | ✅ Receives | ✅ Sets | ✅ Motivates |

## Platform-Specific Strengths

### WhatsApp Excels At:
- Quick logging ("had a banana")
- Photo recognition
- Reminders and nudges
- Daily summaries
- Exercise tracking
- Water logging

### Web App Excels At:
- Weekly meal planning
- Recipe browsing
- Detailed nutrition info
- Shopping list generation
- Progress charts
- Food favorites management

### AI Chat Excels At:
- Personalized advice
- Recipe creation
- Answering "why" questions
- Motivation and support
- Meal plan adjustments
- Medical condition guidance

## Smart Handoffs

### WhatsApp → Web
```
Hannah: "You've logged 50 meals! 🎉 
         Check your progress at hannah.health/progress
         You're averaging 85g protein daily!"
```

### Web → WhatsApp
```
Web notification: "Meal plan created for next week!"
WhatsApp: "I see you planned Monday's meals! 
          I'll remind you to prep Sunday night 👨‍🍳"
```

### AI Chat → WhatsApp
```
AI: "Based on our chat, I've created a high-protein meal plan.
     I'll send you daily reminders via WhatsApp!"
```

## Monetization Across Platforms

### Free Tier (All Platforms)
- 50 WhatsApp logs/month
- Basic web meal planner
- 10 AI chat messages/month

### Premium ($4.99/month)
- Unlimited WhatsApp logging
- Advanced meal planning
- Unlimited AI chat
- Shopping list exports
- Macro tracking
- Progress analytics

### Family Plan ($9.99/month)
- 5 WhatsApp numbers
- Shared meal plans
- Family shopping lists
- Individual tracking

## Success Metrics

### Engagement
- **Daily Active**: 70% (via any platform)
- **Platform Mix**: 60% WhatsApp, 30% Web, 10% AI
- **Cross-platform**: 40% use 2+ platforms

### Retention
- **Day 1**: 80% log at least one meal
- **Day 7**: 60% still active
- **Day 30**: 40% converted to habit
- **Day 90**: 30% paying customers

### User Satisfaction
- **WhatsApp**: "So easy!" (NPS: 70)
- **Web**: "Love planning!" (NPS: 65)
- **Unified**: "Everything syncs!" (NPS: 75)

## Technical Architecture

### Shared Backend
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  WhatsApp   │     │   Web App   │     │   AI Chat   │
│   Webhook   │     │     API     │     │     API     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Supabase   │
                    │   Database  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
     │    Users    │ │  Meals  │ │   Recipes   │
     └─────────────┘ └─────────┘ └─────────────┘
```

### Data Consistency
- Single source of truth (Supabase)
- Real-time sync via websockets
- Offline-first web app
- Message queue for WhatsApp

## Launch Strategy

### Week 1: WhatsApp MVP
- Basic food logging
- Simple responses
- 10 beta testers

### Week 2: Web Dashboard
- View WhatsApp logs
- Basic meal planner
- Connect accounts

### Week 3: Full Integration
- Sync all platforms
- AI chat integration
- Shopping lists

### Week 4: Polish
- Onboarding flow
- Premium features
- Marketing launch

## The Magic Moment

When a user:
1. Plans Sunday's meal prep on the web
2. Gets reminded via WhatsApp to prep
3. Logs meals throughout the week via text
4. Asks AI chat why they're tired
5. AI suggests more iron-rich foods
6. Web app adds spinach to next week's plan
7. WhatsApp sends shopping list with spinach
8. User feels supported and understood

**That's when Hannah.health becomes indispensable.**

## Related Documents
- `whatsapp-integration.md` - WhatsApp technical details
- `user_lifecycle_document.md` - Original user journey
- `ai-chat-simple.html` - AI chat interface
- `index.html` - Web meal planner
- `database_documentation.md` - Data structure