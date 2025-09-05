# Hannah SMS - Text Your AI Nutritionist 📱

> **"Just text Hannah like you'd text a friend"**

## Overview
Users can text a regular phone number to log meals, get nutrition advice, and track their health journey - no app required! Hannah responds naturally via SMS, making healthy eating as simple as sending a text.

## The Magic Number: 1-415-HANNAH-1 
*(or whatever number you choose)*

## Core Experience

### First Contact - Natural Onboarding
```
User: "Hi"

Hannah: "Hey! I'm Hannah, your AI nutritionist 🍎 I help track what you eat and 
give personalized advice. Just text me your meals and I'll handle the rest! 
What did you have for breakfast today?"

User: "Coffee with oat milk and a banana"

Hannah: "Great start! Logged ~150 cal (coffee: 50, banana: 100). 
That banana gives you quick energy and potassium 💪 
What's your main health goal? (lose weight, gain muscle, or just eat better?)"

User: "Lose weight but I love McDonald's lol"

Hannah: "No judgment here! I'll help you lose weight while keeping McDonald's 
in your life. I'll learn your favorites and suggest swaps that actually work.
BTW, your daily calorie target would be ~1,800. Sound good?"
```

## Technical Architecture

### 1. Twilio Setup
```javascript
// Twilio Console Configuration
Phone Number: +1-415-HANNAH-1
SMS Webhook: https://your-supabase.co/functions/v1/hannah-sms
Method: POST
```

### 2. Supabase Edge Function with OpenAI
```javascript
// supabase/functions/hannah-sms/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Twilio } from 'twilio'
import OpenAI from 'openai'

const twilioClient = new Twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
)

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})

serve(async (req) => {
  const { From, Body, NumMedia, MediaUrl0 } = await req.json()
  
  // Get or create user context
  const user = await getUserContext(From)
  
  // If photo was sent (MMS)
  let photoAnalysis = null
  if (NumMedia > 0) {
    photoAnalysis = await analyzePhoto(MediaUrl0)
  }
  
  // Smart context-aware processing
  const hannahResponse = await processMessage(user, Body, photoAnalysis)
  
  // Send reply
  await twilioClient.messages.create({
    body: hannahResponse.text,
    to: From,
    from: Deno.env.get('TWILIO_PHONE_NUMBER')
  })
  
  // Update user context for next interaction
  await updateUserContext(From, hannahResponse.context)
  
  return new Response('OK', { status: 200 })
})

async function processMessage(user, message, photoData) {
  // Check if we're waiting for clarification
  if (user.context?.waitingFor) {
    return handleClarification(user, message)
  }
  
  // Parse message for food items
  const foodMentions = await detectFoodMentions(message)
  
  if (foodMentions.length > 0) {
    // Check if we need more details
    const unclear = foodMentions.filter(f => f.needsClarification)
    
    if (unclear.length > 0) {
      // Ask for specifics
      const question = generateClarificationQuestion(unclear[0])
      
      // Save context for next message
      await updateUserContext(user.phone, {
        waitingFor: 'food_clarification',
        pendingFood: foodMentions,
        originalMessage: message
      })
      
      return {
        text: question,
        context: { waitingFor: 'clarification' }
      }
    }
    
    // We have enough detail, log it
    const nutrition = await lookupNutrition(foodMentions)
    await logToDatabase(user.id, foodMentions, nutrition)
    
    const response = generateLoggingResponse(foodMentions, nutrition, user)
    return { text: response, context: { lastLogged: foodMentions } }
  }
  
  // Not food-related, handle other conversation
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { 
        role: "system", 
        content: `You are Hannah, a friendly AI nutritionist. Keep responses under 160 chars.
                  User context: ${JSON.stringify(user)}`
      },
      { role: "user", content: message }
    ],
    max_tokens: 50
  })
  
  return {
    text: completion.choices[0].message.content,
    context: { lastMessage: message }
  }
}

// Smart clarification questions
function generateClarificationQuestion(unclearFood) {
  const questions = {
    'coffee': "What kind of coffee? (black, latte, cappuccino, or describe additions)",
    'salad': "What type? Any protein/toppings? What dressing?",
    'sandwich': "What kind of sandwich? What bread?",
    'burger': "From where? Or describe (beef/turkey/veggie, cheese?, toppings?)",
    'pizza': "How many slices? What size? Toppings?",
    'pasta': "What sauce? Portion size? Any protein?",
    'chicken': "How prepared? (grilled, fried, baked) What size?",
    'rice': "White or brown? How much? (cup, bowl, side portion)"
  }
  
  // Find best matching question
  for (const [key, question] of Object.entries(questions)) {
    if (unclearFood.item.toLowerCase().includes(key)) {
      return question
    }
  }
  
  return `Can you be more specific about the ${unclearFood.item}? Size/brand/preparation?`
}

// Detect foods that need clarification
async function detectFoodMentions(message) {
  // Use GPT to extract food mentions and flag ambiguous ones
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `Extract food items from the message. For each item, determine if it needs clarification.
                  Return JSON: [{ item: string, needsClarification: boolean, reason?: string }]`
      },
      { role: "user", content: message }
    ],
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(completion.choices[0].message.content).foods
}

// Handle clarification responses
async function handleClarification(user, message) {
  const pending = user.context.pendingFood
  
  // Apply clarification to pending food
  const clarified = applyClarificationToFood(pending, message)
  
  // Check if we need more clarifications
  const stillUnclear = clarified.filter(f => f.needsClarification)
  
  if (stillUnclear.length > 0) {
    // Ask next clarification
    const question = generateClarificationQuestion(stillUnclear[0])
    
    await updateUserContext(user.phone, {
      waitingFor: 'food_clarification',
      pendingFood: clarified
    })
    
    return { text: question }
  }
  
  // All clear! Log the food
  const nutrition = await lookupNutrition(clarified)
  await logToDatabase(user.id, clarified, nutrition)
  
  const response = generateLoggingResponse(clarified, nutrition, user)
  
  // Clear waiting state
  await updateUserContext(user.phone, {
    waitingFor: null,
    pendingFood: null
  })
  
  return { text: response }
}
```

