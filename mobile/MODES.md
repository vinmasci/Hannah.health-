# Hannah Health Tracking Modes

**Created**: January 29, 2025  
**Purpose**: Define different tracking modes for various user needs and safety requirements

## Core Philosophy
Hannah Health adapts to different user needs through specialized tracking modes. Each mode fundamentally changes how the app behaves, what it tracks, and how Hannah (AI) responds.

## Mode 1: ED-Safe Mode (Eating Disorder Recovery)

### Core Principle
**Silent, sterile, safe journaling tool. Zero prompts, zero judgment.**  
We are NOT medical professionals. This mode provides a neutral platform that healthcare providers can guide their patients to use.

### What's Visible
- **Meal Tracking** (visual only)
  - Breakfast ✓ (or empty circle)
  - Lunch ✓ (or empty circle)
  - Dinner ✓ (or empty circle)
  - Snacks ✓ (or empty circle)
  - NO crosses for missed meals
  - NO portion sizes
  - NO food details required

- **Journal Entries**
  - User-initiated only (no prompts)
  - Shows as: "Journal entry - 2:30pm"
  - Expandable to read full entry
  - Deletable by user (full control)
  - NO word counts
  - NO streaks
  - NO reminders

### Hannah's Behavior
- **Food logged**: "Got it" or "Meal logged"
- **No other responses**
- NO encouragement
- NO tips or suggestions
- NO questions about food
- NO celebration messages
- Radio silence by design

### Available Features
- Meal planning (optional - user choice)
- Shopping list (optional - user choice)
- Basic food logging (just the fact they ate)

### Completely Hidden
- ALL numbers (calories, macros, weight)
- ALL goals and targets
- ALL deficit/surplus language
- ALL progress tracking
- ALL nutritional information
- ALL "good/bad" food language
- ALL achievement systems

### Safety Features
- Cannot be switched without verification code
- Designed for healthcare provider oversight
- No triggering language anywhere
- Completely judgment-free

---

## Mode 2: Weight Loss Mode

### Core Principle
**Sustainable, supportive weight loss with full tracking and guidance**

### Target Options
- **0.5 kg/week** (1.1 lbs) - Safe & sustainable
- **0.75 kg/week** (1.65 lbs) - Moderate pace
- NO 1.0 kg/week option (unsustainable and demoralizing)

### What's Tracked
- **Calories** - Full counting with database
- **Macros** - Protein, carbs, fat, fiber
- **Weight** - Optional, user chooses frequency
- **Exercise** - Calories burned
- **Water** - Hydration tracking
- **Steps** - From phone or manual

### Dashboard Shows
- Daily calorie budget
- Calories remaining
- Macro breakdown (circular charts)
- Deficit status
- Quick add buttons

### Hannah's Behavior
- **Morning**: "Good morning! You have 1,850 calories for today"
- **After logging**: "Great choice! 1,200 calories remaining"
- **End of day**: Summary with macros and adherence
- **Encouragement**: Celebrates streaks and goals
- **Bad days**: "Tomorrow is a fresh start"
- Tips based on patterns

### Key Features
- **Deficit Calculator**: BMR × Activity - Target = Daily Calories
- **Progress Page**: Weight graph, measurements, photos
- **Daily Check-ins**: AI summary of the day (future feature)
- **Weekly Reports**: Average deficit, weight trend
- **Food Database**: With confidence scores
- **Barcode Scanner**: Quick product logging

### Safety Features (To Be Added)
- Minimum calorie floor warnings
- Too-rapid loss detection
- Plateau identification
- Maintenance break suggestions

### Available Tools
- Meal planning with calorie counts
- Shopping list with smart suggestions
- Recipe calculator
- Restaurant menu assistance

---

## Initial Release Modes (MVP)

For initial release, we're focusing on two modes:

1. **ED-Safe Mode** - For users in recovery who need a judgment-free logging tool
2. **Weight Loss Mode** - For users with weight loss goals who want full tracking

Other modes (Gain & Recovery, Performance, Maintenance, Medical) will be added based on user feedback and needs.

---

## Future Modes (Post-MVP)

### Mode 3: Gain & Recovery Mode
*For cancer patients, illness recovery, underweight individuals*
- Details to be defined based on medical consultation

### Mode 4: Performance Mode  
*For athletes, bodybuilders, fitness enthusiasts*
- Details to be defined based on user research

### Mode 5: Maintenance Mode
*Just stay healthy, no specific goals*
- Details to be defined

### Mode 6: Medical Mode
*For specific conditions (diabetes, PCOS, etc.)*
- Details to be defined with medical advisors

---

## Implementation Notes

### Current Status (Session 14)
- ✅ Modes documented and defined
- ✅ User profile page created
- ⏳ Mode selection in onboarding
- ⏳ Mode-specific dashboards
- ⏳ ED-Safe dashboard implementation
- ⏳ Weight Loss dashboard implementation

### Mode Switching
- Some modes (ED-Safe) require verification to switch out
- Healthcare provider can lock modes
- Mode affects entire app experience

### Database Fields
```sql
user_profiles.tracking_mode: 
  - 'ed_safe'
  - 'weight_loss'
  - 'gain_recovery'
  - 'performance'
  - 'maintenance'
  - 'medical'

user_profiles.mode_locked: Boolean
user_profiles.mode_lock_code: Text (hashed)
```

### Profile Fields (Session 14)
Currently collecting:
- `full_name` - What to call the user
- `birth_date` - Year only (stored as YYYY-01-01)
- `height_cm` - Converted from feet/inches input

Still needed:
- `tracking_mode` - User's selected mode
- `weight_kg` - Optional weight tracking
- `target_weight_kg` - For weight loss mode
- `weekly_target` - 0.5 or 0.75 kg/week

### UI Changes by Mode
- ED-Safe: Completely different dashboard
- Others: Show/hide elements based on mode
- Hannah's personality adapts per mode

---

*Last Updated: January 29, 2025*
*Next: Define remaining modes in detail*