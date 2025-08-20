# AI Onboarding Agent
## Hannah.health Conversational Meal Planning System

---

## 🎯 Mission Statement
Replace traditional onboarding with an AI conversation that builds meal plans in real-time while learning about users naturally. No forms, no friction, just helpful conversation with immediate value.

---

## 🏗️ Architecture Overview

### User Entry Points
```
hannahhealth.app → Meal Planner + AI Chat (No landing page!)
                 ↓
    ┌────────────────────────────┐
    │  "Skip AI - I'll do it myself"│ ← Always visible option
    └────────────────────────────┘
                 ↓
    AI Chat starts automatically
```

### Core Principles
1. **ABC Options Always** - Every question has quick-select options + free text
2. **Immediate Value** - Add meals to board after each answer
3. **No Pressure** - "Skip AI" button always visible
4. **Progressive Disclosure** - Learn about user gradually
5. **Soft Paywall** - Shopping list requires signup

---

## 💬 Conversation Flow Design

### Opening Screen
```
┌─────────────────────────────────────────────────────────────┐
│  Hannah.health                    [Skip AI - Plan Manually] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Meal Plan (Drag meals here or let Hannah help)       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Monday  Tuesday  Wednesday  Thursday  Friday  Weekend  │ │
│  │ [Empty boards ready for meals]                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 💬 Hannah                                               │ │
│  │                                                         │ │
│  │ Hi! I can help you plan your meals, or you can do it   │ │
│  │ yourself using the categories above.                    │ │
│  │                                                         │ │
│  │ What would you prefer?                                  │ │
│  │                                                         │ │
│  │ [A] Help me plan my meals                              │ │
│  │ [B] I'll browse and plan myself                        │ │
│  │ [C] Show me how this works                             │ │
│  │                                                         │ │
│  │ Or type your own response...                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗣️ Question Scripts with ABC Options

### Question 1: Initial Choice
```javascript
{
  id: 'initial_choice',
  message: "Hi! I can help you plan your meals, or you can do it yourself using the categories above. What would you prefer?",
  options: [
    { key: 'A', text: 'Help me plan my meals', action: 'continue_chat' },
    { key: 'B', text: "I'll browse and plan myself", action: 'enable_manual_mode' },
    { key: 'C', text: 'Show me how this works', action: 'show_demo' }
  ],
  allowCustom: true
}
```

### Question 2: Name & Approach
```javascript
{
  id: 'name_approach',
  message: "Great! I'm Hannah. What should I call you?",
  followUp: "Nice to meet you, {name}! How can I help you today?",
  options: [
    { key: 'A', text: 'Plan healthy meals for the week', action: 'general_planning' },
    { key: 'B', text: 'I have a health condition to manage', action: 'medical_path' },
    { key: 'C', text: 'I want to improve my relationship with food', action: 'ed_safe_path' }
  ],
  allowCustom: true,
  afterResponse: 'ADD_FIRST_MEAL' // Adds breakfast suggestion
}
```

### Question 3A: Medical Path
```javascript
{
  id: 'medical_condition',
  message: "I understand. Many people use Hannah for health management. What are you managing?",
  options: [
    { key: 'A', text: 'Liver health (NAFLD/fatty liver)', action: 'set_nafld' },
    { key: 'B', text: 'Blood sugar (diabetes/pre-diabetes)', action: 'set_diabetes' },
    { key: 'C', text: 'Heart health (cholesterol/BP)', action: 'set_cardiac' },
    { key: 'D', text: "I'd rather not say", action: 'set_general_medical' }
  ],
  allowCustom: true,
  response: {
    'A': "I'll focus on Mediterranean-style meals that support liver health.",
    'B': "I'll prioritize balanced meals that help maintain steady blood sugar.",
    'C': "I'll suggest heart-healthy meals with good fats and lower sodium.",
    'D': "No problem! I'll focus on generally nutritious, balanced meals."
  },
  afterResponse: 'ADD_LUNCH_MEAL'
}
```

### Question 3B: ED-Safe Path
```javascript
{
  id: 'ed_safe_approach',
  message: "Thank you for sharing that. I'll focus on variety and satisfaction. Would you like to:",
  options: [
    { key: 'A', text: 'See no numbers at all', action: 'full_ed_safe' },
    { key: 'B', text: 'See basic portions without calories', action: 'partial_ed_safe' },
    { key: 'C', text: 'Focus on meal variety and balance', action: 'variety_focus' }
  ],
  allowCustom: true,
  response: "Got it. I'll keep things peaceful and focus on nourishment.",
  afterResponse: 'ADD_COLORFUL_MEALS' // Adds variety-focused suggestions
}
```

### Question 4: Dietary Preferences
```javascript
{
  id: 'dietary_preferences',
  message: "Any foods you avoid or particularly enjoy?",
  options: [
    { key: 'A', text: 'No restrictions - I eat everything', action: 'no_restrictions' },
    { key: 'B', text: 'Vegetarian/Vegan', action: 'plant_based' },
    { key: 'C', text: 'Avoid gluten/dairy', action: 'allergen_free' },
    { key: 'D', text: 'Let me type my preferences', action: 'custom_input' }
  ],
  allowCustom: true,
  afterResponse: 'ADD_DINNER_MEAL'
}
```

### Question 5: Cooking Preference
```javascript
{
  id: 'cooking_time',
  message: "How much time do you usually have for cooking?",
  options: [
    { key: 'A', text: 'Quick meals (under 20 min)', action: 'quick_meals' },
    { key: 'B', text: 'Some cooking is fine (30-45 min)', action: 'moderate_cooking' },
    { key: 'C', text: 'I enjoy cooking (any time)', action: 'loves_cooking' }
  ],
  allowCustom: true,
  afterResponse: 'ADD_SNACK_OPTIONS'
}
```

### Question 6: Meal Frequency
```javascript
{
  id: 'meal_frequency',
  message: "How many meals do you typically eat per day?",
  options: [
    { key: 'A', text: 'Three meals, no snacks', action: '3_meals' },
    { key: 'B', text: 'Three meals plus snacks', action: '3_plus_snacks' },
    { key: 'C', text: 'I graze throughout the day', action: 'grazing' },
    { key: 'D', text: 'Intermittent fasting schedule', action: 'IF_schedule' }
  ],
  allowCustom: true,
  afterResponse: 'COMPLETE_FIRST_DAY' // Fills out rest of Monday
}
```

### Question 7: Week Planning
```javascript
{
  id: 'week_planning',
  message: "Your Monday looks great! Should I:",
  options: [
    { key: 'A', text: 'Plan the whole week similarly', action: 'replicate_week' },
    { key: 'B', text: 'Add variety for each day', action: 'varied_week' },
    { key: 'C', text: "I'll take over from here", action: 'user_control' }
  ],
  allowCustom: true,
  afterResponse: 'POPULATE_WEEK'
}
```

---

## 🎁 Progressive Reward System

### Meal Addition Timeline
```javascript
const rewardSchedule = {
  afterQuestion1: null, // Just gathering preference
  afterQuestion2: 'ADD_BREAKFAST', // First meal appears
  afterQuestion3: 'ADD_LUNCH', // Second meal
  afterQuestion4: 'ADD_DINNER', // Third meal
  afterQuestion5: 'ADD_SNACKS', // Snack options
  afterQuestion6: 'COMPLETE_DAY', // Full Monday
  afterQuestion7: 'POPULATE_WEEK' // Entire week
};
```

### Meal Addition Animation
```javascript
// Meals fade in from the right side
const addMealToBoard = (meal, day, mealType) => {
  const card = createMealCard(meal);
  card.style.animation = 'slideInFromRight 0.5s ease';
  boardSlot[day][mealType].appendChild(card);
  
  // Hannah acknowledges
  addMessage(`I've added ${meal.name} to your ${day} ${mealType}. You can drag it to a different slot if you prefer!`);
};
```

---

## 🚪 Shopping List Paywall Strategy

### The Soft Block
```javascript
{
  id: 'shopping_list_request',
  trigger: 'User clicks "Generate Shopping List"',
  message: "Your meal plan looks fantastic! To save it and create your shopping list, let's set up your free account:",
  options: [
    { key: 'A', text: 'Sign up with email', action: 'email_signup' },
    { key: 'B', text: 'Continue with Google', action: 'google_auth' },
    { key: 'C', text: 'Maybe later', action: 'continue_planning' }
  ],
  sweetener: "Plus, I'll remember your preferences for next time!"
}
```

### What They Can Do Without Signup
- ✅ Chat with Hannah
- ✅ Get meal suggestions
- ✅ Drag and arrange meals
- ✅ See nutrition info (if not ED-safe)
- ✅ Manually write down meals
- ❌ Save meal plan
- ❌ Generate shopping list
- ❌ Track progress
- ❌ Access next week

---

## 🧠 AI Context Management

### User Profile Building
```javascript
class UserProfileBuilder {
  constructor() {
    this.profile = {
      name: null,
      conditions: [],
      preferences: [],
      restrictions: [],
      cookingTime: null,
      mealFrequency: null,
      mode: 'general', // general | medical | ed_safe
      conversationStyle: null,
      mealsGenerated: 0
    };
  }
  
