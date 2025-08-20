# AI Onboarding V2 - Final Strategy
## Hannah.health Conversational Meal Planning System

Based on Q&A session with Vince - January 2025

---

## 🎯 Core Decisions Made

### Entry Point
- **NO landing page** - straight to meal planner
- Chat window appears **full width** below header, above macro categories
- Chat **auto-starts** with typing animation (1-2 seconds)
- **"Skip AI"** button always visible (minimizes chat when clicked)

---

## 💬 Opening Conversation Flow

### Initial Message (after typing animation)
```
Hannah: "Hi! I can help you plan your meals. If you're happy to answer a few 
questions, I can fill out your first week's meal plan for you. Then you can 
make personal alterations, or we can keep chatting and I can adjust it 
further for you."

[A] Yes, help me plan my week
[B] I just need a few meal ideas
[C] I prefer to browse myself
```

---

## 🛤️ Path A: Full Week Planning

### Question 1: Main Goal
```
Hannah: "Perfect! What's your main goal with meal planning?"

[A] Eat healthier
[B] Manage a health condition
[C] Save time cooking
```

### Path A-A: Eat Healthier (Wellness)
```
Hannah: "Great! What kind of healthy eating appeals to you?"

[A] Balanced nutrition
[B] Plant-forward
[C] High protein
```

```
Hannah: "Got it! Are you planning meals for:"

[A] Just myself
[B] Me and my partner
[C] My family
```

→ Then: **"Perfect! Let me create a week of balanced meals for [you/you both/your family]..."**
→ Meals appear day by day (quick recipes, mostly under 45 mins)

### Path A-B: Manage Health Condition (Medical)
```
Hannah: "I understand. Could you tell me a bit more about what you're managing? 
(This helps me suggest the right meals)"

[Text box only - let them share in their own words]
```

User types: "I have fatty liver disease"

```
Hannah: "Thank you for sharing that. I'll focus on liver-friendly meals. 
To create the right plan for you, what's your specific goal?"

[A] Weight loss (gradual & healthy)
[B] Maintain current weight
[C] Gain weight/muscle
```

#### If Weight Loss Selected:
```
Hannah: "Got it - let's aim for 0.5kg per week, which is safe and sustainable. 
How active is your typical day?"

[A] Mostly sitting (office job)
[B] On my feet often
[C] Very active job/lifestyle
```

```
Hannah: "And how many steps do you typically get per day?"

[A] Under 5,000
[B] 5,000-10,000
[C] Over 10,000
Or type your average...
```

```
Hannah: "Almost done! Do you exercise regularly, and what's your age range?"

[Text box: "e.g., 'I gym 3x week, 35 years old'"]
```

#### Show the Science:
```
Hannah: "Based on your goals (liver health + weight loss), here's how I'm 
structuring your nutrition:

**Calorie Target:** 1,800/day (500 cal deficit for 0.5kg/week loss)
**Your TDEE:** ~2,300 calories

**Macro Distribution for NAFLD:**
• Carbs: 40% (180g) - Lower carb to improve insulin sensitivity
• Protein: 30% (135g) - Higher protein preserves muscle during weight loss
• Fat: 30% (60g) - Emphasis on omega-3s, limited saturated fat

**Why these ratios:** Research shows this distribution helps reduce liver fat 
while maintaining steady energy. I'll prioritize Mediterranean-style foods 
rich in fiber and antioxidants.

Sound good?"

[A] Perfect
[B] I'd like fewer calories
[C] I'd like more calories
```

```
Hannah: "Perfect! I'll now fill your week with liver-friendly meals at 
1,800 cal/day. You can swap any meals you don't like, or we can adjust 
them together after."
```

→ Meals appear **day by day** (Monday fills, pause, Tuesday fills, etc.)

### Path A-C: Improve Relationship with Food (ED Recovery)
```
Hannah: "Thank you for sharing that. How would you prefer to see your meals?"

[A] No numbers at all
[B] Just portion sizes
[C] Include nutrition info
```

