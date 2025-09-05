# Hannah Health Mobile - iOS First Strategy

## Project Evolution
**Hannah Health** - "Because nobody wants to meal prep a quinoa bowl"

A revolutionary approach to nutrition tracking that works with your real life, not against it. This isn't another prescriptive meal planner - it's your personal AI nutritionist who understands that sometimes Friday means McDonald's, and that's okay.

## Core Concept
Users start tracking immediately - no meal plans, no diet changes, no judgment. Just text Hannah (your AI nutritionist) what you eat, and she learns your patterns, then gradually suggests realistic improvements based on what you already enjoy eating.

## Why Mobile-First?
- **Zero Friction Logging**: Text-like interface via WhatsApp or in-app - as easy as texting a friend
- **Always Available**: Log meals, exercise, and mood throughout your day
- **Native Performance**: iOS-native for that buttery-smooth experience
- **Camera First**: Snap photos of meals or menus for instant analysis
- **WhatsApp Integration**: Use existing messaging habits - notifications already approved
- **Health Kit Integration**: Automatic step counting and activity tracking (when available)

## Core Vision
An AI nutritionist in your pocket who:
- Learns your McDonald's order and works with it, not against it
- Never suggests quinoa bowls when you need quick convenient food
- Celebrates progress without judgment
- Provides evidence-based suggestions grounded in research
- Evolves your meal plan naturally based on foods you already eat

## Authentication System *(Session 13-15: COMPLETE ✅)*

### Protection Strategy
- **No anonymous access** - Every API call requires auth
- **Instant access** - No email verification required
- **Profile creation** - Direct in iOS (no triggers)
- **Three-state flow**: Loading → Unauthenticated → Authenticated

### Onboarding Messaging (Updated Session 14)
1. "Text Your Meals Like a Friend" - SMS as hero feature
2. "Life Gets Messy" - AI helps with menu choices
3. "More Than Weight Loss" - Journal mode available
4. **"No commitments required"** - True free access

### Implementation Status
- ✅ AuthManager with Supabase v2
- ✅ OnboardingView with refined messaging
- ✅ UserProfileView with full fields (Session 15)
  - Name, birth year, height, weight
  - Phone with country code selector
  - Metric/imperial unit toggles
  - Safe mode for ED recovery
  - Direct field editing (no Edit mode)
- ✅ Sign out functionality
- ✅ Dev skip mode for testing
- ✅ Fixed date decoding and data persistence (Session 15)
- ⏳ Backend middleware for API protection
- ⏳ Mode selection in onboarding

## SMS Integration *(Session 12: COMPLETE ✅)*

### Infrastructure
- **Redis**: 24-hour conversation persistence
- **Twilio**: SMS gateway ($7/month + per message)
- **Supabase**: Food entry storage
- **OpenAI**: Food extraction and calorie estimation

### How It Works
1. User texts food to Twilio number
2. AI extracts calories and asks confirmation
3. User replies "Y" to confirm
4. Food logged to Supabase with confidence score
5. Conversation cleared from Redis

### Implementation Status
- ✅ SMS webhook endpoint (`/api/sms/webhook`)
- ✅ Phone verification endpoints
- ✅ Redis conversation storage (24hr TTL)
- ✅ Supabase RPC functions connected
- ✅ Environment variables secured
- ✅ iOS phone field in profile (Session 15)
- ⏳ Production deployment

## Technical Stack

### iOS Development
```
Platform: iOS 15.0+ (covering ~95% of iOS users)
Language: Swift 5.9
UI Framework: SwiftUI
Architecture: MVVM with Combine
Data: Core Data + CloudKit sync
Networking: URLSession with async/await
AI Integration: Claude API (with confidence scoring)
WhatsApp: Business API integration
Backend: Supabase (PostgreSQL + Auth + Realtime)
Analytics: MixPanel
Deployment: TestFlight → App Store
```

### TDEE System *(Session 18: COMPLETE ✅)*
**Activity-Based Calculation**: TDEE = BMR + Steps + Exercise + TEF
- BMR: Mifflin-St Jeor equation with real profile data
- Steps: Actual count × 0.00045 cal/step/kg body weight
- Exercise: HealthKit active energy with deduplication
- TEF: 10% of consumed calories (digestion)
- Smart deduplication prevents double-counting steps during exercise
- Interactive donut chart visualization (Session 21)
- Real-time updates as activity changes