### 3. Brave Search Integration for Nutrition Data
```javascript
async function lookupNutrition(foods) {
  const results = []
  
  for (const food of foods) {
    // Search Brave for nutrition info
    const searchQuery = `${food} calories nutrition facts`
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          'X-Subscription-Token': Deno.env.get('BRAVE_API_KEY')
        }
      }
    )
    
    const data = await braveResponse.json()
    
    // Smart confidence scoring based on source
    let confidence = 0.7  // Default
    let calories = null
    
    // Check if official source (MyFitnessPal, USDA, etc)
    const firstResult = data.web?.results?.[0]
    if (firstResult?.url.includes('myfitnesspal.com')) confidence = 0.9
    if (firstResult?.url.includes('usda.gov')) confidence = 0.95
    if (firstResult?.url.includes('mcdonalds.com')) confidence = 0.95
    
    // Extract calories from snippet
    const calorieMatch = firstResult?.snippet.match(/(\d+)\s*calories/i)
    if (calorieMatch) {
      calories = parseInt(calorieMatch[1])
    }
    
    results.push({
      food,
      calories: calories || estimateCalories(food),  // Fallback estimation
      confidence,
      source: firstResult?.url
    })
  }
  
  return results
}

// Fallback calorie estimation
function estimateCalories(food) {
  const estimates = {
    'coffee': 5,
    'banana': 100,
    'apple': 95,
    'burger': 550,
    'pizza': 285,  // per slice
    'salad': 150,
    // Add more common foods
  }
  
  // Simple keyword matching
  for (const [key, cal] of Object.entries(estimates)) {
    if (food.toLowerCase().includes(key)) return cal
  }
  
  return 200  // Generic fallback
}
```

## User States & Context Management

