# Kanban Meal Planner App

## What it is
A Kanban-style meal planner where you drag meals (or meal elements like Protein/Carb/Veg) into daily slots and a live scoreboard updates calories, macros, and cost in real time. Think Trello meets MyFitnessPal, but visual and fast.

## Core Goals
- Make planning visual, tactile, and fast (swap foods by dragging, instant totals)
- Keep it modular (swap rice ↔ quinoa, chicken ↔ salmon) without rebuilding meals
- Add budget awareness (cost per serve + daily/weekly spend)
- Generate shopping lists from the plan with correct quantities

## Primary UI

### Columns
Either Breakfast / Lunch / Dinner / Snacks or Mon–Sun (weekly board)

### Left Library
Tabs for Proteins • Carbs • Veg • Extras (drag elements onto a day/meal)

### Cards
Compact meal/element cards showing kcal • P • C • F • $ with quick actions Swap / Info

### Scoreboard
Sticky at top: daily totals for kcal, protein, carbs, fat, cost; turn green when on target

## Interaction Model
- **Drag from Library** → drop into a meal slot (totals update instantly)
- **Tap Swap** on a slot to choose a compatible alternative (e.g., Rice → Quinoa)
- **Delete/drag out** to subtract
- **Undo** (snackbar)
- **Optional** weekly view with drag across days

## Data Model (Minimal)

```typescript
FoodItem: {
  id: string,
  name: string,
  servingDesc: string,
  macrosPerServing: {
    kcal: number,
    protein: number,
    carbs: number,
    fat: number,
    cost: number
  },
  tags: ['protein' | 'carb' | 'veg' | 'extra'],
  upc?: string
}

MealSlot: {
  id: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
  items: FoodItem[]
}

DayPlan: {
  date: Date,
  slots: MealSlot[],
  totals: Macro // computed on the fly
}
```

## Power Features (Phase 2+)
- **Barcode scanning** → auto-fill nutrition via Open Food Facts/Nutritionix
- **Shopping list** → aggregate ingredients across the week with quantities
- **Targets** → user sets kcal/macros; scoreboard shows on/off target
- **Budget mode** → weekly spend cap; suggests cheaper swaps
- **Health sync** (iOS/Android): write dietary energy & macros to Health/Google Fit; read steps/active energy to show net calories
- **Streaks/badges** → light gamification for consistency

## Tech Stack Options

### Web (Fastest to Ship)
- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind + either:
  - shadcn/ui (premium, "buttery" feel) or
  - daisyUI (quick, themed)
- **Drag & Drop:** dnd-kit for smooth drag-and-drop
- **State Management:** Zustand for local UI state, TanStack Query for server data
- **Backend:** Supabase or Firebase (auth + DB + storage)

### Mobile (Later, Buttery Native Feel)
- **iOS:** Swift/SwiftUI + HealthKit
- **Android:** Kotlin/Compose + Health Connect
- **Database:** Local DB (Core Data/Room), sync to Supabase/Firebase

## MVP Build Plan (Pragmatic)

### Week 1
1. Board with columns + Library (drag FoodItems into MealSlots)
2. Live Scoreboard (kcal/P/C/F/$ recomputed on drop)
3. Manual FoodItem CRUD (name, serving, macros, cost)
4. Save/load DayPlan (persist to DB)

### Week 2
5. Swap modal filtered by tag (Protein/Carb/Veg)
6. Weekly board (Mon–Sun) + per-day totals + weekly totals
7. Shopping-list export (ingredients aggregated per week)

### Week 3 (Nice-to-Haves)
8. Barcode scan (web or mobile) → prefill macros
9. Targets (kcal/macros) + green "on target" indicators
10. Basic reporting (trend of kcal/macros/cost)

## Why It's Different
- **Visual + modular:** plan by elements, not rigid recipes; swapping keeps totals accurate
- **Budget-aware:** cost per serve + daily/weekly spend at a glance
- **Frictionless:** frozen veg and pre-portioned items fit naturally; instant recalculation

## Security & Privacy (Baseline)
- Email/password or social login via Supabase/Firebase
- All nutrition and plan data user-scoped with row-level security
- Health data (if mobile) is permissioned and stored locally; only aggregate totals sync (optional)

## Future Integrations
- Import recipes from URLs (parse ingredients + macros)
- Price suggestions (user-entered or sourced estimates)
- Community templates (share boards/meals)
- "Coach mode" (invite a coach to view/annotate a weekly board)

## TL;DR
Drag food elements onto a Kanban board to build meals, and watch a live calorie/macro/cost scoreboard update. Swap anything instantly, generate a shopping list, and (later) sync with Health for net calories. Built with React/Vite/TypeScript + Tailwind + dnd-kit, backed by Supabase/Firebase.