### Key iOS Features
1. **Modular Dashboard Interface** *(Updated - see HannahHealth/UI-DESIGN.md)*
   - Card-based customizable home screen
   - Drag-to-reorder modules
   - Bottom tab navigation (Dashboard | Log | Insights | Meal Plan | Shop List | AI Coach)
   - Log feature opens drawer for quick food tracking
   - Full-screen chat experience in AI Coach
   - Custom color themes per user
   - Enhanced widgets showing remaining goals and distances
   - Exercise type and duration display

2. **Hannah - Your AI Nutritionist**
   - Conversational interface via chat or WhatsApp
   - Photo analysis with confidence scoring
   - Evidence-based recommendations with citations
   - Learns user patterns and preferences
   - Context-aware suggestions at the right moments

3. **Smart Tracking Features**
   - Confidence scoring on all logged items (85% confident = 320 calories)
   - Range-based exercise calories (250-350 calories for a run)
   - Mood & energy correlation tracking
   - HealthKit integration with smart deduplication
   - Activity-based TDEE calculation (no generic multipliers)
   - Real-time calorie target adjustments
   - Transparent equation breakdowns

4. **Tracking Modes** *(see mobile/MODES.md for full details)*
   - ED-Safe Mode: Number-free journaling for recovery
   - Weight Loss Mode: Full tracking with deficit targets
   - Gain & Recovery Mode: For medical recovery
   - Performance Mode: Athletic/bodybuilding focus
   - Maintenance Mode: Balanced healthy living
   - Medical Mode: Condition-specific tracking

5. **User Profile System** *(see mobile/PROFILE.md for implementation)*
   - Minimal onboarding: Name, birth year, height
   - Full-screen profile page with direct field editing
   - Weight tracking with metric/imperial toggles
   - Phone number with country code selection
   - Safe mode toggle for ED recovery
   - Mode selection and preferences
   - Sign out functionality
   - Expandable for future features

## Backend Architecture

### API Endpoints

#### `/api/ai/chat` - Dual-Mode AI Endpoint
The main AI chat endpoint handles two distinct modes based on context:

1. **Food Logging Mode** (`context.type === "food_logging"`):
   - Triggered by Log feature in iOS app
   - Uses Brave Search to find real nutrition data
   - Returns calorie calculations (e.g., "2 eggs = 140 calories")
   - Handles confirmations when user types "Y"
   - No recipe searches, only nutrition facts

2. **Recipe Search Mode** (default):
   - Searches for recipes and cooking instructions
   - Returns recipe links from real websites
   - Used by meal planner and general chat

**Technical Implementation**:
- Detects context via `context.instruction` field
- Uses Brave Search API for real-time nutrition data
- Sources: nutritionix.com, australianeggs.org.au, healthline.com
- GPT-4o-mini for natural language processing
- Special handling for confirmation responses ("Y", "yes", "confirm")

## App Structure

### Core Modules

#### 1. Zero-Friction Onboarding
- **Minimal Setup**: Name, birth year, height → Start tracking
- **Select Tracking Mode**: Choose based on goals and needs (see MODES.md)
- **Health Conditions**: Optional (Diabetes, NAFLD, PCOS, etc.)
- **Goal Setting**: Based on selected mode
- **Reminder Preferences**: User sets frequency for check-ins

#### 2. The Dashboard (Main Screen)
Modular cards on scrollable view *(see UI-DESIGN.md for full specs)*:
- **Daily Summary Card** *(Session 21: Interactive Redesign)*: 
  - Interactive donut chart with tap-to-explore segments
  - Outer ring: TDEE components (BMR, Steps, Exercise, TEF) 
  - Inner ring: Meals by type (Breakfast-Amber, Lunch-Teal, Dinner-Purple, Snacks-Orange)
  - Red deficit segment shows calories saved for weight loss
  - Tap any segment for detailed breakdown
  - Clean minimal design - info on demand, not always visible
- **Quick Stats Grid**: 
  - Steps: Shows remaining to goal + km distance
  - Exercise: Type, duration, and calories
- **Hannah's Advice**: Horizontal scroll of personalized tips
- **Recent Foods**: Today's logged items with confidence scores
- **Bottom Navigation**: Dashboard | Chat | + | Meal Plan | Shopping

