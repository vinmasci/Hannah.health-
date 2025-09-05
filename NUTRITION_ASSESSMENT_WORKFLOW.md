# Hannah.PT Nutrition Assessment & Meal Planning Workflow

## Architecture Principles

### 🏗️ MODULAR ARCHITECTURE REQUIREMENTS
1. **No Massive Files**: Each component should be < 300 lines
2. **Single Responsibility**: Each module handles ONE specific task
3. **Event-Driven Communication**: Components communicate via EventBus, not direct calls
4. **Self-Contained**: Each component manages its own state and UI
5. **Reusable**: Components should be reusable in different contexts
6. **Clear Interfaces**: Well-defined input/output via events

### File Structure
```
/components/
  ├── AIUserAssessment.js      (Step 1: Questions - ~350 lines)
  ├── AIDisplayColumn.js        (Step 2: Calculations - ~250 lines)
  ├── AIMealSuggestions.js      (Step 3: Suggestions - TBD)
  ├── NutritionWorkflow.js      (Orchestrator - ~400 lines)
  └── BoardPopulator.js         (Step 4: Auto-fill - TBD)

/services/
  ├── NutritionCalculator.js    (BMI, TDEE calculations)
  ├── MacroCalculator.js         (Macro distribution logic)
  ├── MealSuggestionEngine.js    (AI meal generation)
  └── EventBus.js                (Communication hub)
```

## Column Layout

The three columns appear in this specific order:
```
[Step 2: Results] | [Step 1: Assessment] | [Step 3: Suggestions] | [Day Columns...]
     (Left)       |      (Center)        |      (Right)        |
```

- **Step 1 (Center)**: Conversational AI assessment - always visible
- **Step 2 (Left)**: Live calculation display - appears as user answers
- **Step 3 (Right)**: Meal suggestions - appears after assessment complete

## Overview
Hannah.PT has pivoted from a manual meal planning tool to an AI-driven nutrition assessment and personalized meal planning system. The new workflow consists of 4 distinct steps, with the first 3 having their own columns.

## The 4-Step Process

### Step 1: User Assessment (Data Collection)
**Component:** `AIUserAssessment.js`
**Purpose:** Gather comprehensive user data through an interactive questionnaire

#### Data Collected:
- **Personal Stats**
  - Age, Gender
  - Height (cm/ft)
  - Weight (kg/lbs)
  - → Used to calculate BMI

- **Activity Level**
  - Job type (sedentary → physical labor)
  - Exercise frequency (never → daily)
  - Exercise types (cardio, strength, sports, yoga)
  - → Used to determine activity multiplier for TDEE

- **Goals**
  - Primary goal (lose weight, maintain, gain muscle, gain weight, general health)
  - Target rate of change
  - → Used to adjust calorie targets

- **Dietary Preferences**
  - Diet type (regular, vegetarian, vegan, pescatarian, keto, paleo)
  - Allergies (dairy, gluten, nuts, shellfish, eggs, soy)
  - Food dislikes
  - → Used to filter meal suggestions

### Step 2: Calculations Display
**Component:** `AIDisplayColumn.js` (modified)
**Purpose:** Show calculated nutrition metrics

#### Calculations:
- **BMI (Body Mass Index)**
  ```
  BMI = weight(kg) / height(m)²
  Classification:
  - < 18.5: Underweight
  - 18.5-24.9: Normal
  - 25-29.9: Overweight
  - ≥ 30: Obese
  ```

- **TDEE (Total Daily Energy Expenditure)**
  Using Mifflin-St Jeor Equation:
  ```
  Men: BMR = (10 × weight[kg]) + (6.25 × height[cm]) - (5 × age) + 5
  Women: BMR = (10 × weight[kg]) + (6.25 × height[cm]) - (5 × age) - 161
  
  TDEE = BMR × Activity Multiplier
  ```
  
  Activity Multipliers:
  - Sedentary (little/no exercise): 1.2
  - Lightly active (1-2 days/week): 1.375
  - Moderately active (3-4 days/week): 1.55
  - Very active (5-6 days/week): 1.725
  - Extra active (daily): 1.9

