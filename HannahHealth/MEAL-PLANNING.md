# Hannah Health Meal Planning & Shopping List

## Overview
Hannah Health includes an AI-powered meal planning system that generates personalized weekly meal plans and automatically creates shopping lists from the planned meals. The system uses the "Week 1 Magic" concept - unlocking after 7 days of food tracking to learn user preferences.

## Meal Planning System

### Features
- **7-Day Meal Plans**: Complete weekly schedule with breakfast, lunch, dinner, and snacks
- **AI Generation**: ChatGPT creates personalized plans based on user requests
- **Nutritional Balance**: Each meal includes calories and macro tracking
- **Progress Tracking**: Visual day-by-day navigation with completion checkboxes
- **Week 1 Magic**: Unlocks after 7 days of consistent tracking

### User Interface

#### Visual Design
- **Dynamic Background**: Time-of-day gradient backgrounds (sunrise, midday, sunset, midnight)
- **Glass Morphism**: Transparent black cards (50% opacity) with subtle borders
- **Color Scheme**:
  - Breakfast: Sky 400 (#38BDF8) with sunrise icon
  - Lunch: Amber 400 (#F59E0B) with sun icon
  - Dinner: Indigo 400 (#6366F1) with moon icon
  - Snack: Emerald 400 (#10B981) with leaf icon

#### Components
1. **Week Selector**: Date range display with refresh button
2. **Day Tabs**: Scrollable pills showing week days, today highlighted
3. **Meal Cards**: Individual meal displays with:
   - Meal type icon and time
   - Food name and description
   - Calorie count and macros (P/C/F)
   - Completion checkbox
   - Optional notes
4. **Weekly Goals Card**: Target calories, protein, carbs, fat, and deficit

### Data Structure

```swift
struct MealPlan {
    let id: String
    let userId: String
    let weekStartDate: Date
    let planData: MealPlanData
    let isActive: Bool
}

struct PlannedMeal {
    let mealType: String // breakfast, lunch, dinner, snack
    let name: String
    let calories: Int
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let time: String? // "8:00 AM"
    let notes: String?
    let isCompleted: Bool
}
```

### Chat Integration
Users can request meal plans through natural language:
- "Create me a high protein meal plan"
- "Make me a vegetarian weekly plan"
- "Plan my meals for weight loss"
- "Update my meal plan with low carb options"

The chat detects meal plan keywords and triggers the generation flow.

## Shopping List System

### Features
- **Automatic Generation**: Extracts ingredients from weekly meal plan
- **Smart Consolidation**: Groups duplicate items and combines quantities
- **Category Organization**: Groups by produce, proteins, dairy, grains, etc.
- **Progress Tracking**: Visual ring showing shopping completion percentage
- **Check-off System**: Tap items to mark as purchased
- **Custom Items**: Add items not from meal plan

### Categories
- **Produce**: Fruits and vegetables (Mint color)
- **Proteins**: Meat, fish, tofu (Coral color)
- **Dairy & Eggs**: Milk products (Sky color)
- **Grains & Bread**: Rice, pasta, bread (Amber color)
- **Pantry**: Non-perishables (Lavender color)
- **Frozen**: Frozen foods (Sky blue)
- **Beverages**: Drinks (Ocean color)
- **Snacks**: Snack items (Emerald color)

### User Interface

#### Components
1. **Header Card**: 
   - "Week's Groceries" title
   - Item count and completion stats
   - Progress ring (0-100%)

2. **Category Filter Pills**: 
   - "All" option
   - Individual category filters
   - Selected state with emerald highlight

3. **Category Sections**:
   - Category icon and name
   - Item count badge
   - Grouped items with checkboxes
   - Strikethrough for completed items

4. **Item Actions**:
   - Tap checkbox to mark complete
   - Delete button appears when checked
   - Add custom item button at bottom

### Ingredient Extraction

The system automatically maps meals to ingredients:

```swift
"Greek Yogurt with Berries" → 
  - Greek Yogurt (1 container) - Dairy
  - Mixed Berries (1 cup) - Produce

"Grilled Chicken Salad" →
  - Chicken Breast (6 oz) - Proteins
  - Mixed Greens (2 cups) - Produce
  - Cherry Tomatoes (1 cup) - Produce
  - Salad Dressing - Pantry
```

## Database Integration

### Supabase Tables

#### meal_plans
- Stores complete weekly meal plans in JSONB format
- Links to user profiles
- Tracks active/inactive status

#### food_entries
- Records when planned meals are completed
- Links to meal plan for tracking adherence
- Stores actual vs planned nutrition

### Data Flow
1. User requests meal plan via chat
2. AI generates 7-day plan
3. Plan saved to Supabase
4. Shopping list auto-generates from plan
5. User checks off items as purchased
6. User marks meals complete as eaten

## Implementation Files

### Core Models
- `/Core/Models/MealPlan.swift` - Meal plan data structures
- `/Core/Models/ShoppingItem.swift` - Shopping list items

### ViewModels
- `/Features/MealPlan/MealPlanViewModel.swift` - Meal plan logic
- `/Features/Shopping/ShoppingListViewModel.swift` - Shopping list logic

### Views
- `/Features/MealPlan/MealPlanView.swift` - Meal plan UI
- `/Features/Shopping/ShoppingListView.swift` - Shopping list UI

### Chat Integration
- `/Features/Chat/ChatViewModel.swift` - Handles meal plan requests

## Future Enhancements

1. **Smart Suggestions**: AI learns preferences over time
2. **Recipe Details**: Full cooking instructions for each meal
3. **Grocery Store Integration**: Direct ordering or store maps
4. **Meal Prep Mode**: Batch cooking instructions
5. **Leftover Tracking**: Plan meals using leftovers
6. **Budget Optimization**: Cost-aware meal planning
7. **Dietary Restrictions**: Allergy and preference filters
8. **Family Plans**: Scale recipes for multiple people

## User Journey

1. **Week 1**: User tracks meals naturally for 7 days
2. **Unlock**: "Week 1 Magic" activates after consistent tracking
3. **Generation**: User requests personalized meal plan via chat
4. **Review**: Browse weekly plan with beautiful UI
5. **Shop**: Auto-generated shopping list organized by store layout
6. **Cook**: Check off meals as completed
7. **Iterate**: AI improves suggestions based on adherence

## Design Philosophy

The meal planning system follows Hannah Health's core principles:
- **Beautiful UI**: Glass morphism with dynamic backgrounds
- **Intelligent**: AI-powered personalization
- **Seamless**: Integrated with chat and food tracking
- **Practical**: Real ingredients, realistic portions
- **Motivating**: Visual progress and achievements