#### 3. Smart Food Logging
- **Quick Log Drawer**: Tap Log tab → slide-up drawer for instant entry
- **Text First**: "2 eggs" → "140 calories. Reply Y to confirm"
- **Real Nutrition Data**: Uses Brave Search for accurate calories
- **Photo Analysis**: "I see grilled chicken, rice, and broccoli - correct?"
- **Confidence Scoring**: Shows when uncertain, asks clarifying questions
- **Pattern Learning**: Remembers your "usual" coffee order
- **Menu Help**: "Which option keeps me in deficit?" with photo
- **Quick Actions**: Pre-filled buttons for breakfast, lunch, dinner, snack

#### 4. Exercise & Activity
- **Auto-tracking**: Pulls from HealthKit with smart deduplication
- **Deduplication Logic**: Prevents double-counting when running with phone + tracker
- **Manual Entry**: "Went for a run" → "How long? What intensity?"
- **Range Estimates**: "30 min moderate run: 250-350 calories"
- **No Gadget Required**: Works without fitness trackers
- **Exercise Types**: Detects and displays workout type from HealthKit

#### 5. Progress Without Pressure
- **Beautiful Visualizations**: Colorful graphs, customizable themes
- **Mood & Energy Tracking**: Emojis + optional notes
- **Evidence-Based Insights**: "Energy 20% higher with regular breakfast (Sleep Med, 2024)"
- **Positive Reinforcement**: "3kg lost - your consistency is paying off!"
- **No Gamification**: No streaks, badges, or guilt

## Hannah - The AI Nutritionist

### Personality & Approach
- **Professional but Approachable**: Like texting a trusted nutritionist friend
- **Evidence-Based**: Citations for recommendations ("Studies show... Int J Obesity, 2024")
- **Non-Judgmental**: "Got it! 850 calories logged" not "That's too much!"
- **Pattern Recognition**: Learns your habits and preferences over time
- **Contextual Coaching**: "Just finished your workout? Great time for protein!"

### Smart Features
1. **Confidence Algorithm**
   - Shows confidence scores transparently (85% confident = 320 calories)
   - Only asks follow-ups when it matters (fried vs grilled makes a difference)
   - "I see pasta with sauce (45% confident) - restaurant portion?"

2. **Realistic Swaps**
   - Works with your actual habits: "Try grilled at McDonald's, not a salad"
   - Gradual improvements: "Add eggs to breakfast for more protein"
   - Never suggests unrealistic changes: No quinoa bowls for busy parents

3. **Learning & Memory**
   - Remembers patterns: "Your usual oat milk coffee?"
   - Tracks preferences: "I know you prefer chicken over fish"
   - Adapts suggestions: "Since you eat McDonald's Fridays..."

4. **Week 1 Evolution**
   - Days 1-7: Observe and learn patterns
   - Day 7: "Want to see some easy swaps based on your eating?"
   - Week 2: Optional personalized meal plan emerges
   - Shopping list auto-generates from accepted suggestions

## User Experience Principles

### Design Philosophy
- **Real Life First**: Works with McDonald's habits, busy schedules
- **Transparency**: Shows confidence scores, ranges, uncertainty
- **Education**: Explains the "why" behind every suggestion
- **Personalization**: Custom colors, column order, reminder frequency
- **No Judgment**: Focus on progress, not perfection

## Data Architecture

### Local Storage (Core Data)
```swift
Entities:
- User (profile, preferences, mode, goals)
- UserContext (habits, preferences, patterns)
- FoodLog (meals with confidence scores)
- Exercise (activities with calorie ranges)
- MoodEnergy (tracking with timestamps)
- MealPlan (evolved suggestions)
- ShoppingList (auto-generated items)
- Progress (weight, measurements - user initiated only)
```

### Cloud Sync (Supabase)
- Real-time sync across devices
- Secure authentication
- Row-level security
- Professional access for nutritionists (B2B2C model)

## AI Integration

### Hannah's Capabilities
1. **Natural Language Processing**: "Just had pizza" → Structured data
2. **Photo Analysis**: Identifies foods with confidence scoring
3. **Pattern Recognition**: Learns individual habits and preferences
4. **Evidence-Based Recommendations**: Citations from research
5. **Contextual Awareness**: Right suggestion at the right time
6. **Meal Plan Evolution**: Natural progression from observations