If "No numbers at all":
```
Hannah: "I'll create a colorful, varied week focusing on all food groups. 
No numbers, just nourishment."
```

→ Meals appear with **no calorie/macro information**
→ Focus on variety, colors, satisfaction

---

## 🛤️ Path B: Just a Few Meal Ideas

```
Hannah: "Sure, tell me what you're after and I'll whip it right up!"

[Text box only - no ABC options]
```

User types: "I need healthy dinners for the next 3 nights"

```
Hannah: "Great! I'll make 3 healthy dinners. Just to confirm - are these 
for one person or a family?"

[Smart clarification based on their request]
```

→ Meals appear **as Hannah mentions them**:
- "I've added Grilled Salmon for Monday..." [meal appears]
- "Tuesday you have Chicken Stir-fry..." [meal appears]
- "And Wednesday's Mediterranean Bowl" [meal appears]

---

## 🛤️ Path C: Browse Myself

Chat minimizes to bottom with:
```
"Drag meals from categories above to build your plan. 
[Need help? Chat with Hannah]"
```

---

## 🎯 After Initial Plan Generation

### For All Paths (except ED recovery):
```
Hannah: "Your week is ready! Any foods you particularly love or hate that 
I should know about? Or anything you'd like me to change?"

[Text box]
```

User: "I don't like fish and I'm allergic to nuts"

```
Hannah: "Got it - no fish or nuts. I'll update your plan now. This might 
adjust your macros slightly."

[Meals update in real-time]
```

### For ED Recovery:
```
Hannah: "All set! You can swap any meals you like. What would you like to do next?"

[A] Save this plan
[B] Adjust meals
[C] I'm good for now
```

---

## 💰 Soft Paywall Moment

### After meals are updated (all paths):
```
Hannah: "All set! Quick tip: You can drag any meal to a different day, 
or click the swap icon to see alternatives. What would you like to do next?"

[A] Yes, quick tour
[B] Generate shopping list
[C] Email me my meal plan
```

### If user selects [B] or [C]:
```
Hannah: "Awesome! To save your plan and create your shopping list, 
let's set up your free account:"

[A] Sign up with email
[B] Continue with Google
[C] Continue with Apple
```

### After signup and first free list:
```
"Your first shopping list is ready! 🎉 

FYI: Unlimited lists, meal tracking, and progress stats are available 
with Hannah Plus ($14.99/mo)"
```

---

## 🎬 Interactive Tour (if selected)

### Animated cursor demonstration:
1. **Realistic mouse cursor** appears
2. Moves to meal card, **drags** from Tuesday to Thursday
3. Moves to **swap icon**, clicks
4. **Swap menu** appears with alternatives
5. Cursor clicks away to close

Hannah narrates in chat:
- "You can drag any meal to a different day..."
- "Click the swap icon for alternatives..."
- "Your macros automatically update..."

---

## 💾 Data Storage Structure

### User Profile (Quick Access)
```javascript
{
  user_id: "uuid",
  goal: "weight_loss",
  condition: "NAFLD",
  activity_level: "office_job",
  daily_steps: 7000,
  exercise_frequency: "3x_week",
  age: 35,
  gender: "male",
  tdee_calculated: 2300,
  target_calories: 1800,
  macro_distribution: {
    carbs_percent: 40,
    protein_percent: 30,
    fat_percent: 30
  },
  dietary_restrictions: ["no_fish", "nut_allergy"],
  preferences: {
    show_numbers: true,
    meal_mode: "medical", // medical | ed_safe | wellness
    household_size: "single"
  },
  created_at: "2025-01-20",
  updated_at: "2025-01-20"
}
```