### Database Schema (Supabase)
```sql
-- SMS Users table
CREATE TABLE sms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  onboarded BOOLEAN DEFAULT FALSE,
  
  -- Profile
  name TEXT,
  age INTEGER,
  weight_kg DECIMAL,
  height_cm INTEGER,
  activity_level TEXT, -- 'sedentary', 'moderate', 'active'
  goal TEXT, -- 'lose', 'maintain', 'gain'
  
  -- Calculated
  bmr INTEGER,
  daily_calories INTEGER,
  
  -- Preferences learned over time
  favorite_foods JSONB DEFAULT '[]',
  meal_patterns JSONB DEFAULT '{}',
  mcdonalds_usual TEXT,
  
  -- Current state
  last_message_at TIMESTAMP,
  conversation_state TEXT, -- 'onboarding', 'active', 'inactive'
  context JSONB DEFAULT '{}'
);

-- Food logs from SMS
CREATE TABLE sms_food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES sms_users(id),
  logged_at TIMESTAMP DEFAULT NOW(),
  
  message_text TEXT,
  foods JSONB,
  total_calories INTEGER,
  confidence DECIMAL,
  
  photo_url TEXT,
  photo_analysis JSONB
);

-- Daily summaries
CREATE TABLE sms_daily_totals (
  user_id UUID REFERENCES sms_users(id),
  date DATE,
  total_calories INTEGER DEFAULT 0,
  total_protein INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  PRIMARY KEY (user_id, date)
);
```

## Smart Clarification System

### Ambiguous Food Detection
The AI recognizes when foods need more detail:

**Needs Clarification:**
- "coffee" → What kind? Additions?
- "salad" → Type? Dressing? Toppings?
- "sandwich" → What kind? What's in it?
- "burger" → From where? Homemade?
- "pasta" → Sauce? Portion size?

**Clear Enough:**
- "black coffee" ✓
- "McDonald's Big Mac" ✓
- "grilled chicken breast" ✓
- "2 slices pepperoni pizza" ✓
- "Greek yogurt with berries" ✓

### Multi-Turn Clarification Example
```
User: "Had eggs for breakfast"

Hannah: "How many eggs and how were they prepared? (scrambled, fried, boiled, etc)"

User: "2 scrambled"

Hannah: "Did you use oil/butter? Any additions like cheese or milk?"

User: "Butter and a little cheese"

Hannah: "Got it! 2 scrambled eggs with butter & cheese ~220 cal logged. 
Good protein start - 16g! Total: 220/1,800"
```

### Meal Context Detection
```
User: "Chicken and rice"

Hannah: "Sounds good! Is this lunch or dinner? How was the chicken prepared 
and roughly how much rice?"

User: "Dinner, grilled chicken breast, about a cup of rice"

Hannah: "Dinner logged! Grilled chicken (165 cal) + 1 cup white rice (205 cal) = 370 cal. 
Excellent lean protein! Daily total: 1,420/1,800"
```

### Portion Size Clarification
```
User: "Had some nuts"

Hannah: "What kind and roughly how much? (handful, 1/4 cup, specific count?)"

User: "Almonds like a handful"

Hannah: "Handful of almonds ~160 cal (about 23 almonds). Great healthy fats! 
Tip: Pre-portion into 100-cal packs for easy tracking"
```

## Conversation Patterns

### Natural Food Logging with Smart Follow-ups
```
User: "I had coffee and a banana for breakfast"

Hannah: "Got it! What kind of coffee? (black, latte, cappuccino, or with milk/sugar?)"

User: "Latte with oat milk"

Hannah: "Perfect! Breakfast logged: Oat milk latte (120 cal) + banana (105 cal) = 225 cal total. 
Great balanced start! 🌟"
```

### Getting Specific When Needed
```
User: "Just had a salad"

Hannah: "What kind of salad? Any protein (chicken, eggs)? 
What dressing? Reply with details or 'basic' for garden salad"

User: "Chicken caesar"

Hannah: "Restaurant or homemade? Size matters for accuracy"

User: "Restaurant, pretty big"

Hannah: "Logged! Restaurant chicken Caesar ~650 cal (85% conf). 
Daily total: 875/1,800. Tip: ask for dressing on side next time to control calories"
```

### McDonald's Specificity
```
User: "McDonalds for lunch"

Hannah: "What did you get? Reply with items or send a photo of receipt"

User: "Burger and fries"  

Hannah: "Which burger? Big Mac, Quarter Pounder, McDouble, or cheeseburger? 
And what size fries?"

User: "Big mac, medium fries"

Hannah: "Big Mac (550) + medium fries (340) = 890 cal logged! 
You're at 1,115/1,800. Solid protein at 25g 💪"
```