### SMS Integration via Twilio *(Session 12: COMPLETE ✅)*
- **Phone Number**: +1 (551) 368-5291 (production ready)
- **Infrastructure**: Redis (24hr TTL) + Supabase (permanent storage)
- **Natural Conversation**: Multi-turn conversations with context
- **Confirmation Flow**: "Reply Y to confirm" → logs to database
- **Phone Verification**: `/api/sms/verify-phone` endpoint ready
- **Cost Model**: 50 free SMS/month per user
- **Status**: Fully implemented, needs deployment
- **Full Documentation**: See [SMS-INTEGRATION-STATUS.md](./SMS-INTEGRATION-STATUS.md)

### WhatsApp Integration *(Future)*
- **Primary Logging Interface**: Leverage existing messaging habits
- **Pre-approved Notifications**: No permission barriers
- **Reminders**: "Haven't heard from you since breakfast - what did you have for lunch?"
- **Quick Responses**: 1-2 second delay for natural feel
- **Full Feature Parity**: Same Hannah personality across platforms

## Monetization Strategy

### Pricing Model
**7-Day Free Trial** then **$11.99/month or $71.99/year** ($6/month)
- Matches MacroFactor pricing with superior AI features
- Trial ends when personalized meal plan is ready (perfect timing)
- "Your personalized meal plan is ready - upgrade to continue"

### B2B2C Model
**Professional Plan ($49/month per nutritionist)**
- Dashboard for monitoring multiple clients
- Clients get app free or discounted
- Creates referral flywheel
- Nutritionists become distribution channel

### Value Proposition
- Same price as MacroFactor but with AI nutritionist
- Cheaper than Noom ($17.42/month) with better UX
- Works with real life, not against it
- "Because nobody wants to meal prep a quinoa bowl"

## User Journey

### Day 1: Instant Start
1. Download app
2. Enter: age, sex, height, weight (optional for ED recovery)
3. Select health conditions (if any)
4. Choose tracking mode (full/macros/habits)
5. Set goals ("lose weight", "be healthier", "manage diabetes")
6. Configure reminder frequency
7. Start logging immediately - "What did you have for breakfast?"