  updateFromResponse(questionId, answer) {
    switch(questionId) {
      case 'medical_condition':
        this.profile.conditions.push(answer);
        this.profile.mode = 'medical';
        break;
      case 'ed_safe_approach':
        this.profile.mode = 'ed_safe';
        this.profile.hideNumbers = true;
        break;
      // ... etc
    }
    
    // Store in localStorage for pre-signup persistence
    localStorage.setItem('hannahProfile', JSON.stringify(this.profile));
  }
}
```

### AI Prompt Construction
```javascript
const buildAIPrompt = (profile, currentQuestion) => {
  let prompt = `You are Hannah, a helpful meal planning assistant.
  
  User Profile:
  - Name: ${profile.name || 'User'}
  - Mode: ${profile.mode}
  - Conditions: ${profile.conditions.join(', ') || 'None specified'}
  - Preferences: ${profile.preferences.join(', ')}
  `;
  
  if (profile.mode === 'ed_safe') {
    prompt += `
    CRITICAL: This user is in ED recovery mode.
    - NEVER mention calories, weight, or numbers
    - Focus on variety, colors, and nourishment
    - Use encouraging, non-judgmental language
    - Avoid "good/bad" food labels
    `;
  }
  
  if (profile.conditions.includes('NAFLD')) {
    prompt += `
    Medical Note: User has NAFLD
    - Prioritize Mediterranean-style meals
    - Limit saturated fat
    - Emphasize fiber-rich foods
    - Avoid alcohol-containing recipes
    `;
  }
  
  return prompt;
};
```

---

## 🎨 UI Components

### Chat Interface
```jsx
const ChatInterface = () => {
  const [showManualOption, setShowManualOption] = useState(true);
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>💬 Hannah</span>
        <button 
          className="skip-ai-btn"
          onClick={() => setManualMode(true)}
        >
          Skip AI - Plan Manually
        </button>
      </div>
      
      <div className="messages">
        {messages.map(msg => (
          <Message key={msg.id} {...msg} />
        ))}
      </div>
      
      <div className="input-area">
        {currentQuestion.options && (
          <div className="quick-options">
            {currentQuestion.options.map(opt => (
              <button 
                key={opt.key}
                className="option-btn"
                onClick={() => handleOption(opt)}
              >
                [{opt.key}] {opt.text}
              </button>
            ))}
          </div>
        )}
        
        <input 
          type="text"
          placeholder="Or type your answer..."
          onKeyPress={handleCustomInput}
        />
      </div>
    </div>
  );
};
```

### Manual Mode Toggle
```jsx
const ManualModeNotice = () => (
  <div className="manual-mode-notice">
    <h3>Planning Manually</h3>
    <p>Drag meals from the categories above to build your plan.</p>
    <button onClick={() => setShowChat(true)}>
      Need help? Chat with Hannah
    </button>
  </div>
);
```

---

## 📊 Analytics & Learning

### Track What Works
```javascript
const trackUserBehavior = {
  questionEngagement: {
    // Which questions get custom answers vs ABC selections?
    custom_response_rate: {},
    option_selection_distribution: {},
    drop_off_points: []
  },
  
  conversionMetrics: {
    chat_to_signup: 0,
    meals_before_signup: 0,
    shopping_list_conversion: 0
  },
  
  modeDistribution: {
    medical: 0,
    ed_safe: 0,
    general: 0,
    manual_only: 0
  }
};
```

### A/B Testing Options
1. **Opening Message Variations**
   - Friendly: "Hi! I can help you plan meals..."
   - Direct: "Let's build your meal plan..."
   - Question: "What brings you to Hannah today?"

2. **Option Order**
   - Medical first vs. General first
   - ABC vs. 123 vs. bullets

3. **Reward Timing**
   - Meals after every question vs. batch after 3 questions

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1)
- Basic chat with hardcoded responses
- ABC options for all questions
- Manual mode toggle
- Add meals to board progressively
- localStorage for persistence

### Phase 2: AI Integration (Week 2)
- Connect to GPT-4/Claude API
- Dynamic meal generation
- Context-aware responses
- Smarter meal suggestions based on profile

### Phase 3: Paywall & Auth (Week 3)
- Shopping list generation
- Email/Google signup
- Profile migration from localStorage to database
- Save meal plans

### Phase 4: Enhancement (Week 4)
- Voice input option
- Meal images
- Dietary analysis
- Progress tracking

---

## 🔒 Safety Considerations

### ED-Safe Mode Triggers
```javascript
const ED_TRIGGER_PHRASES = [
  'weight loss',
  'calories',
  'restrict',
  'binge',
  'purge',
  'obsess',
  'guilty',
  'bad foods'
];