### Conversation Summary (Context)
```javascript
{
  user_id: "uuid",
  session_id: "uuid",
  initial_path: "medical",
  key_responses: {
    main_goal: "manage health condition",
    condition_stated: "fatty liver disease",
    weight_goal: "weight_loss",
    activity_described: "office job, 7k steps, gym 3x week",
    age_stated: "35 years old",
    preferences_stated: "no fish, allergic to nuts"
  },
  plan_generated: {
    date: "2025-01-20",
    type: "full_week",
    calories_per_day: 1800,
    macro_ratios: "40/30/30",
    meal_count: 28
  },
  interaction_metrics: {
    questions_answered: 7,
    time_to_complete: "4:32",
    customizations_made: 2
  }
}
```

---

## 🎨 UI/UX Specifications

### Chat Window Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Hannah.health                            [Skip AI ▼]       │
├─────────────────────────────────────────────────────────────┤
│  💬 Hannah (Full width chat area)                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Chat messages appear here]                             ││
│  │                                                          ││
│  │ [A] Option A                                            ││
│  │ [B] Option B                                            ││
│  │ [C] Option C                                            ││
│  │                                                          ││
│  │ [Text input box: Or type your answer...]                ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Macro Categories (Drag to add)                             │
│  [Proteins] [Carbs] [Vegetables] [Healthy Fats] [Snacks]   │
├─────────────────────────────────────────────────────────────┤
│  Your Meal Plan                                             │
│  [Monday] [Tuesday] [Wednesday] [Thursday] [Friday] [Weekend]│
└─────────────────────────────────────────────────────────────┘
```

### Meal Population Animation
- Meals appear **day by day**
- Each day takes ~1 second to fill
- Slight bounce animation as meals land
- Calorie/macro bars update in real-time (if shown)

### "Skip AI" Behavior
- Always visible in top-right of chat
- When clicked: chat minimizes to thin bar at bottom
- Minimized state: "Need help? Chat with Hannah" 
- Clicking expands chat back to previous state

---

## 🚫 Safety Features

### ED Recovery Mode
- Numbers hidden **immediately** upon selection
- No weight/calorie language ever used
- Focus on variety, colors, nourishment
- Cannot accidentally see triggering content
- Settings require deliberate action to change

### Medical Mode
- Always shows disclaimer about medical advice
- Encourages healthcare team consultation
- Evidence-based recommendations only
- Links to studies when showing macro science
- Export feature for doctor reports

---

## 📊 Success Metrics

### Engagement
- **Completion rate**: % who get to meal plan generation
- **Question engagement**: % using ABC vs text input
- **Drop-off points**: Where users click "Skip AI"

### Conversion
- **Signup rate**: % who create account for shopping list
- **First list generation**: % who complete shopping list
- **Plus upgrade**: % who upgrade within 7 days

### Retention
- **Week 2 return**: % who plan second week
- **Customization rate**: % who swap meals
- **Profile completion**: % who answer all questions

---

## 🚀 Implementation Priorities

### Phase 1: Core Flow
1. Chat interface with typing animation
2. ABC option system
3. Three main paths (medical, ED, wellness)
4. Day-by-day meal population
5. LocalStorage for pre-signup persistence

### Phase 2: Intelligence
1. AI meal generation based on profile
2. Smart clarification questions
3. Macro calculation engine
4. Real-time meal swapping

### Phase 3: Conversion
1. Shopping list generation
2. Email/Google/Apple signup
3. First list free system
4. Plus upgrade flow

### Phase 4: Polish
1. Interactive tour with animated cursor
2. Meal drag-and-drop refinement
3. Mobile responsive chat
4. Voice input option

---

## 🔄 Future Enhancements

### Planned Features
- Remember returning users ("Welcome back! Continue where you left off?")
- Weekly check-ins ("How did last week go?")
- Seasonal meal suggestions
- Restaurant meal integration
- Family member profiles

### AI Improvements
- Learn from meal swaps
- Predict preferences
- Suggest based on weather
- Cultural cuisine preferences
- Budget optimization

---

*Document Version: 2.0*
*Last Updated: January 2025*
*Based on Q&A Session with Vince*