### Week 1: Learning Phase
- Hannah observes eating patterns
- No judgment, just tracking
- Builds user context database
- Identifies habits (Friday McDonald's, morning coffee routine)
- Tracks mood/energy correlations

### Day 7: The Magic Moment
- "Based on your week, I have some easy swaps that could help"
- Shows realistic suggestions based on actual eating
- Offers to create flexible meal plan
- Shopping list auto-generates
- **Paywall appears** - perfect timing for conversion

### Week 2+: Optimization
- Gradual improvements based on accepted suggestions
- Evidence-based recommendations with citations
- Celebrates victories without pressure
- Natural evolution toward healthier habits

## Development Phases

### Phase 1: Core MVP (Weeks 1-4)
- ~~Kanban board UI~~ **Modular dashboard with bottom navigation**
- Full-screen Hannah chat interface (ChatGPT-style)
- Text-based food logging with confidence scores
- BMR calculation and calorie tracking
- Mood/energy tracking with emojis
- Core Data setup for local storage

### Phase 2: AI Intelligence (Weeks 5-8)
- Claude API integration with confidence algorithm
- Photo analysis for food recognition
- Pattern learning and user context
- Exercise logging with range estimates
- Week 1 meal plan evolution
- Shopping list generation

### Phase 3: WhatsApp & Integration (Weeks 9-12)
- WhatsApp Business API setup
- HealthKit integration for steps
- Reminder system (customizable frequency)
- Beautiful data visualizations
- Custom color themes
- Supabase backend sync

### Phase 4: Polish & Launch (Weeks 13-16)
- B2B2C nutritionist dashboard
- Subscription with RevenueCat
- Performance optimization
- App Store optimization (ASO)
- TestFlight beta (500 users)
- Launch with press kit

## Key Features That Matter

### The Magic Is In The Details

1. **Confidence Scoring Transparency**
   - "Grilled chicken: 165 calories (92% confident)"
   - "Pasta portion: 400-600 calories (45% confident - was this a restaurant serving?)"
   - Builds trust through honesty about uncertainty

2. **Real-World Suggestions**
   - "The grilled chicken wrap at McDonald's saves 600 calories"
   - "Adding Greek yogurt to breakfast adds 15g protein"
   - Never: "Replace McDonald's with quinoa salad"

3. **Pattern-Based Personalization**
   - Learns: Friday = McDonald's day
   - Adapts: "It's Friday! The grilled options at McDonald's are..."
   - Remembers: "Your usual oat milk latte?"

4. **Mood-Food Intelligence**
   - Correlates energy with eating patterns
   - Shows beautiful graphs without preaching
   - Optional insights: "Energy 20% higher with regular meals"

5. **Three Tracking Modes**
   - Full: Calories + macros + everything
   - Macros: Just protein/carbs/fat ratios
   - Habits: No numbers, just patterns (ED-safe)

## Success Metrics

### Technical KPIs
- Chat response time: 1-2 seconds (feels natural)
- Confidence accuracy: >85% on common foods
- App launch: < 1 second
- Crash rate: < 0.5%

### Business KPIs
- Week 1 to paid conversion: >15% (at meal plan reveal)
- Month 1 retention: >70% (habit formation)
- Nutritionist referrals: 20% of new users
- User satisfaction: >4.5 stars

## Competitive Advantages

### Why This Wins

1. **It's Realistic**: Works with McDonald's, not against it
2. **It's Smart**: AI nutritionist, not just a calculator
3. **It's Frictionless**: Text to log, no forms or dropdowns
4. **It's Honest**: Shows confidence scores and ranges
5. **It's Personal**: Learns YOUR patterns, not generic advice
6. **It's Educational**: Evidence-based with citations
7. **It's Inclusive**: ED-safe mode for recovery

### The Tagline Says It All
**"Because nobody wants to meal prep a quinoa bowl"**

This immediately tells users:
- We get real life
- We're not preachy
- We work with your actual habits
- We're different from every other diet app

## Risk Mitigation

### Technical Risks
- **API Costs**: Confidence algorithm reduces unnecessary API calls
- **WhatsApp Integration**: Fallback to in-app if issues
- **App Store Rejection**: Clear health disclaimers, no medical claims
- **Data Privacy**: User controls all data sharing

### Business Risks
- **User Adoption**: Free trial hooks them with personalized insights
- **Retention**: Natural habit formation through existing behaviors (texting)
- **Competition**: Unique positioning - "real life nutrition"
- **Medical Liability**: Clear disclaimers, optional nutritionist oversight

## Development Architecture

### Architecture Guidelines
**CRITICAL**: All iOS development must follow the strict architecture rules defined in **[ARCHITECTURE.md](./ARCHITECTURE.md)**

### Development Progress
For detailed implementation history and decisions made, see **[development-diary.md](./development-diary.md)**

Key requirements:
- **200-line file limit** - Forces modular design
- **MVVM pattern** - Strict separation of concerns
- **Protocol-oriented** - All services have protocols
- **Dependency injection** - No hardcoded dependencies
- **No shortcuts** - Refactor immediately when rules are violated

Before ANY code changes, review the architecture document.

## Next Steps

### Recent Achievements (Session 16)
1. ✅ Daily Goal Selector with 6 goal types
2. ✅ TDEE Calculator with BMR integration
3. ✅ Activity level algorithm (steps + exercise)
4. ✅ Full country picker (195+ countries)
5. ✅ Dynamic calorie targets based on goals

### MVP Focus (Weeks 1-4)
1. Build modular kanban board components (<200 lines each)
2. Implement ChatViewModel with HannahService protocol
3. Create NutritionService for calorie calculations
4. Build TodayViewModel for deficit tracking
5. Add MoodService with proper dependency injection

### The North Star
Every feature should answer: **"Does this work with real life?"**
- No quinoa bowls
- No meal prep shame
- No unrealistic expectations
- Just gradual, sustainable improvement
- **AND follow ARCHITECTURE.md strictly**

## Summary

**Hannah Health** isn't another diet app. It's an AI nutritionist who understands that:
- Sometimes dinner is McDonald's
- Perfect eating isn't realistic
- Small changes add up
- Education beats restriction
- Progress beats perfection

With Hannah, users get a trusted nutritionist in their pocket who works with their real life, not against it. The kanban board interface keeps everything visible and accessible, while the conversational AI makes logging as easy as texting a friend.

The business model is smart: hook users when they see their personalized meal plan after a week of observation, with B2B2C creating a referral engine through nutritionists.

Most importantly, the tagline captures everything: **"Because nobody wants to meal prep a quinoa bowl."**

---

*Mobile-First Initiative Started: January 2025*
*Target Launch: Q2 2025*
*Platform: iOS 15.0+*
*Pricing: $11.99/month or $71.99/year*