### Photo Analysis (MMS)
```
User: [sends photo of pasta dish]

Hannah: "Looks like pasta with marinara ~400 cal (85% confident). 
Is this a restaurant portion? Reply 'yes' or 'no' for better accuracy"

User: "yes"

Hannah: "Updated to ~650 cal for restaurant size. Daily total: 1,450/1,800 ✅"
```

### Smart Pattern Recognition
```
User: "usual coffee"

Hannah: "Your oat milk latte logged! 120 cal. 
Starting the day consistently, love it! ☕"
```

### Contextual Advice
```
User: "feeling hungry"

Hannah: "You're at 1,100 cal with 700 left. Try protein + fiber: 
Greek yogurt with berries (150 cal) or apple with PB (250 cal). Both keep you full!"
```

### End of Day Summary (Automated at 9 PM)
```
Hannah: "Great day! You hit 1,750/1,800 cal and got 95g protein 💪 
Your 3-day average is down 2 lbs pace. Keep it up!"
```

## Advanced Features

### 1. McDonald's Mode
When Hannah learns user frequents McDonald's:
```
User: "At mcdonalds what should i get"

Hannah: "For your 600 cal budget: Grilled chicken sandwich (380) + apple slices (15) 
+ diet coke. Or 6-piece nuggets (270) + side salad (20) + sauce (50). Both under goal!"
```

### 2. Quick Replies
Common shortcuts Hannah understands:
- "usual breakfast" → Logs their regular breakfast
- "same as yesterday" → Copies previous day's meal
- "skip" → Skips current meal
- "weight 175" → Updates weight
- "undo" → Removes last entry

### 3. Weekly Check-ins
```
Hannah (Sunday 10am): "Week recap! You averaged 1,820 cal/day, down 1.5 lbs! 🎉
McDonald's swaps saved you 1,400 cal. This week's goal: add a veggie to one meal daily?"
```

### 4. Emergency Support
```
User: "Binged feel terrible"

Hannah: "No judgment here 💙 Tomorrow is a fresh start. 
Today still counts as learning. Want to talk about what triggered it? 
Reply 'yes' or just log when you're ready."
```

## Implementation Plan

### Phase 1: Basic SMS (Week 1)
- [ ] Twilio account setup
- [ ] Basic webhook endpoint
- [ ] Simple food parsing with OpenAI
- [ ] Calorie logging to database

### Phase 2: Smart Context (Week 2)  
- [ ] User state management
- [ ] Conversation memory
- [ ] Brave Search nutrition lookup
- [ ] Confidence scoring

### Phase 3: Patterns & Learning (Week 3)
- [ ] "Usual" food recognition
- [ ] McDonald's optimization
- [ ] Daily summaries
- [ ] Weekly check-ins

### Phase 4: MMS & Polish (Week 4)
- [ ] Photo analysis support
- [ ] Quick reply shortcuts
- [ ] Timezone handling
- [ ] Error recovery

## Monitoring & Analytics

Track key metrics:
- Response time (target: <3 seconds)
- Confidence accuracy (>85% match when verified)
- Daily active texters
- Messages per user per day
- Conversion to app downloads

## Cost Analysis

### Per User Per Month
- Twilio SMS: ~$2.40 (10 messages/day × 30 days × $0.008)
- OpenAI API: ~$0.50 (GPT-4 Turbo for short responses)
- Brave Search: ~$0.10 (cached results)
- **Total: ~$3 per active user**

### At Scale (1000 users)
- Phone number: $1
- SMS costs: $2,400
- API costs: $600
- **Total: ~$3,000/month**
- At $12/month subscription: **$12,000 revenue**
- **75% margin!**

## Marketing Hook

**"Text 1-415-HANNAH-1 to start losing weight"**

Simple. No app needed. Just text.

## Privacy & Security

- Phone numbers hashed in database
- Messages deleted after 30 days
- Opt-out: Text "STOP" anytime
- HIPAA compliant infrastructure
- No sharing with third parties

## Success Metrics

Week 1 targets:
- 100 beta users texting
- 80% respond to Hannah's first question
- 60% log at least 3 meals
- 40% still active after 7 days

## The Magic

It just works. No friction. No downloads. Just:

**Text what you eat. Get smarter about food. Lose weight.**

That's it. That's the product.

---

*"Because nobody wants to count calories in an app when they could just text"*