# Hannah.health Project Structure Plan

## Overview
This document outlines the recommended folder organization for the Hannah.health project - a dual-mode meal planning application for medical nutrition therapy and eating disorder recovery.

## Root Directory Structure

```
hannah-health/
├── src/
│   ├── components/
│   │   ├── common/           # Shared UI components
│   │   ├── medical/          # Medical-mode specific components
│   │   ├── ed-safe/          # ED-safe mode specific components
│   │   └── dual-mode/        # Components that support both modes
│   ├── pages/
│   │   ├── auth/            # Authentication pages
│   │   ├── onboarding/      # User setup and mode selection
│   │   ├── dashboard/       # Main app dashboard
│   │   ├── meal-planning/   # Meal planning interface
│   │   └── settings/        # User preferences and settings
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API calls and external service integrations
│   ├── store/              # Zustand state management
│   ├── utils/              # Utility functions and helpers
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # App constants and enums
│   └── assets/             # Static assets (images, icons, etc.)
├── public/                 # Static files served directly
├── docs/                   # Project documentation
├── tests/                  # Test files organized by type
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
└── scripts/                # Build and deployment scripts
```

## Detailed Component Organization

### `/src/components/common/`
- Button.tsx
- Input.tsx
- Modal.tsx
- Loading.tsx
- Card.tsx
- Layout.tsx

### `/src/components/medical/`
- NutritionDisplay.tsx
- MacroBreakdown.tsx
- CalorieCounter.tsx
- PortionCalculator.tsx
- NutrientTracking.tsx

### `/src/components/ed-safe/`
- MoodTracker.tsx
- PortionGuide.tsx
- SafeRecipeCard.tsx
- AnxietySupport.tsx
- ProgressIndicator.tsx

### `/src/components/dual-mode/`
- MealCard.tsx
- RecipeDisplay.tsx
- ShoppingList.tsx
- UserProfile.tsx
- Navigation.tsx

### `/src/store/`
- userStore.ts           # User preferences and mode selection
- mealStore.ts          # Meal planning and recipes
- nutritionStore.ts     # Nutrition data and calculations
- shoppingStore.ts      # Shopping list management
- authStore.ts          # Authentication state

### `/src/services/`
- api/
  - auth.ts
  - nutrition.ts
  - recipes.ts
  - user.ts
- external/
  - usda-api.ts
  - stripe.ts
  - analytics.ts

### `/src/utils/`
- nutrition/
  - calculations.ts     # Macro and nutrient calculations
  - conversions.ts      # Unit conversions
  - validation.ts       # Input validation
- formatting/
  - numbers.ts          # Number formatting for different modes
  - dates.ts            # Date utilities
  - strings.ts          # String manipulation
- security/
  - sanitization.ts     # Input sanitization
  - validation.ts       # Security validation

## File Naming Conventions

### Components
- Use PascalCase for component files: `MealCard.tsx`
- Include mode suffix when applicable: `NutritionDisplay.medical.tsx`
- Use descriptive names that indicate purpose

### Hooks
- Prefix with "use": `useNutritionCalculator.ts`
- Use camelCase: `useMealPlanning.ts`

### Services
- Use camelCase: `nutritionApi.ts`
- Group related services in subdirectories

### Utils
- Use camelCase: `calculateMacros.ts`
- Group by functionality in subdirectories

## Special Considerations

### Dual-Mode Architecture
- Components should support both medical and ED-safe modes
- Use feature flags or mode props to switch behavior
- Separate sensitive calculations from display logic

### Security and Privacy
- Store sensitive nutrition calculations in protected utils
- Implement proper input validation at multiple layers
- Keep HIPAA compliance considerations in dedicated files

### Accessibility
- Include aria-labels and semantic HTML in all components
- Test with screen readers
- Maintain proper contrast ratios

### Testing Structure
- Mirror source directory structure in tests
- Include both mode-specific and cross-mode tests
- Test accessibility compliance

## Migration Path
1. Set up basic directory structure
2. Create common components first
3. Implement dual-mode architecture
4. Add mode-specific components
5. Integrate state management
6. Add comprehensive testing

This structure supports the unique dual-mode requirements of Hannah.health while maintaining clean separation of concerns and enabling future scalability.