const checkForEDTriggers = (userInput) => {
  const lower = userInput.toLowerCase();
  if (ED_TRIGGER_PHRASES.some(phrase => lower.includes(phrase))) {
    return {
      triggered: true,
      response: "I hear you. Would you prefer I focus on nourishment and variety without any numbers or rules?"
    };
  }
  return { triggered: false };
};
```

### Medical Disclaimer
```javascript
const MEDICAL_DISCLAIMER = `
This is not medical advice. Hannah helps you implement 
guidance from your healthcare team. Always consult your 
doctor about dietary changes for medical conditions.
`;

// Show when medical condition detected
if (profile.conditions.length > 0) {
  showDisclaimer(MEDICAL_DISCLAIMER);
}
```

---

## 💡 Innovation Opportunities

### Future Features
1. **Voice Assistant**: "Hey Hannah, what's for dinner?"
2. **Photo Analysis**: "Here's what's in my fridge" → meal suggestions
3. **Restaurant Mode**: "I'm eating at Chipotle" → best choices
4. **Family Mode**: Different preferences per family member
5. **Grocery Integration**: Order directly from Instacart/Amazon

### Premium AI Features ($14.99/mo)
- Unlimited AI conversations
- Custom meal creation
- Restaurant recommendations
- Macro optimization
- Weekly check-ins with progress analysis

---

## 📈 Success Metrics

### Key Performance Indicators
1. **Engagement Rate**: % who answer >3 questions
2. **Completion Rate**: % who fill a full day of meals
3. **Conversion Rate**: % who sign up for shopping list
4. **Retention**: % who return next week
5. **Mode Distribution**: Medical vs. ED-safe vs. General

### Target Metrics (Month 1)
- 70% answer first question
- 50% complete full day
- 30% sign up for account
- 40% weekly retention
- 25% use AI vs. manual

---

## 🎯 Agent Responsibilities

### AI Onboarding Agent Tasks
1. **Conversation Design**: Script all questions with ABC options
2. **Response Logic**: Build decision trees for each path
3. **Meal Generation**: Create meal suggestion algorithm
4. **Profile Building**: Progressive user understanding
5. **Paywall Strategy**: Optimize conversion points
6. **Safety Protocols**: ED-safe and medical disclaimers
7. **Analytics Setup**: Track all interaction points
8. **A/B Testing**: Optimize conversation flow
9. **Error Handling**: Graceful fallbacks for AI failures
10. **Manual Mode**: Full functionality without AI

---

## 🚦 Go/No-Go Checklist

Before launch, ensure:
- [ ] All questions have ABC options + custom input
- [ ] "Skip AI" button always visible
- [ ] Meals appear progressively as promised
- [ ] ED-safe mode completely hides numbers
- [ ] Medical disclaimer shows when appropriate
- [ ] Shopping list triggers signup
- [ ] Manual mode fully functional
- [ ] localStorage persists between sessions
- [ ] Mobile responsive
- [ ] AI fallback for API failures

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Agent: AI Onboarding Specialist*