- **Target Calories**
  Based on goal:
  - Lose weight: TDEE - 500 (for ~1 lb/week loss)
  - Maintain: TDEE
  - Gain muscle: TDEE + 300 (lean bulk)
  - Gain weight: TDEE + 500

- **Macro Distribution**
  Varies by goal:
  
  | Goal | Protein | Carbs | Fat |
  |------|---------|-------|-----|
  | Lose Weight | 30% | 35% | 35% |
  | Maintain | 25% | 45% | 30% |
  | Gain Muscle | 30% | 45% | 25% |
  | Gain Weight | 25% | 45% | 30% |

### Step 3: Meal Suggestions
**Component:** `AIMealSuggestions.js` (to be created)
**Purpose:** Generate AI-powered meal suggestions based on calculated macros

#### Features:
- Meal options for each meal type:
  - Breakfast (5 options)
  - Morning Snack (3 options)
  - Lunch (5 options)
  - Afternoon Snack (3 options)
  - Dinner (5 options)
  - Evening Snack (3 options)

- Each suggestion includes:
  - Food name
  - Portion size
  - Calories
  - Macro breakdown
  - Thumbs up/down feedback buttons

- AI considers:
  - User's dietary restrictions
  - Macro targets
  - Food variety
  - User feedback (learns preferences)

### Step 4: Kanban Population
**Component:** Auto-population logic in `DayMealManager.js`
**Purpose:** Automatically fill the meal planning board with approved suggestions

#### Process:
1. User approves meals from Step 3
2. System calculates weekly meal plan
3. Auto-populates each day with approved meals
4. User can still manually adjust if needed

## Data Flow

```
Step 1 (Assessment) 
    ↓ emits 'assessment:complete'
Step 2 (Display)
    - Shows BMI, TDEE, Target Calories, Macros
    ↓ emits 'targets:calculated'
Step 3 (Suggestions)
    - Uses targets to generate meals
    - Collects user feedback
    ↓ emits 'meals:approved'
Step 4 (Population)
    - Fills kanban board
```

## Event Bus Communication

### Events Emitted:
- `assessment:update` - Partial data during questionnaire
- `assessment:complete` - Full assessment data with calculations
- `targets:calculated` - TDEE and macro targets
- `meal:suggested` - Individual meal suggestion
- `meal:approved` - User approved a meal
- `meal:rejected` - User rejected a meal
- `plan:ready` - Complete meal plan ready for kanban

## Technical Architecture

### Removed Components:
- Category pills (no longer needed)
- Manual food dragging from categories
- Direct food search

### Modified Components:
- `AISearchColumn` → `AIUserAssessment`
- `AIDisplayColumn` → Shows calculations instead of search results
- `DayMealManager` → Adds auto-population capability

### New Components:
- `AIUserAssessment.js` - Questionnaire system
- `AIMealSuggestions.js` - Meal suggestion engine (TBD)
- `NutritionCalculator.js` - Enhanced with TDEE/BMI calculations

## Benefits of New Approach

1. **Personalized**: Every meal plan is tailored to individual needs
2. **Scientific**: Based on proven nutrition formulas (Mifflin-St Jeor, macro distributions)
3. **Simplified**: Users don't need nutrition knowledge
4. **Adaptive**: Learns from user feedback
5. **Comprehensive**: Considers all factors (activity, goals, preferences)

## Future Enhancements

- Recipe database integration
- Progress tracking over time
- Grocery list generation
- Nutrition education tooltips
- Social sharing of meal plans
- Integration with fitness trackers
- Barcode scanning for actual intake tracking

## Migration Notes

For existing users:
1. Hide category pills (done)
2. Create assessment flow (done)
3. Modify display column (pending)
4. Create suggestions column (pending)
5. Implement auto-population (pending)

The system maintains backward compatibility - users can still manually adjust meals after auto-population.